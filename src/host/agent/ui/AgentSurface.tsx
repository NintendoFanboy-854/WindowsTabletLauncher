/**
 * Agent 浮空界面：右下角 56×56 入口按钮 → 半高语音窗 → 全高对话浮栏。
 *
 * v0.3.7 语音优先（取代 v0.3.0「发送后自动升级到 chat」的行为）：
 * - 语音是主入口：点按/空格立即录音；一轮结束后**留在半高语音窗**继续下一轮，
 *   不再自动 morph 到全高。文字对话是兜底，必须显式「展开对话」才进入全高浮栏。
 * - 半高窗是纯语音形态：没有文字输入框；录音 / 转写 / 回答都在这一层完成。
 * - 空格默认永远是「按住说话」：展开/收起/语音结束都**不**把焦点塞进输入框，
 *   只有用户主动点进全高浮栏的输入框（或 Tab 进去）时空格才是打字。
 * - 全高浮栏的输入区是单行：[语音] [输入] [发送]。
 *
 * 同一容器只改宽高（right/bottom 与 12px 圆角不变），三段共享 DOM；
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
import { AgentAlerts } from './AgentAlerts';
import { Composer } from './Composer';
import { MessageList } from './MessageList';
import { SettingsDialog } from './SettingsDialog';
import { useReducedMotion } from './useReducedMotion';
import { useVoiceControls } from './useVoiceControls';
import { VoiceCapture } from './VoiceCapture';
import type { SurfaceStage } from './types';
import './agent.css';

/** 空格按住不足 300ms 视为误触，取消录音 */
const SPACE_HOLD_CANCEL_MS = 300;
/** 展开后内容淡入的等待：图标先 80ms 淡出 */
const ENTRY_FADE_OUT_DELAY = motionTokens.durationFaster;
/** 减少动态效果下唯一保留的过渡：120ms opacity */
const REDUCED_FADE_MS = 120;

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
 * 打开方向用 decelerate，收回方向用 accelerate；只变宽高，位置与圆角不变。
 */
const MORPH: Record<MorphKind, MorphSpec> = {
  'open-voice': {
    geometry: { duration: motionTokens.durationSlow, curve: motionTokens.curveDecelerateMid },
    content: { duration: motionTokens.durationFast, delay: ENTRY_FADE_OUT_DELAY, curve: motionTokens.curveDecelerateMid },
    entry: { duration: motionTokens.durationFaster, delay: 0, curve: motionTokens.curveDecelerateMid },
    paneExit: 0,
  },
  'open-chat': {
    geometry: { duration: motionTokens.durationSlow, curve: motionTokens.curveDecelerateMid },
    content: { duration: motionTokens.durationFast, delay: 0, curve: motionTokens.curveDecelerateMid },
    entry: { duration: motionTokens.durationFaster, delay: 0, curve: motionTokens.curveDecelerateMid },
    paneExit: 0,
  },
  'back-voice': {
    geometry: { duration: motionTokens.durationGentle, curve: motionTokens.curveAccelerateMid },
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
    geometry: { duration: motionTokens.durationGentle, curve: motionTokens.curveAccelerateMid },
    content: { duration: motionTokens.durationFaster, delay: 0, curve: motionTokens.curveAccelerateMid },
    entry: { duration: motionTokens.durationFast, delay: motionTokens.durationFaster, curve: motionTokens.curveDecelerateMid },
    paneExit: motionTokens.durationFaster,
  },
};

