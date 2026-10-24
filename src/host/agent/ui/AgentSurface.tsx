/**
 * Agent 入口（右下保留格）：右下角 56×56 orb → 半高语音窗 → 全高对话面板。
 * 三态是同一物件的连续变化，几何全部由 `entryGeometry` 从桌面栅格推导（不写像素）。
 *
 * v0.3.7 语音优先（取代 v0.3.0「发送后自动升级到 chat」的行为）：
 * - 语音是主入口：点按/空格立即录音；一轮结束后**留在半高语音窗**继续下一轮，
 *   不再自动 morph 到全高。文字对话是兜底，必须显式「展开对话」才进入全高浮栏。
 * - 半高窗是纯语音形态：没有文字输入框；录音 / 转写 / 回答都在这一层完成。
 * - 空格默认永远是「按住说话」：展开/收起/语音结束都**不**把焦点塞进输入框，
 *   只有用户主动点进全高浮栏的输入框（或 Tab 进去）时空格才是打字。
 * - 全高浮栏的输入区是单行：[语音] [输入] [发送]。
 *
 * 三态共享同一个容器与同一个 DOM：只改宽高，右/下缘锚点不变（HIG §9 连续性）。
 * 语音窗与对话面板的内容层各自按**自己的固定尺寸**排版并锚在容器右下角，
 * 因此切换只改容器形态：草稿（Composer 内部 state）、滚动位置（MessageList 滚动区
 * 尺寸不变）、正在进行的生成（session 不属于任何一个容器）都不会被重启或重置。
 * UI 只消费 useAgentSession 暴露的状态与动作，不直接碰 recorder / ttsPlayer。
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Text,
  ToggleButton,
  Tooltip,
  makeStyles,
  motionTokens,
  tokens,
} from '@fluentui/react-components';
import {
  AddRegular,
  AlertRegular,
  ChatSparkleRegular,
  CheckmarkRegular,
  ChevronDownRegular,
  ChevronUpRegular,
  DismissRegular,
  MicRegular,
  MoreHorizontalRegular,
  SettingsRegular,
  SoundWaveCircleRegular,
  Speaker2Regular,
  SpeakerMuteRegular,
  StopRegular,
} from '@fluentui/react-icons';
import {
  useAgentSession,
  type AgentSeed,
  type AgentSession,
} from '../hooks/useAgentSession';
import type { AgentTransport } from '../types';
import { messageBlocks } from '../types';
import { AgentAlerts } from './AgentAlerts';
import { Composer } from './Composer';
import { useAgentSurfaceGeometry } from './entryGeometry';
import { MessageList } from './MessageList';
import { MicPermissionCard } from './MicPermissionCard';
import { PeekMotionPips } from './PeekMotionPips';
import { PeekText } from './PeekText';
import { PendingLine } from './PendingLine';
import { RecordingPill } from './RecordingPill';
import { SettingsDialog } from './SettingsDialog';
import { StoppedNotice } from './StoppedNotice';
import { hasVisibleText, peekTextOf, turnPhase, turnStartedAt } from './turnPhase';
import { useMicState } from './micPermission';
import { useReducedMotion } from './useReducedMotion';
import {
  IDLE_POINTER_MOVE_THRESHOLD,
  STREAM_END_ECHO_MS,
  useIdleCollapse,
} from './useIdleCollapse';
import { MIN_VOICE_MS, useVoiceGesture, type VoiceGesture } from './useVoiceGesture';
import { useVoiceControls } from './useVoiceControls';
import { VoiceCapture } from './VoiceCapture';
import type { SurfaceStage } from './types';
import { EMPTY_STATE_ICON_SIZE_LARGE } from '../../design/metrics';
import './agent.css';

/** 空格按住不足 300ms 视为误触，取消录音 */
const SPACE_HOLD_CANCEL_MS = 300;
/** 展开后内容淡入的等待：图标先 80ms 淡出 */
const ENTRY_FADE_OUT_DELAY = motionTokens.durationFaster;
/** 减少动态效果下唯一保留的过渡：淡入淡出（时长取 motionTokens，不写字面毫秒） */
const REDUCED_FADE_MS = motionTokens.durationUltraFast;
/**
 * 半高 peek 的条数上限 = 2。
 * 容量算式（契约 §1）：340 − voiceTop 56 − voiceDock 92 ≈ 192 可用；一条「3 行」气泡
 * = 3 × 20 行高 + 2 × 4 内衬 = 68，两条 + 间距 8 = 144 放得下，三条 + 2 × 8 = 220 放不下。
 */
const PEEK_MESSAGE_LIMIT = 2;

export interface AgentSurfaceProps {
  /** 注入传输层（测试或截图用）；不传按 URL 参数创建 */
  transport?: AgentTransport;
  /** 测试或截图用的初始会话 */
  seed?: AgentSeed;
  /** 受控打开全高对话（设置页「打开 Agent」/ `?agent=1` 用） */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 无桌面入口时（如设置页内的实例）：不渲染右下角按钮 */
  hideEntry?: boolean;
  /** 测试或截图：初始打开 Agent 设置对话框 */
  defaultSettingsOpen?: boolean;
}

type MorphKind = 'open-voice' | 'open-chat' | 'back-voice' | 'back-collapsed' | 'close-chat';

interface MorphSpec {
  geometry: { duration: number; curve: string };
  content: { duration: number; delay: number; curve: string };
  entry: { duration: number; delay: number; curve: string };
  /** 离开该层时的 fade 时长（chat / voice 交叉淡出） */
  paneExit: number;
}

/**
 * 三段 morph 的时长/曲线（全部来自 motionTokens）：
 * 进入 `durationNormal` + `curveDecelerateMid`，离开 `durationNormal` + `curveAccelerateMid`；
 * 只变宽高，右下锚点与内容层的排版尺寸不变。
 */
const MORPH: Record<MorphKind, MorphSpec> = {
  'open-voice': {
    geometry: { duration: motionTokens.durationNormal, curve: motionTokens.curveDecelerateMid },
    content: { duration: motionTokens.durationFast, delay: ENTRY_FADE_OUT_DELAY, curve: motionTokens.curveDecelerateMid },
    entry: { duration: motionTokens.durationFaster, delay: 0, curve: motionTokens.curveDecelerateMid },
    paneExit: 0,
  },
  'open-chat': {
    geometry: { duration: motionTokens.durationNormal, curve: motionTokens.curveDecelerateMid },
    content: { duration: motionTokens.durationFast, delay: 0, curve: motionTokens.curveDecelerateMid },
    entry: { duration: motionTokens.durationFaster, delay: 0, curve: motionTokens.curveDecelerateMid },
    paneExit: 0,
  },
  'back-voice': {
    geometry: { duration: motionTokens.durationNormal, curve: motionTokens.curveAccelerateMid },
    content: { duration: motionTokens.durationFast, delay: 0, curve: motionTokens.curveAccelerateMid },
    entry: { duration: 0, delay: 0, curve: motionTokens.curveLinear },
    paneExit: motionTokens.durationFaster,
  },
  'back-collapsed': {
    geometry: { duration: motionTokens.durationNormal, curve: motionTokens.curveAccelerateMid },
    content: { duration: motionTokens.durationFaster, delay: 0, curve: motionTokens.curveAccelerateMid },
    entry: { duration: motionTokens.durationFast, delay: motionTokens.durationFaster, curve: motionTokens.curveDecelerateMid },
    paneExit: motionTokens.durationFaster,
  },
  'close-chat': {
    geometry: { duration: motionTokens.durationNormal, curve: motionTokens.curveAccelerateMid },
    content: { duration: motionTokens.durationFaster, delay: 0, curve: motionTokens.curveAccelerateMid },
    entry: { duration: motionTokens.durationFast, delay: motionTokens.durationFaster, curve: motionTokens.curveDecelerateMid },
    paneExit: motionTokens.durationFaster,
  },
};

function isEditableTarget(target: HTMLElement): boolean {
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/**
 * 焦点停在「会持续输入的控件」上时不计时：输入框 / 文本域（`isEditableTarget`）之外，
 * Fluent 的开关与下拉在各宿主里是 `[role="switch"]` / `[role="combobox"]` / `[role="listbox"]`。
 */
function isIdleBlockingFocus(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (isEditableTarget(target)) return true;
  return Boolean(target.closest('[role="switch"], [role="combobox"], [role="listbox"]'));
}

/**
 * 任意 Fluent Dialog / 菜单 / 下拉列表展开中 = 不计时。
 * 它们都经 Portal 挂成 `document.body` 的直接子节点，所以这个选择器能一网打尽，
 * 不必逐个组件去登记开合状态。
 */
const FLUENT_OVERLAY_SELECTOR = '[role="dialog"], [role="menu"], [role="listbox"]';

/**
 * 空格守卫：默认放行 → 按住说话；只在这些地方不响应：
 * - 输入控件（input / textarea / contenteditable）——用户在打字；
 * - 外部弹层（菜单 / 对话框 / 设置对话框，Fluent Portal 在 surface 之外）；
 * - 其它按钮 / 链接——空格是它们的激活键；
 * 入口按钮、半高窗「点击说话」按钮与 peek 区例外：它们本身就是语音入口。
 */
function canUseVoiceKeys(event: KeyboardEvent, surface: HTMLElement | null): boolean {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return true;
  if (isEditableTarget(target)) return false;

  const insideSurface = Boolean(surface?.contains(target));
  if (!insideSurface && target.closest('[role="dialog"], [role="menu"], [role="listbox"]')) {
    return false;
  }
  if (
    target.closest(
      '[data-wtsl-agent-entry], [data-wtsl-agent-talk], [data-wtsl-agent-peek]',
    )
  ) {
    return true;
  }
  return !target.closest('button, [role="button"], a[href]');
}

/** 内联 CSS 变量：三态几何由 entryGeometry 从栅格推导，CSS 只负责形态、材质与过渡 */
type SurfaceVars = CSSProperties & {
  '--wtsl-agent-inset-right': string;
  '--wtsl-agent-inset-bottom': string;
  '--wtsl-agent-width': string;
  '--wtsl-agent-height': string;
};

const useStyles = makeStyles({
  contentLayer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    minHeight: 0,
    opacity: 0,
  },
  /**
   * 两个内容层都按**自己的固定尺寸**锚在容器右下角（尺寸由 entryGeometry 注入），
   * 不随外框缩放而重排：切换形态只改变被看见的那一块，滚动位置与排版都不动。
   */
  pane: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    paddingInline: tokens.spacingHorizontalL,
    paddingBlock: tokens.spacingVerticalS,
    flex: '0 0 auto',
  },
  headerMark: {
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
  },
  headerSpacer: {
    flex: 1,
  },
  menuAnchor: {
    display: 'inline-flex',
  },
  composerHost: {
    flex: '0 0 auto',
    paddingInline: tokens.spacingHorizontalL,
    paddingBlockEnd: tokens.spacingVerticalL,
    paddingBlockStart: tokens.spacingVerticalS,
  },
  /** 麦克风授权卡在全高对话里的落位（输入区上方，与输入区内衬对齐） */
  micHost: {
    flex: '0 0 auto',
    paddingInline: tokens.spacingHorizontalL,
    paddingBlockEnd: tokens.spacingVerticalS,
  },
  // ---- 半高纯语音窗 ----
  voiceTop: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    paddingInline: tokens.spacingHorizontalL,
    paddingBlock: tokens.spacingVerticalS,
    flex: '0 0 auto',
  },
  voiceSpacer: {
    flex: 1,
  },
  // 半高窗里的近期消息 peek：底部对齐、顶部渐隐；整块点击展开对话
  peekArea: {
    flex: '1 1 auto',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    gap: tokens.spacingVerticalS,
    overflow: 'hidden',
    paddingInline: tokens.spacingHorizontalL,
    paddingBlock: tokens.spacingVerticalS,
    cursor: 'pointer',
    borderRadius: tokens.borderRadiusXLarge,
    maskImage: 'linear-gradient(to bottom, transparent 0%, black 22%)',
    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 22%)',
    ':focus-visible': {
      outlineColor: tokens.colorStrokeFocus2,
      outlineStyle: 'solid',
      outlineWidth: tokens.strokeWidthThick,
      outlineOffset: `calc(${tokens.strokeWidthThick} * -1)`,
    },
  },
  peekAreaBusy: {
    cursor: 'default',
  },
  // 空态没有旧消息需要顶部渐隐：关掉 mask，静态锚点的外环不被切掉上缘
  peekAreaEmpty: {
    maskImage: 'none',
    WebkitMaskImage: 'none',
  },
  peekRow: {
    display: 'flex',
    minWidth: 0,
  },
  peekRowUser: {
    justifyContent: 'flex-end',
  },
  /**
   * 气泡列：过程点**在气泡之外**（气泡自己的 `-webkit-line-clamp: 3` 是文本契约，
   * 把点塞进气泡会占掉一行正文）。宽度上限 86% 提到这一层，气泡本身撑满它。
   */
  peekStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
    maxWidth: '86%',
  },
  peekBubble: {
    maxWidth: '100%',
    paddingInline: tokens.spacingHorizontalS,
    paddingBlock: tokens.spacingVerticalXS,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground2,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
  peekBubbleUser: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorNeutralForeground1,
  },
  // 半高空态：可点的麦克风圆钮（96 触控目标）+ 两层细环；纯静态构图，不做循环呼吸/脉冲。
  voiceEmpty: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceMarkGroup: {
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    width: '96px',
    height: '96px',
    flexShrink: 0,
  },
  /**
   * 唯一保留的一句提示：只说**看不见的那条路径**。
   * 圆钮的形状/图标/Tooltip 已经把「点一下说话」表达完了，但「按住空格」没有形状可依，
   * 只能写出来（`aria-keyshortcuts` 对看得见的人不存在）。不再写「说点什么，或…」的整句。
   */
  voiceMarkHint: {
    marginBlockStart: tokens.spacingVerticalL,
    color: tokens.colorNeutralForeground3,
  },
  voiceMarkRing: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: tokens.borderRadiusCircular,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke3}`,
    pointerEvents: 'none',
  },
  voiceMarkRingInner: {
    width: '132px',
    height: '132px',
  },
  voiceMarkRingOuter: {
    width: '168px',
    height: '168px',
  },
  /**
   * 半高窗的唯一主操作：圆形麦克风按钮（96×96，远大于 44 触控下限）。
   *
   * 形态承担语义：可点的圆 + 麦克风图形 + 品牌色前景；不再写「点击说话」或
   * 「说点什么，或按住空格」。悬停/按压/键盘焦点三态齐全（HIG §13.3 按压态是硬要求），
   * 读屏名字与鼠标提示由 aria-label / Tooltip 承担，键盘快捷键由 `aria-keyshortcuts` 声明。
   */
  voiceMarkButton: {
    display: 'grid',
    placeItems: 'center',
    width: '96px',
    height: '96px',
    padding: 0,
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralBackground2,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    color: tokens.colorBrandForeground1,
    cursor: 'pointer',
    transitionProperty: 'background-color, border-color',
    transitionDuration: tokens.durationFaster,
    transitionTimingFunction: tokens.curveEasyEase,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2Hover,
      border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1Hover}`,
    },
    ':active': {
      backgroundColor: tokens.colorNeutralBackground2Pressed,
      border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1Pressed}`,
    },
    ':focus-visible': {
      outlineColor: tokens.colorStrokeFocus2,
      outlineStyle: 'solid',
      outlineWidth: tokens.strokeWidthThick,
      outlineOffset: tokens.strokeWidthThick,
    },
    ':disabled': {
      color: tokens.colorNeutralForegroundDisabled,
      cursor: 'default',
    },
  },
  voiceDock: {
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    paddingInline: tokens.spacingHorizontalL,
    paddingBlockStart: tokens.spacingVerticalS,
    paddingBlockEnd: tokens.spacingVerticalL,
  },
  voiceCard: {
    display: 'flex',
    alignItems: 'center',
    paddingInline: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalXS,
    borderRadius: tokens.borderRadiusXLarge,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  // ---- 入口按钮 ----
  entryLayer: {
    position: 'absolute',
    // 盖住 1px 描边：入口按钮与容器同为 56×56
    inset: `calc(${tokens.strokeWidthThin} * -1)`,
    zIndex: 2,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 'inherit',
  },
  entryButton: {
    display: 'grid',
    placeItems: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
    border: 'none',
    borderRadius: 'inherit',
    backgroundColor: 'transparent',
    color: tokens.colorBrandForeground1,
    cursor: 'pointer',
    transitionProperty: 'background-color, transform',
    transitionDuration: `${motionTokens.durationFaster}ms`,
    transitionTimingFunction: motionTokens.curveEasyEase,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
    ':active': {
      backgroundColor: tokens.colorNeutralBackground1Pressed,
      transform: 'scale(0.98)',
    },
    ':focus-visible': {
      outlineColor: tokens.colorStrokeFocus2,
      outlineStyle: 'solid',
      outlineWidth: tokens.strokeWidthThick,
      outlineOffset: `calc(${tokens.strokeWidthThick} * -2)`,
    },
  },
  micErrorBadge: {
    position: 'absolute',
    top: tokens.spacingVerticalXS,
    right: tokens.spacingHorizontalXS,
    display: 'grid',
    placeItems: 'center',
    color: tokens.colorStatusDangerForeground1,
    pointerEvents: 'auto',
  },
  /**
   * 折叠态浮层（录音胶囊 / 麦克风授权卡 / 一次性提示）：贴在 orb 上缘上方，
   * 右缘与三态锚点对齐。容器自身只有 56×56，所以浮层画在它外面（collapsed 时 overflow 可见）。
   */
  floatLayer: {
    position: 'absolute',
    right: 0,
    bottom: `calc(100% + ${tokens.spacingVerticalM})`,
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: tokens.spacingVerticalS,
    pointerEvents: 'auto',
  },
  notice: {
    paddingInline: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusXLarge,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow16,
  },
  /** 录音态 orb：品牌底 + 反白图标 + 一圈品牌色描边（静态，不做循环呼吸） */
  entryRecording: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    boxShadow: `0 0 0 ${tokens.strokeWidthThick} ${tokens.colorBrandStroke1}`,
    ':hover': {
      backgroundColor: tokens.colorBrandBackgroundHover,
    },
    ':active': {
      backgroundColor: tokens.colorBrandBackgroundPressed,
      transform: 'scale(0.98)',
    },
  },
  /** 启动中（等 getUserMedia）：只表达「按下了」，不展开任何面板 */
  entryStarting: {
    backgroundColor: tokens.colorNeutralBackground1Pressed,
  },
});

type SpaceSession = {
  startedAt: number;
  cancelled: boolean;
  send: boolean;
};

export function AgentSurface({
  transport,
  seed,
  open,
  onOpenChange,
  hideEntry = false,
  defaultSettingsOpen = false,
}: AgentSurfaceProps) {
  const styles = useStyles();
  const reducedMotion = useReducedMotion();
  const session = useAgentSession({ transport, seed });
  /** 三态几何：锚点/宽高全部由桌面栅格推导（entryGeometry），三态共用右下锚点 */
  const geometry = useAgentSurfaceGeometry();
  const [stage, setStage] = useState<SurfaceStage>(() => (open ? 'chat' : 'collapsed'));
  const [motion, setMotion] = useState<MorphKind>('open-voice');
  const [settingsOpen, setSettingsOpen] = useState(defaultSettingsOpen);
  const [menuOpen, setMenuOpen] = useState(false);
  const surfaceRef = useRef<HTMLElement | null>(null);
  const entryRef = useRef<HTMLButtonElement | null>(null);
  const spaceRef = useRef<SpaceSession | null>(null);
  const stageRef = useRef<SurfaceStage>(stage);
  const sessionRef = useRef<AgentSession>(session);
  const settingsOpenRef = useRef(settingsOpen);
  const menuOpenRef = useRef(menuOpen);
  const onOpenChangeRef = useRef(onOpenChange);
  const previousStageRef = useRef<SurfaceStage>(stage);
  const gestureRef = useRef<VoiceGesture | null>(null);
  const voiceControls = useVoiceControls(session);
  /** 麦克风授权/状态（应用内同意 + 探测结果），授权卡与设置页共用同一份 store */
  const micState = useMicState();

  sessionRef.current = session;
  settingsOpenRef.current = settingsOpen;
  menuOpenRef.current = menuOpen;
  onOpenChangeRef.current = onOpenChange;

  /** 展开/收起阶段切换后，把键盘焦点放在容器上（绝不自动进输入框） */
  const requestSurfaceFocus = useCallback(() => {
    surfaceRef.current?.focus({ preventScroll: true });
  }, []);

  /**
   * 形态切换的唯一入口：只改容器宽高。
   * 不 remount 任何内容层，不碰 session —— 草稿、滚动位置、正在进行的请求都不受影响。
   */
  const go = useCallback((next: SurfaceStage, kind: MorphKind) => {
    if (stageRef.current === next) return;
    stageRef.current = next;
    setMotion(kind);
    setStage(next);
  }, []);

  const openVoice = useCallback(() => {
    if (stageRef.current !== 'collapsed') return;
    go('voice', 'open-voice');
  }, [go]);

  const openChat = useCallback(() => {
    if (stageRef.current === 'chat') return;
    go('chat', 'open-chat');
    onOpenChangeRef.current?.(true);
  }, [go]);

  /**
   * 语音手势状态机（混合手势 / 空格 / 自动展开 / 静音断句）。
   * 只有折叠态才出现胶囊；录完（转写回来）才展开，失败也留在面板里就地给出口。
   */
  const gesture = useVoiceGesture({
    session,
    collapsed: stage === 'collapsed',
    onReveal: openVoice,
    onOpenChat: openChat,
    onOpenSettings: () => setSettingsOpen(true),
  });
  gestureRef.current = gesture;

  /** chat → 半高语音窗：退一层形态，不是关闭（HIG §5.1「收起到语音窗 ≠ 关闭」） */
  const chatToVoice = useCallback(() => {
    if (stageRef.current !== 'chat') return;
    // 只停朗读（TTS 播放），不碰正在进行的生成请求
    sessionRef.current.stopSpeaking();
    go('voice', 'back-voice');
  }, [go]);

  const collapse = useCallback(() => {
    const current = stageRef.current;
    if (current === 'collapsed') return;
    sessionRef.current.stopSpeaking();
    // 录音中收起 = 放弃这次录音：不能留一个没人能停的麦克风在后台
    if (sessionRef.current.voice.stage === 'recording') {
      sessionRef.current.cancelRecording();
    }
    // 转写中收起：结果仍会保存，但不再自动把面板弹回来（关闭就是关闭）
    if (sessionRef.current.voice.stage === 'transcribing') {
      gestureRef.current?.suppressReveal();
    }
    go('collapsed', current === 'chat' ? 'close-chat' : 'back-collapsed');
    onOpenChangeRef.current?.(false);
  }, [go]);

  /**
   * 关闭：Esc / 点外部 / 面板内关闭按钮共用这一个出口（HIG §5.1：退出路径可以多，
   * 每条路径的语义必须一致）。关闭只改形态，不中断生成、不清草稿。
   */
  const requestClose = useCallback(() => {
    collapse();
  }, [collapse]);

  /** 半高窗「点击说话」/ 失败后的「再说一次」：就地开始录音（不换形态，也不跳过授权门） */
  const handleTalkClick = () => {
    const current = sessionRef.current;
    if (current.voice.stage !== 'idle' || current.status !== 'idle') return;
    sessionRef.current.stopSpeaking();
    void gesture.startHere();
  };

  // 受控 open：外部要求打开时进入全高对话；收起时同步父层状态
  useEffect(() => {
    if (open === undefined) return;
    if (open) {
      if (stageRef.current !== 'chat') {
        go('chat', 'open-chat');
      }
    } else if (stageRef.current !== 'collapsed') {
      sessionRef.current.stopSpeaking();
      go('collapsed', stageRef.current === 'chat' ? 'close-chat' : 'back-collapsed');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 阶段切换的焦点：收起后回到入口按钮；展开/换层后焦点在容器上（空格继续可用）。
  // 旧实现把焦点塞进输入框，导致「回答后按空格打出空格」，这里根除。
  useEffect(() => {
    const previous = previousStageRef.current;
    previousStageRef.current = stage;
    if (stage !== 'collapsed') {
      const timer = window.setTimeout(requestSurfaceFocus, 0);
      return () => window.clearTimeout(timer);
    }
    if (previous === 'collapsed' || hideEntry) return undefined;
    const focusEntry = () => entryRef.current?.focus({ preventScroll: true });
    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(focusEntry);
    });
    const timer = window.setTimeout(focusEntry, 60);
    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.clearTimeout(timer);
    };
  }, [stage, hideEntry, requestSurfaceFocus]);

  // 录音/转写结束：焦点回到容器（用户可能刚点过停止，按钮已随录音态卸载）。
  // 不抢正在输入框里的焦点（chat 里用户主动点进了输入框就直接保留）。
  useEffect(() => {
    if (stageRef.current === 'collapsed') return;
    if (voiceControls.busy) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && isEditableTarget(active)) return;
    requestSurfaceFocus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.voice.stage]);

  // 收起为按钮后绝不留“看不见的播报”
  useEffect(() => {
    if (stage === 'collapsed' && session.speakingMessageId) {
      session.stopSpeaking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, session.speakingMessageId]);

  // 空格 = 按住说话：keydown 立即开始录音（**不展开面板**），keyup 结束；
  // <300ms 或失焦取消。结束后的展开由手势状态机统一负责（转写回来才展开）。
  // 空格只在「焦点不在可编辑元素」时生效：输入框里的空格永远是打字。
  useEffect(() => {
    if (hideEntry && stageRef.current === 'collapsed') return undefined;

    const finishSpace = (token: SpaceSession) => {
      const current = sessionRef.current;
      // 先处理取消：<300ms 时 startRecording 可能还没走完，sessionRef 里仍是 idle，
      // 不能先做 stage 判断（会把取消吞掉）。hook 侧支持 starting 阶段取消。
      if (token.cancelled) {
        current.cancelRecording();
        return;
      }
      // 统一走手势状态机的「结束」：最短时长丢弃、静音/超时同一条路径、
      // 折叠态结束时置 revealPending（转写回来才展开）
      gestureRef.current?.stopFromKeyboard();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.repeat) return;
      if (event.key !== ' ' || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
        return;
      }
      if (hideEntry && stageRef.current === 'collapsed') return;
      if (!canUseVoiceKeys(event, surfaceRef.current) || settingsOpenRef.current) return;
      const current = sessionRef.current;
      if (current.voice.stage !== 'idle' || current.status !== 'idle') return;

      event.preventDefault();
      const token: SpaceSession = { startedAt: performance.now(), cancelled: false, send: false };
      spaceRef.current = token;
      void gestureRef.current?.startFromKeyboard().then(() => {
        // 不读 sessionRef.voice.stage（getUserMedia 慢时 .then 早于 React 渲染）：
        // 取消直接交给 hook（支持 starting 阶段），发送交给 finishSpace 处理。
        const latest = sessionRef.current;
        if (token.cancelled) {
          latest.cancelRecording();
          return;
        }
        // 启动慢于松手：录音才刚刚开始，先攒够最短时长再结束，避免把一句话判成「太短」
        if (token.send) {
          window.setTimeout(() => finishSpace(token), MIN_VOICE_MS);
        }
      });
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key !== ' ') return;
      const token = spaceRef.current;
      if (!token) return;
      spaceRef.current = null;
      const elapsed = performance.now() - token.startedAt;
      if (elapsed < SPACE_HOLD_CANCEL_MS) token.cancelled = true;
      else token.send = true;
      finishSpace(token);
    };

    const onBlur = () => {
      // 窗口失焦 = 放弃当前录音（不能留一个没人能停的麦克风在后台）。
      // 不只空格路径：入口点击 / 「点击说话」起的录音同样要停。
      const token = spaceRef.current;
      if (token) {
        spaceRef.current = null;
        token.cancelled = true;
      }
      sessionRef.current.cancelRecording();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [hideEntry]);

  // Esc：录音中取消；输入框聚焦时先退出输入（回到“空格=说话”）；否则关闭（与 ✕、点外部一致）。
  // 监听常驻、用 stageRef 判断当前层：阶段切换的同一帧里连按 Esc 也不会丢事件
  // （按 stage 重挂监听会留下一个很窄的未注册窗口）。
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return;
      if (settingsOpenRef.current || menuOpenRef.current) return;
      if (stageRef.current === 'collapsed') {
        // 折叠态也有三个可取消的状态：启动中/录音中取消、转写中收起提示
        // （都不留后台麦克风）。`cancel()` 在启动中走 hook 的「启动中取消」分支。
        const folded = sessionRef.current;
        if (folded.voice.stage === 'transcribing') {
          event.preventDefault();
          gestureRef.current?.suppressReveal();
        } else {
          event.preventDefault();
          gestureRef.current?.cancel();
        }
        return;
      }
      if (settingsOpenRef.current || menuOpenRef.current) return;
      const current = sessionRef.current;
      if (current.voice.stage === 'recording') {
        event.preventDefault();
        current.cancelRecording();
        requestSurfaceFocus();
        return;
      }
      if (current.voice.stage === 'transcribing') return;

      // 第一次 Esc：只从输入框退出（用户主动点进去打字的场景），窗口不退级
      const active = document.activeElement;
      if (active instanceof HTMLElement && isEditableTarget(active)) {
        event.preventDefault();
        active.blur();
        requestSurfaceFocus();
        return;
      }

      event.preventDefault();
      // 语音窗与对话面板的 Esc 都等于「关闭」（✕ / 点外部同一语义）
      requestClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [requestClose, requestSurfaceFocus]);

  // 点外部 = 关闭，语音窗与对话面板同一语义（HIG §5.1：退出路径多，语义一致）。
  // 监听常驻、用 stageRef 判断当前层，避免换段的那一帧丢 pointerdown。
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (stageRef.current === 'collapsed') return;
      if (settingsOpenRef.current || menuOpenRef.current) return;
      if (sessionRef.current.voice.stage !== 'idle') return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (surfaceRef.current?.contains(target)) return;
      requestClose();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [requestClose]);

  const messages = session.conversation?.messages ?? [];
  // 半高语音窗只展示最近 2 条有**正文**的对话（用户/助手），最新一条贴着底部语音条。
  // 「有正文」= 有 text 块（`hasVisibleText`）：纯思考/工具阶段不该画一个空白气泡。
  // 2 而不是 3：340 的高度只放得下 2 条满 3 行气泡（PEEK_MESSAGE_LIMIT 的容量算式）。
  const peekMessages = useMemo(
    () =>
      messages
        .filter(
          (message) =>
            (message.role === 'user' || message.role === 'assistant') &&
            hasVisibleText(message),
        )
        .slice(-PEEK_MESSAGE_LIMIT),
    [messages],
  );
  const lastPeekId = peekMessages[peekMessages.length - 1]?.id;
  /** 进行中那一轮的 assistant 消息：状态行文案与计时都从它取（不新增会话字段） */
  const lastAssistant = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === 'assistant') return messages[index];
    }
    return undefined;
  }, [messages]);
  const turnBusy = session.status !== 'idle';
  /**
   * 「已停止」提示：只在**本轮确实被用户停止**（消息 status=aborted）后出现一次，
   * 由 `StoppedNotice` 自己淡出（3s）。用状态回落这一帧判定，而不是点停止那一帧——
   * 点下去时 `TurnStatus` 还是 streaming，那一刻挂出来的提示会被下一帧的重渲染冲掉。
   */
  const [stopNotice, setStopNotice] = useState(false);
  const previousTurnStatusRef = useRef(session.status);
  const dismissStopNotice = useCallback(() => setStopNotice(false), []);
  useEffect(() => {
    const previous = previousTurnStatusRef.current;
    previousTurnStatusRef.current = session.status;
    if (previous === 'idle' || session.status !== 'idle') return;
    if (lastAssistant?.status === 'aborted') setStopNotice(true);
  }, [session.status, lastAssistant]);
  // 新一轮开始（或用户开始录音）就撤掉旧提示：它只属于刚结束的那一轮
  useEffect(() => {
    if (session.status !== 'idle' || session.voice.stage !== 'idle') setStopNotice(false);
  }, [session.status, session.voice.stage]);
  const autoRead = session.settings.tts.autoRead;
  const toggleAutoRead = () => {
    const next = !sessionRef.current.settings.tts.autoRead;
    sessionRef.current.stopSpeaking();
    sessionRef.current.updateSettings({ tts: { autoRead: next } });
  };

  const spec = MORPH[motion];
  const inChat = stage === 'chat';
  const inVoice = stage === 'voice';
  const voiceStage = session.voice.stage;
  const speaking = Boolean(session.speakingMessageId);
  const voiceBusy = voiceStage !== 'idle';
  const hidden = hideEntry && stage === 'collapsed';
  const micError =
    session.voice.error?.kind === 'mic' ? session.voice.error.message : null;

  /**
   * 形态切换动画进行中（`data-morphing`）：动画期间强制 `overflow: hidden`。
   *
   * 两块内容层（chat / voice）是**按固定尺寸锚在右下角**的绝对定位元素，不会跟着外框一起缩小；
   * 收起时如果 `overflow` 立刻放开成 `visible`，516×906 的面板内容会在收缩过程中直接露到
   * 56×56 的盒子外面（这就是"缩到最小时形态崩了"的另一半原因）。
   * 所以只在动画结束后才允许溢出——那时外框已经是 56×56，需要溢出的是录音胶囊/授权卡。
   */
  const [morphing, setMorphing] = useState(false);
  const morphStageRef = useRef(stage);
  useEffect(() => {
    if (morphStageRef.current === stage) return undefined;
    morphStageRef.current = stage;
    setMorphing(true);
    const timer = window.setTimeout(
      () => setMorphing(false),
      // 几何动画跑完 + 内容层延迟，之后才放开裁切
      spec.geometry.duration + spec.content.delay,
    );
    return () => window.clearTimeout(timer);
  }, [stage, spec.geometry.duration, spec.content.delay]);

  // ---------- 空闲自动收回（设置页 → Agent → 自动收回） ----------

  /** 档位（秒）：`0` = 关闭；老存档缺字段时已由 settings.ts 归一化成默认 10 */
  const idleCollapseSeconds = session.settings.panel.idleCollapseSeconds;
  /** 焦点停在输入框 / 下拉 / 开关里（存在时不计时） */
  const [focusInField, setFocusInField] = useState(false);
  /** 指针在面板内按下还没松开（存在时不计时） */
  const [pointerHeld, setPointerHeld] = useState(false);
  /** 任意 Fluent Dialog / 菜单 / 下拉展开中（它们 Portal 在面板外，只能从 DOM 上探） */
  const [overlayOpen, setOverlayOpen] = useState(false);
  /** 生成刚结束的 3 秒回声期 */
  const [echoing, setEchoing] = useState(false);
  /** 有地方可退才自动收回：嵌入式实例（hideEntry）收起后没有 orb 可回，不参与 */
  const idleActive = stage !== 'collapsed' && !hideEntry;

  // 弹层探测：Dialog / Menu / Dropdown 列表都是 body 的直接子节点（Portal），
  // 只监听 body 的 childList 就能在挂载 / 卸载时重算（不监听子树，流式渲染不会惊动它）。
  //
  // ⚠ 必须排除**面板自己**：`.wtsl-agent-surface` 本身就带 `role="dialog"`（无障碍语义要求），
  // 早先直接 `querySelector(FLUENT_OVERLAY_SELECTOR)` 会把自己当弹层 → `overlayOpen` 恒为真
  // → `paused` 恒为真 → **自动收回永远不触发**（0.4.7 实测复现）。这里按"在面板之内就忽略"过滤。
  useEffect(() => {
    const probe = () => {
      const surface = surfaceRef.current;
      const inside = (el: Element) => Boolean(el.closest('.wtsl-agent-surface'));
      const found = Array.from(document.querySelectorAll(FLUENT_OVERLAY_SELECTOR)).some(
        (el) => el !== surface && !inside(el),
      );
      setOverlayOpen(found);
    };
    probe();
    const observer = new MutationObserver(probe);
    observer.observe(document.body, { childList: true });
    return () => observer.disconnect();
  }, []);

  // 生成结束 → 回声期内不计时；新一轮开始立刻取消回声
  const previousStreamStatusRef = useRef(session.status);
  useEffect(() => {
    const previous = previousStreamStatusRef.current;
    previousStreamStatusRef.current = session.status;
    if (session.status !== 'idle') {
      setEchoing(false);
      return undefined;
    }
    if (previous === 'idle') return undefined;
    setEchoing(true);
    const timer = window.setTimeout(() => setEchoing(false), STREAM_END_ECHO_MS);
    return () => window.clearTimeout(timer);
  }, [session.status]);

  /**
   * 「不收回」的全部条件（逐条对应规格，改这里就等于改规格）：
   * 1. 录音 / 转写中（`voiceStage !== 'idle'`）——绝不收回一个还开着麦的面板；
   * 2. 正在生成（`status !== 'idle'`）+ 停止后 3 秒回声期（`echoing`）；
   * 3. 麦克风授权卡（`gesture.micCard`）或任意 Fluent Dialog / 菜单 / 下拉展开中；
   * 4. 焦点在输入框 / 文本域 / 下拉 / 开关里（`focusInField`）；
   * 5. 指针在面板内按下未松开（`pointerHeld`）。
   * 第 6 条是本实现补上的：正在朗读（`speakingMessageId`）也不收 —— 收回会先停朗读，
   * 与「静默收回」冲突（报告里列为偏离）。
   */
  const idlePaused =
    voiceStage !== 'idle' ||
    session.status !== 'idle' ||
    echoing ||
    Boolean(session.speakingMessageId) ||
    gesture.micCard !== 'none' ||
    settingsOpen ||
    menuOpen ||
    overlayOpen ||
    focusInField ||
    pointerHeld;

  const { reset: resetIdle } = useIdleCollapse({
    active: idleActive,
    seconds: idleCollapseSeconds,
    paused: idlePaused,
    onCollapse: requestClose,
  });

  // 活动源（面板内）：指针按下 / 位移超阈值 / 滚轮 / 键盘 / 输入法组合，任一发生就重新计时。
  // 监听挂在 surface 节点上（捕获阶段）：在面板外拖卡片、翻桌面不该给面板续命。
  useEffect(() => {
    const node = surfaceRef.current;
    if (!node) return undefined;
    let lastX = 0;
    let lastY = 0;
    const onPointerDown = (event: PointerEvent) => {
      lastX = event.clientX;
      lastY = event.clientY;
      setPointerHeld(true);
      resetIdle();
    };
    const onPointerMove = (event: PointerEvent) => {
      // 小于阈值的抖动不算活动，否则碰一下就永不收回
      if (Math.hypot(event.clientX - lastX, event.clientY - lastY) < IDLE_POINTER_MOVE_THRESHOLD) {
        return;
      }
      lastX = event.clientX;
      lastY = event.clientY;
      resetIdle();
    };
    const onWheel = () => resetIdle();
    const onKeyDown = () => resetIdle();
    const onComposition = () => resetIdle();
    node.addEventListener('pointerdown', onPointerDown, true);
    node.addEventListener('pointermove', onPointerMove, true);
    node.addEventListener('wheel', onWheel, { capture: true, passive: true });
    node.addEventListener('keydown', onKeyDown, true);
    node.addEventListener('compositionstart', onComposition, true);
    node.addEventListener('compositionupdate', onComposition, true);
    return () => {
      node.removeEventListener('pointerdown', onPointerDown, true);
      node.removeEventListener('pointermove', onPointerMove, true);
      node.removeEventListener('wheel', onWheel, true);
      node.removeEventListener('keydown', onKeyDown, true);
      node.removeEventListener('compositionstart', onComposition, true);
      node.removeEventListener('compositionupdate', onComposition, true);
    };
  }, [resetIdle]);

  // 松手可能落在面板外：窗口级监听收掉「按下未松开」，否则会一直不计时
  useEffect(() => {
    const release = () => setPointerHeld(false);
    window.addEventListener('pointerup', release, true);
    window.addEventListener('pointercancel', release, true);
    return () => {
      window.removeEventListener('pointerup', release, true);
      window.removeEventListener('pointercancel', release, true);
    };
  }, []);

  // 焦点：进入面板内任意可聚焦元素算一次活动；停在输入框 / 下拉 / 开关里则持续不计时
  useEffect(() => {
    const inside = (target: EventTarget | null): boolean => {
      const node = surfaceRef.current;
      return Boolean(node && target instanceof Node && node.contains(target));
    };
    const onFocusIn = (event: FocusEvent) => {
      if (!inside(event.target)) return;
      setFocusInField(isIdleBlockingFocus(event.target));
      resetIdle();
    };
    const onFocusOut = (event: FocusEvent) => {
      if (inside(event.target)) setFocusInField(false);
    };
    document.addEventListener('focusin', onFocusIn, true);
    document.addEventListener('focusout', onFocusOut, true);
    return () => {
      document.removeEventListener('focusin', onFocusIn, true);
      document.removeEventListener('focusout', onFocusOut, true);
    };
  }, [resetIdle]);

  // 会话活动：新消息追加、流式 token 到达（每个 token 都是新的消息对象）、
  // 工具调用状态变化、status 变化，都算「有人在用」
  useEffect(() => {
    resetIdle();
  }, [resetIdle, session.status, messages.length, lastAssistant]);

  // 形态手动切换（collapsed → voice/chat、voice ↔ chat）也重新计时
  useEffect(() => {
    resetIdle();
  }, [resetIdle, stage]);

  /** 最后一条语音提问：转写失败时给「再说一次 / 改用键盘」两个出口（不把用户卡在空面板里） */
  const lastVoiceMessage = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];
      if (message.role === 'user' && message.input === 'voice') return message;
    }
    return undefined;
  }, [messages]);
  const voiceFailed =
    voiceStage === 'idle' &&
    session.status === 'idle' &&
    (session.voice.error?.kind === 'asr' || lastVoiceMessage?.transcriptStatus === 'failed');

  const stageBox =
    stage === 'chat' ? geometry.chat : stage === 'voice' ? geometry.voice : geometry.collapsed;

  /**
   * 录音胶囊：2 列 + 1 gutter（1440×960 下 2×164+12 = 340），高度与 orb 相同（56）。
   * 尺寸从桌面栅格推导；`entryGeometry` 只管三态本身，胶囊是折叠态浮层的附属尺寸。
   */
  const pillBox = {
    width: 2 * geometry.grid.cell + geometry.grid.gap,
    height: geometry.collapsed.height,
  };

  /**
   * 容器几何：右/下锚点与当前形态的宽高都由栅格推导后注入 CSS 变量。
   * 三态共用同一个锚点，所以展开/收起只有宽高在动（无位移）。
   */
  const surfaceVars: SurfaceVars = {
    '--wtsl-agent-inset-right': `${geometry.insetRight}px`,
    '--wtsl-agent-inset-bottom': `${geometry.insetBottom}px`,
    '--wtsl-agent-width': `${stageBox.width}px`,
    '--wtsl-agent-height': `${stageBox.height}px`,
  };

  const containerStyle: CSSProperties = reducedMotion
    ? { ...surfaceVars, transitionDuration: '0ms' }
    : {
        ...surfaceVars,
        transitionDuration: `${spec.geometry.duration}ms`,
        transitionTimingFunction: spec.geometry.curve,
      };

  const contentStyle: CSSProperties = reducedMotion
    ? {
        opacity: stage === 'collapsed' ? 0 : 1,
        transitionProperty: 'opacity',
        transitionDuration: `${REDUCED_FADE_MS}ms`,
        transitionTimingFunction: 'linear',
      }
    : {
        opacity: stage === 'collapsed' ? 0 : 1,
        transitionProperty: 'opacity',
        transitionDuration: `${spec.content.duration}ms`,
        transitionDelay: `${spec.content.delay}ms`,
        transitionTimingFunction: spec.content.curve,
      };

  const entryStyle: CSSProperties = reducedMotion
    ? {
        opacity: stage === 'collapsed' ? 1 : 0,
        pointerEvents: stage === 'collapsed' ? 'auto' : 'none',
        transitionProperty: 'opacity',
        transitionDuration: `${REDUCED_FADE_MS}ms`,
        transitionTimingFunction: 'linear',
      }
    : {
        opacity: stage === 'collapsed' ? 1 : 0,
        pointerEvents: stage === 'collapsed' ? 'auto' : 'none',
        transitionProperty: 'opacity',
        transitionDuration: `${spec.entry.duration}ms`,
        transitionDelay: `${spec.entry.delay}ms`,
        transitionTimingFunction: spec.entry.curve,
      };

  /**
   * 内容层按**自己那一态**的固定宽高排版（不跟随外框伸缩）：
   * 语音窗与对话面板的 DOM 尺寸在切换前后完全一致，滚动位置与草稿因此保持不变。
   */
  const paneStyle = (active: boolean, box: { width: number; height: number }): CSSProperties => ({
    width: `${box.width}px`,
    height: `${box.height}px`,
    opacity: active ? 1 : 0,
    pointerEvents: active ? 'auto' : 'none',
    transitionProperty: 'opacity',
    transitionDuration: reducedMotion
      ? `${REDUCED_FADE_MS}ms`
      : `${active ? spec.content.duration : spec.paneExit}ms`,
    transitionDelay: reducedMotion ? '0ms' : `${active ? spec.content.delay : 0}ms`,
    transitionTimingFunction: reducedMotion
      ? 'linear'
      : active
        ? motionTokens.curveDecelerateMid
        : motionTokens.curveAccelerateMid,
  });

  const autoReadToggle = (
    <Tooltip content={autoRead ? '关闭自动朗读' : '开启自动朗读'} relationship="label">
      <ToggleButton
        size="large"
        appearance="subtle"
        checked={autoRead}
        icon={autoRead ? <Speaker2Regular /> : <SpeakerMuteRegular />}
        aria-label={autoRead ? '关闭自动朗读' : '开启自动朗读'}
        onClick={toggleAutoRead}
      />
    </Tooltip>
  );

  return (
    <>
      <section
        ref={surfaceRef}
        className="wtsl-agent-surface"
        data-wtsl-agent-surface="true"
        data-stage={stage}
        data-motion={motion}
        data-morphing={morphing ? 'true' : undefined}
        data-voice-stage={voiceStage}
        data-speaking={speaking ? 'true' : undefined}
        style={hidden ? { ...containerStyle, display: 'none' } : containerStyle}
        role={stage === 'collapsed' ? undefined : 'dialog'}
        aria-modal={stage === 'collapsed' ? undefined : false}
        aria-label={
          stage === 'chat' ? 'Agent 对话' : stage === 'voice' ? 'Agent 语音' : undefined
        }
        tabIndex={-1}
      >
        <div
          className={styles.contentLayer}
          style={contentStyle}
          aria-hidden={stage === 'collapsed'}
          inert={stage === 'collapsed'}
        >
          {/* 全高对话浮栏（文字兜底 + 历史） */}
          <div
            className={styles.pane}
            style={paneStyle(inChat, geometry.chat)}
            aria-hidden={!inChat}
            inert={!inChat}
            data-wtsl-agent-pane="chat"
          >
            <header className={styles.header}>
              <ChatSparkleRegular fontSize={20} className={styles.headerMark} aria-hidden="true" />
              <div className={styles.headerSpacer} />
              {autoReadToggle}
              {speaking ? (
                <Tooltip content="停止朗读" relationship="label">
                  <Button
                    size="large"
                    appearance="subtle"
                    icon={<StopRegular />}
                    aria-label="停止朗读"
                    onClick={session.stopSpeaking}
                  />
                </Tooltip>
              ) : null}
              <Tooltip content="收起到语音窗" relationship="label">
                <Button
                  size="large"
                  appearance="subtle"
                  icon={<ChevronDownRegular />}
                  aria-label="收起到语音窗"
                  disabled={voiceBusy}
                  onClick={chatToVoice}
                />
              </Tooltip>
              <Tooltip content="更多" relationship="label">
                <span className={styles.menuAnchor}>
                  <Menu onOpenChange={(_, data) => setMenuOpen(data.open)}>
                    <MenuTrigger disableButtonEnhancement>
                      <Button
                        size="large"
                        appearance="subtle"
                        icon={<MoreHorizontalRegular />}
                        aria-label="更多"
                      />
                    </MenuTrigger>
                    <MenuPopover>
                      <MenuList>
                        <MenuItem icon={<AddRegular />} onClick={session.newConversation}>
                          新建对话
                        </MenuItem>
                        <MenuItem
                          icon={<SettingsRegular />}
                          onClick={() => setSettingsOpen(true)}
                        >
                          Agent 设置
                        </MenuItem>
                        {session.conversation ? (
                          <MenuItem
                            icon={<DismissRegular />}
                            onClick={() =>
                              session.conversation &&
                              session.deleteConversation(session.conversation.id)
                            }
                          >
                            删除当前对话
                          </MenuItem>
                        ) : null}
                        <MenuDivider />
                        {session.conversations.map((conversation) => (
                          <MenuItem
                            key={conversation.id}
                            icon={
                              conversation.id === session.conversation?.id ? (
                                <CheckmarkRegular />
                              ) : undefined
                            }
                            onClick={() => session.selectConversation(conversation.id)}
                          >
                            <Text truncate>{conversation.title}</Text>
                          </MenuItem>
                        ))}
                      </MenuList>
                    </MenuPopover>
                  </Menu>
                </span>
              </Tooltip>
              <Tooltip content="关闭" relationship="label">
                <Button
                  size="large"
                  appearance="subtle"
                  icon={<DismissRegular />}
                  aria-label="关闭 Agent"
                  onClick={requestClose}
                />
              </Tooltip>
            </header>
            <MessageList session={session} />
            {inChat && gesture.micCard !== 'none' ? (
              <div className={styles.micHost}>
                <MicPermissionCard
                  state={micState}
                  error={gesture.micError}
                  onAllow={gesture.allowMic}
                  onDecline={gesture.declineMic}
                  onRetry={() => void gesture.retryMic()}
                  onOpenSystemSettings={gesture.openSystemMicSettings}
                  onOpenSettings={() => setSettingsOpen(true)}
                  onDismiss={gesture.dismissMicCard}
                />
              </div>
            ) : null}
            <div className={styles.composerHost}>
              <Composer session={session} onOpenSettings={() => setSettingsOpen(true)} />
            </div>
          </div>

          {/* 半高窗：纯语音（没有文字输入框） */}
          <div
            className={styles.pane}
            style={paneStyle(inVoice, geometry.voice)}
            aria-hidden={!inVoice}
            inert={!inVoice}
            data-wtsl-agent-pane="voice"
          >
            <div className={styles.voiceTop}>
              <Tooltip content="展开对话" relationship="label">
                <Button
                  size="large"
                  appearance="subtle"
                  icon={<ChevronUpRegular />}
                  aria-label="展开对话"
                  disabled={voiceBusy}
                  onClick={openChat}
                />
              </Tooltip>
              {/*
                有 peek 消息时顶部补一个紧凑语音入口：中部被 peek 占满，空态那个 96px
                圆钮不存在，而「按住空格」是看不见的路径——半高窗不能只剩一条隐藏入口。
                空态不渲染它（那里已经有更大的圆钮 + 一句「按住空格说话」，避免两个麦克风）。
              */}
              {peekMessages.length > 0 ? (
                <Tooltip content="开始语音" relationship="label">
                  <Button
                    size="large"
                    appearance="subtle"
                    icon={<MicRegular />}
                    aria-label="开始语音"
                    data-wtsl-agent-talk-compact="true"
                    disabled={voiceBusy || turnBusy}
                    onClick={handleTalkClick}
                  />
                </Tooltip>
              ) : null}
              <div className={styles.voiceSpacer} />
              {autoReadToggle}
              {speaking ? (
                <Tooltip content="停止朗读" relationship="label">
                  <Button
                    size="large"
                    appearance="subtle"
                    icon={<StopRegular />}
                    aria-label="停止朗读"
                    onClick={session.stopSpeaking}
                  />
                </Tooltip>
              ) : null}
              <Tooltip content="关闭" relationship="label">
                <Button
                  size="large"
                  appearance="subtle"
                  icon={<DismissRegular />}
                  aria-label="关闭 Agent"
                  onClick={requestClose}
                />
              </Tooltip>
            </div>

            <div
              className={`${styles.peekArea} ${
                peekMessages.length === 0 ? styles.peekAreaEmpty : ''
              } ${voiceBusy ? styles.peekAreaBusy : ''}`}
              /**
               * 空态时这里**不是**按钮：唯一控件是中央的麦克风圆钮（点 = 开始说话），
               * 「展开对话」由顶栏的 chevron 按钮承担——不再出现一个包着按钮的 role=button
               * （嵌套可交互元素会破坏键盘语义，HIG §5.1）。
               */
              role={peekMessages.length > 0 ? 'button' : undefined}
              tabIndex={peekMessages.length > 0 ? 0 : undefined}
              aria-label={peekMessages.length > 0 ? '展开对话' : undefined}
              aria-disabled={
                peekMessages.length > 0 && voiceBusy ? 'true' : undefined
              }
              data-wtsl-agent-peek="true"
              onClick={
                peekMessages.length > 0
                  ? () => {
                      if (voiceBusy) return;
                      openChat();
                    }
                  : undefined
              }
              onKeyDown={
                peekMessages.length > 0
                  ? (event) => {
                      // 只认 Enter：空格在默认焦点下永远是“按住说话”，不是展开
                      if (event.key !== 'Enter') return;
                      event.preventDefault();
                      if (!voiceBusy) openChat();
                    }
                  : undefined
              }
            >
              {peekMessages.length === 0 ? (
                <div className={styles.voiceEmpty}>
                  {/* 空态唯一主操作：麦克风圆钮 + 两层待机细环（纯静态，不做循环动画） */}
                  <div
                    className={styles.voiceMarkGroup}
                    data-wtsl-agent-voice-mark="true"
                  >
                    <span
                      className={`${styles.voiceMarkRing} ${styles.voiceMarkRingOuter}`}
                      aria-hidden="true"
                    />
                    <span
                      className={`${styles.voiceMarkRing} ${styles.voiceMarkRingInner}`}
                      aria-hidden="true"
                    />
                    <Tooltip content="开始语音" relationship="label">
                      <button
                        type="button"
                        className={styles.voiceMarkButton}
                        data-wtsl-agent-talk="true"
                        aria-label="开始语音"
                        aria-keyshortcuts="Space"
                        disabled={turnBusy}
                        onClick={handleTalkClick}
                      >
                        <MicRegular
                          fontSize={EMPTY_STATE_ICON_SIZE_LARGE}
                          aria-hidden="true"
                        />
                      </button>
                    </Tooltip>
                  </div>
                  <Text size={200} className={styles.voiceMarkHint} data-wtsl-agent-voice-hint="true">
                    按住空格说话
                  </Text>
                </div>
              ) : (
                peekMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.peekRow} ${
                      message.role === 'user' ? styles.peekRowUser : ''
                    }`}
                  >
                    <div className={styles.peekStack}>
                      {/* 过程只留一排 ≤3 个状态点（失败用 danger 色）：半高只看「答案 + 存在指示」 */}
                      {message.role === 'assistant' ? (
                        <PeekMotionPips blocks={messageBlocks(message)} />
                      ) : null}
                      <div
                        className={`${styles.peekBubble} ${
                          message.role === 'user' ? styles.peekBubbleUser : ''
                        }`}
                      >
                        {/* 行内 Markdown（粗体/行内码/链接）+ 围栏降级 + 侧边裁切；
                            只渲染 text 块（thinking / tool 不进 peek 文本）；
                            最新一条助手回答看尾部：流式增长时跟读到最新，结束后不回跳到开头 */}
                        <Text size={300}>
                          <PeekText
                            text={peekTextOf(message)}
                            tail={message.id === lastPeekId && message.role === 'assistant'}
                          />
                        </Text>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={styles.voiceDock}>
              {/* 麦克风授权卡：语音窗里点「点击说话」但还没同意时，就地浮在 dock 里 */}
              {inVoice && gesture.micCard !== 'none' ? (
                <MicPermissionCard
                  state={micState}
                  error={gesture.micError}
                  onAllow={gesture.allowMic}
                  onDecline={gesture.declineMic}
                  onRetry={() => void gesture.retryMic()}
                  onOpenSystemSettings={gesture.openSystemMicSettings}
                  onOpenSettings={() => setSettingsOpen(true)}
                  onDismiss={gesture.dismissMicCard}
                />
              ) : null}
              <AgentAlerts
                session={session}
                onOpenSettings={() => setSettingsOpen(true)}
                voiceFailureActions={voiceFailed}
                onRetryVoice={() => void gesture.startHere()}
                onUseKeyboard={openChat}
                onOpenMicSettings={gesture.openSystemMicSettings}
              />
              {/* 进行中状态行：立即出现（wait-ux.md:38 AI 场景不受 1s 阈值保护），
                  右侧带已用秒数，忙时给「停止生成」——半高由此有了中断入口 */}
              {turnBusy ? (
                <PendingLine
                  phase={turnPhase(session.status, lastAssistant)}
                  startedAt={turnStartedAt(lastAssistant)}
                  onStop={session.stop}
                />
              ) : stopNotice ? (
                <StoppedNotice onDismiss={dismissStopNotice} />
              ) : null}
              {voiceStage === 'idle' ? null : (
                <div className={styles.voiceCard}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <VoiceCapture
                      stage={voiceStage === 'recording' ? 'recording' : 'transcribing'}
                      level={session.voice.level}
                      busy={voiceControls.busy}
                      onStop={voiceControls.stop}
                      onCancel={voiceControls.cancel}
                    />
                  </div>
                </div>
              )}
            </div>

            <span className="wtsl-agent-sr-only" aria-live="polite">
              {voiceStage === 'recording'
                ? '正在录音'
                : voiceStage === 'transcribing'
                  ? '正在识别语音'
                  : session.status !== 'idle'
                    ? '正在回答'
                    : ''}
            </span>
          </div>
        </div>

        {/* 折叠态浮层：麦克风授权卡 / 录音胶囊 / 一次性提示，贴在 orb 上方 */}
        {!hideEntry && stage === 'collapsed' ? (
          <div className={styles.floatLayer} data-wtsl-agent-float="true">
            {gesture.micCard !== 'none' ? (
              <MicPermissionCard
                width={pillBox.width}
                state={micState}
                error={gesture.micError}
                onAllow={gesture.allowMic}
                onDecline={gesture.declineMic}
                onRetry={() => void gesture.retryMic()}
                onOpenSystemSettings={gesture.openSystemMicSettings}
                onOpenSettings={() => setSettingsOpen(true)}
                onDismiss={gesture.dismissMicCard}
              />
            ) : gesture.pill !== 'hidden' ? (
              <RecordingPill
                width={pillBox.width}
                height={pillBox.height}
                mode={gesture.pill}
                locked={gesture.locked}
                level={session.voice.level}
                durationSec={session.voice.durationSec}
                onCancel={gesture.cancel}
                onDismiss={gesture.dismissTranscribing}
              />
            ) : null}
            {gesture.notice ? (
              <div className={styles.notice} role="status">
                <Text size={200}>{gesture.notice}</Text>
              </div>
            ) : null}
          </div>
        ) : null}

        {!hideEntry ? (
          <div
            className={styles.entryLayer}
            style={entryStyle}
            aria-hidden={stage !== 'collapsed'}
            inert={stage !== 'collapsed'}
          >
            <Tooltip
              content={gesture.pill === 'recording' ? '正在录音' : '开始语音提问'}
              relationship="label"
            >
              <button
                ref={entryRef}
                type="button"
                className={`${styles.entryButton} ${
                  gesture.pill === 'recording' ? styles.entryRecording : ''
                } ${gesture.starting ? styles.entryStarting : ''} wtsl-agent-entry`}
                data-wtsl-agent-entry="true"
                data-wtsl-agent-recording={gesture.pill === 'recording' ? 'true' : undefined}
                data-wtsl-agent-starting={gesture.starting ? 'true' : undefined}
                data-wtsl-agent-gesture="hybrid"
                aria-label={
                  gesture.pill === 'recording' ? '录音中，点一下结束' : '开始语音提问'
                }
                aria-keyshortcuts="Space"
                style={{ touchAction: 'none', userSelect: 'none' }}
                onClick={gesture.onEntryClick}
                onPointerDown={gesture.onEntryPointerDown}
                onPointerUp={gesture.onEntryPointerUp}
                onPointerCancel={gesture.onEntryPointerCancel}
                onLostPointerCapture={gesture.onEntryLostPointerCapture}
              >
                {gesture.pill === 'recording' ? (
                  <SoundWaveCircleRegular fontSize={20} />
                ) : (
                  <ChatSparkleRegular fontSize={20} />
                )}
              </button>
            </Tooltip>
            {micError ? (
              <Tooltip content={micError} relationship="description">
                <span className={styles.micErrorBadge} aria-label={micError}>
                  <AlertRegular fontSize={12} />
                </span>
              </Tooltip>
            ) : null}
          </div>
        ) : null}
      </section>

      <SettingsDialog
        session={session}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