function isEditableTarget(target: HTMLElement): boolean {
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

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
  pane: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    paddingInline: tokens.spacingHorizontalM,
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
    paddingInline: tokens.spacingHorizontalM,
    paddingBlockEnd: tokens.spacingVerticalM,
    paddingBlockStart: tokens.spacingVerticalS,
  },
  // ---- 半高纯语音窗 ----
  voiceTop: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    paddingInline: tokens.spacingHorizontalM,
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
    paddingInline: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalS,
    cursor: 'pointer',
    borderRadius: tokens.borderRadiusXLarge,
    maskImage: 'linear-gradient(to bottom, transparent 0%, black 22%)',
    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 22%)',
    ':focus-visible': {
      outlineColor: tokens.colorStrokeFocus2,
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineOffset: '-2px',
    },
  },
  peekAreaBusy: {
    cursor: 'default',
  },
  peekRow: {
    display: 'flex',
    minWidth: 0,
  },
  peekRowUser: {
    justifyContent: 'flex-end',
  },
  peekBubble: {
    maxWidth: '86%',
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
  peekEmpty: {
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    color: tokens.colorBrandForeground1,
    opacity: 0.75,
  },
  voiceDock: {
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    paddingInline: tokens.spacingHorizontalM,
    paddingBlockStart: tokens.spacingVerticalS,
    paddingBlockEnd: tokens.spacingVerticalM,
  },
  voiceCard: {
    display: 'flex',
    alignItems: 'center',
    paddingInline: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalXS,
    borderRadius: tokens.borderRadiusXLarge,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  talkButton: {
    // 半高窗的主操作：宽度占满、高度用 Fluent Button 的大尺寸（40px，满足触控目标）
    width: '100%',
  },
  // ---- 入口按钮 ----
  entryLayer: {
    position: 'absolute',
    // 盖住 1px 描边：入口按钮与容器同为 56×56
    inset: '-1px',
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
      outlineWidth: '2px',
      outlineOffset: '-4px',
    },
  },
  micErrorBadge: {
    position: 'absolute',
    top: tokens.spacingVerticalXS,
    right: tokens.spacingHorizontalXS,
    display: 'grid',
    placeItems: 'center',
    color: tokens.colorPaletteRedForeground1,
    pointerEvents: 'auto',
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
  const [stage, setStage] = useState<SurfaceStage>(() => (open ? 'chat' : 'collapsed'));
  const [motion, setMotion] = useState<MorphKind>('open-voice');
  const [settingsOpen, setSettingsOpen] = useState(defaultSettingsOpen);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatViewKey, setChatViewKey] = useState(0);
  const surfaceRef = useRef<HTMLElement | null>(null);
  const entryRef = useRef<HTMLButtonElement | null>(null);
  const spaceRef = useRef<SpaceSession | null>(null);
  const stageRef = useRef<SurfaceStage>(stage);
  const sessionRef = useRef<AgentSession>(session);
  const settingsOpenRef = useRef(settingsOpen);
  const menuOpenRef = useRef(menuOpen);
  const onOpenChangeRef = useRef(onOpenChange);
  const previousStageRef = useRef<SurfaceStage>(stage);
  const voiceControls = useVoiceControls(session);

  sessionRef.current = session;
  settingsOpenRef.current = settingsOpen;
  menuOpenRef.current = menuOpen;
  onOpenChangeRef.current = onOpenChange;

  /** 展开/收起阶段切换后，把键盘焦点放在容器上（绝不自动进输入框） */
  const requestSurfaceFocus = useCallback(() => {
    surfaceRef.current?.focus({ preventScroll: true });
  }, []);

  /** 只改宽高与圆角阴影：形态切换的唯一入口 */
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
    setChatViewKey((value) => value + 1);
    go('chat', 'open-chat');
    onOpenChangeRef.current?.(true);
  }, [go]);

  /** chat → 半高语音窗（文字模式退回语音模式） */
  const chatToVoice = useCallback(() => {
    if (stageRef.current !== 'chat') return;
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
    go('collapsed', current === 'chat' ? 'close-chat' : 'back-collapsed');
    onOpenChangeRef.current?.(false);
  }, [go]);

  const startVoice = useCallback(() => {
    const current = sessionRef.current;
    if (current.voice.stage !== 'idle' || current.status !== 'idle') return;
    openVoice();
    void current.startRecording();
  }, [openVoice]);

  /** 入口按钮：点按 = 立即录音（不是先开窗再点录音） */
  const handleEntryClick = () => {
    const current = sessionRef.current;
    if (current.voice.stage !== 'idle' || current.status !== 'idle') {
      // 后台还在生成回答 / 录音理论上入口不可见：先回到语音窗看结果，不叠新录音
      openVoice();
      return;
    }
    startVoice();
  };

  /** 半高窗「点击说话」：触摸/鼠标点按 = 开始录音；键盘按住空格走空格路径 */
  const handleTalkClick = () => {
    const current = sessionRef.current;
    if (current.voice.stage !== 'idle' || current.status !== 'idle') return;
    sessionRef.current.stopSpeaking();
    void current.startRecording();
  };

  // 受控 open：外部要求打开时进入全高对话；收起时同步父层状态
  useEffect(() => {
    if (open === undefined) return;
    if (open) {
      if (stageRef.current !== 'chat') {
        setChatViewKey((value) => value + 1);
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

  // 空格 = 按住说话：keydown 立即开始录音，keyup 结束发送；<300ms 或失焦取消。
  // 语音结束后只停录音、**不**切换形态：连续语音对话留在半高窗里。
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
      if (current.voice.stage !== 'recording') return;
      void current.stopRecording();
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
      openVoice();
      void current.startRecording().then(() => {
        // 不读 sessionRef.voice.stage（getUserMedia 慢时 .then 早于 React 渲染）：
        // 取消直接交给 hook（支持 starting 阶段），发送交给 finishSpace 处理。
        const latest = sessionRef.current;
        if (token.cancelled) latest.cancelRecording();
        else if (token.send) finishSpace(token);
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
  }, [hideEntry, openVoice]);

  // Esc：录音中取消；输入框聚焦时先退出输入（回到“空格=说话”）；否则退一级。
  // 监听常驻、用 stageRef 判断当前层：阶段切换的同一帧里连按 Esc 也不会丢事件
  // （按 stage 重挂监听会留下一个很窄的未注册窗口）。
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return;
      if (stageRef.current === 'collapsed') return;
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
      if (stageRef.current === 'chat') chatToVoice();
      else if (stageRef.current === 'voice') collapse();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [chatToVoice, collapse, requestSurfaceFocus]);

  // 半高语音窗：点外部收起为按钮（chat 点外部不关，稳定阅读）。
  // 监听常驻、用 stageRef 判断当前层，避免换段的那一帧丢 pointerdown。
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (stageRef.current !== 'voice') return;
      if (settingsOpenRef.current) return;
      if (sessionRef.current.voice.stage !== 'idle') return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (surfaceRef.current?.contains(target)) return;
      collapse();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [collapse]);

  const messages = session.conversation?.messages ?? [];
  // 半高语音窗只展示最近 3 条有内容的对话（用户/助手），最新一条贴着底部语音条
  const peekMessages = useMemo(
    () =>
      messages
        .filter(
          (message) =>
            (message.role === 'user' || message.role === 'assistant') &&
            message.content.trim().length > 0,
        )
        .slice(-3),
    [messages],
  );
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

  const containerStyle: CSSProperties = reducedMotion
    ? { transitionDuration: '0ms' }
    : {
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

  const paneStyle = (active: boolean): CSSProperties => ({
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
            style={paneStyle(inChat)}
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
                  onClick={collapse}
                />
              </Tooltip>
            </header>
            <MessageList key={chatViewKey} session={session} />
            <div className={styles.composerHost}>
              <Composer session={session} onOpenSettings={() => setSettingsOpen(true)} />
            </div>
          </div>

          {/* 半高窗：纯语音（没有文字输入框） */}
          <div
            className={styles.pane}
            style={paneStyle(inVoice)}
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
              <Tooltip content="收起" relationship="label">
                <Button
                  size="large"
                  appearance="subtle"
                  icon={<DismissRegular />}
                  aria-label="收起 Agent"
                  onClick={collapse}
                />
              </Tooltip>
            </div>

            <div
              className={`${styles.peekArea} ${voiceBusy ? styles.peekAreaBusy : ''}`}
              role="button"
              tabIndex={0}
              aria-label="展开对话"
              aria-disabled={voiceBusy ? 'true' : undefined}
              data-wtsl-agent-peek="true"
              onClick={() => {
                if (voiceBusy) return;
                openChat();
              }}
              onKeyDown={(event) => {
                // 只认 Enter：空格在默认焦点下永远是“按住说话”，不是展开
                if (event.key !== 'Enter') return;
                event.preventDefault();
                if (!voiceBusy) openChat();
              }}
            >
              {peekMessages.length === 0 ? (
                <div className={styles.peekEmpty} aria-hidden="true">
                  <ChatSparkleRegular fontSize={24} />
                </div>
              ) : (
                peekMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.peekRow} ${
                      message.role === 'user' ? styles.peekRowUser : ''
                    }`}
                  >
                    <div
                      className={`${styles.peekBubble} ${
                        message.role === 'user' ? styles.peekBubbleUser : ''
                      }`}
                    >
                      <Text size={300}>{message.content}</Text>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={styles.voiceDock}>
              <AgentAlerts session={session} onOpenSettings={() => setSettingsOpen(true)} />
              {voiceStage === 'idle' ? (
                <Tooltip content="按住空格也可以说话" relationship="description">
                  <Button
                    className={styles.talkButton}
                    appearance="primary"
                    size="large"
                    icon={<SoundWaveCircleRegular />}
                    data-wtsl-agent-talk="true"
                    aria-label="开始语音"
                    disabled={session.status !== 'idle'}
                    onClick={handleTalkClick}
                  >
                    点击说话
                  </Button>
                </Tooltip>
              ) : (
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

        {!hideEntry ? (
          <div
            className={styles.entryLayer}
            style={entryStyle}
            aria-hidden={stage !== 'collapsed'}
            inert={stage !== 'collapsed'}
          >
            <Tooltip content="开始语音提问" relationship="label">
              <button
                ref={entryRef}
                type="button"
                className={`${styles.entryButton} wtsl-agent-entry`}
                data-wtsl-agent-entry="true"
                aria-label="开始语音提问"
                onClick={handleEntryClick}
              >
                <ChatSparkleRegular fontSize={20} />
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
