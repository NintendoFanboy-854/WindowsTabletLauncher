/**
 * Agent 浮空界面：右下角 56×56 入口按钮 → 半高输入窗 → 全高浮栏。
 *
 * 同一个容器只改宽高（right/bottom 与 12px 圆角不变），三段形态共享 DOM，
 * 输入组件不重挂、草稿不丢。契约覆盖：
 * - §1 三段形态与尺寸；        - §2 手势 / 键盘 / 焦点 / 关闭语义；
 * - §3 motionTokens 动效；     - §4 token 颜色与图标语义；
 * - §5 入口即录（点按/空格立即 startRecording，录音结束才 morph 到 chat）。
 *
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
import { Composer } from './Composer';
import { MessageList } from './MessageList';
import { SettingsDialog } from './SettingsDialog';
import { useReducedMotion } from './useReducedMotion';
import type { SurfaceStage } from './types';
import './agent.css';

/** 空格按住不足 300ms 视为误触，取消录音（契约 §2） */
const SPACE_HOLD_CANCEL_MS = 300;
/** 展开后内容淡入的等待：图标先 80ms 淡出（契约 §3） */
const ENTRY_FADE_OUT_DELAY = motionTokens.durationFaster;
/** 减少动态效果下唯一保留的过渡：120ms opacity（契约 §3） */
const REDUCED_FADE_MS = 120;

export interface AgentSurfaceProps {
  /** 注入传输层（测试或截图用）；不传按 URL 参数创建 */
  transport?: AgentTransport;
  /** 测试或截图用的初始会话 */
  seed?: AgentSeed;
  /** 受控打开 chat（设置页「打开 Agent」/ `?agent=1` 用） */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 无桌面入口时（如设置页内的实例）：不渲染右下角按钮 */
  hideEntry?: boolean;
  /** 测试或截图：初始打开 Agent 设置对话框 */
  defaultSettingsOpen?: boolean;
}

type MorphKind = 'open-composer' | 'open-chat' | 'back-composer' | 'back-collapsed' | 'close-chat';

interface MorphSpec {
  geometry: { duration: number; curve: string };
  content: { duration: number; delay: number; curve: string };
  entry: { duration: number; delay: number; curve: string };
  chatExit: number;
}

/**
 * 三段 morph 的时长/曲线（全部来自 motionTokens）：
 * button → composer 用 decelerate，composer → chat 用 decelerate；
 * 收回方向（chat → composer / → button）用 accelerate（契约 §3）。
 */
const MORPH: Record<MorphKind, MorphSpec> = {
  'open-composer': {
    geometry: { duration: motionTokens.durationSlow, curve: motionTokens.curveDecelerateMid },
    content: { duration: motionTokens.durationFast, delay: ENTRY_FADE_OUT_DELAY, curve: motionTokens.curveDecelerateMid },
    entry: { duration: motionTokens.durationFaster, delay: 0, curve: motionTokens.curveDecelerateMid },
    chatExit: 0,
  },
  'open-chat': {
    geometry: { duration: motionTokens.durationSlow, curve: motionTokens.curveDecelerateMid },
    content: { duration: motionTokens.durationFast, delay: 0, curve: motionTokens.curveDecelerateMid },
    entry: { duration: motionTokens.durationFaster, delay: 0, curve: motionTokens.curveDecelerateMid },
    chatExit: 0,
  },
  'back-composer': {
    geometry: { duration: motionTokens.durationGentle, curve: motionTokens.curveAccelerateMid },
    content: { duration: motionTokens.durationFaster, delay: 0, curve: motionTokens.curveAccelerateMid },
    entry: { duration: 0, delay: 0, curve: motionTokens.curveLinear },
    chatExit: motionTokens.durationFaster,
  },
  'back-collapsed': {
    geometry: { duration: motionTokens.durationNormal, curve: motionTokens.curveAccelerateMid },
    content: { duration: motionTokens.durationFaster, delay: 0, curve: motionTokens.curveAccelerateMid },
    entry: { duration: motionTokens.durationFast, delay: motionTokens.durationFaster, curve: motionTokens.curveDecelerateMid },
    chatExit: motionTokens.durationFaster,
  },
  'close-chat': {
    geometry: { duration: motionTokens.durationGentle, curve: motionTokens.curveAccelerateMid },
    content: { duration: motionTokens.durationFaster, delay: 0, curve: motionTokens.curveAccelerateMid },
    entry: { duration: motionTokens.durationFast, delay: motionTokens.durationFaster, curve: motionTokens.curveDecelerateMid },
    chatExit: motionTokens.durationFaster,
  },
};

/** 空格 / Esc 的键盘守卫：只放行“不在输入控件、不在外部弹层、不在其它按钮上”的场景。
 * 入口按钮本身要放行（焦点回到按钮后仍能按住空格说话，契约 §2）。 */
function canUseVoiceKeys(event: KeyboardEvent, surface: HTMLElement | null): boolean {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return true;
  if (target.isContentEditable) return false;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return false;

  const insideSurface = Boolean(surface?.contains(target));
  if (!insideSurface && target.closest('[role="dialog"], [role="menu"], [role="listbox"]')) {
    return false;
  }
  const interactive = target.closest('button, [role="button"], a[href]');
  if (interactive && !interactive.hasAttribute('data-wtsl-agent-entry')) return false;
  return true;
}

const useStyles = makeStyles({
  contentLayer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    minHeight: 0,
    opacity: 0,
  },
  chatPane: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflow: 'hidden',
  },
  composerPane: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    paddingInline: tokens.spacingHorizontalM,
    paddingBlockEnd: tokens.spacingVerticalM,
    paddingBlockStart: tokens.spacingVerticalS,
    gap: tokens.spacingVerticalS,
  },
  composerPaneChat: {
    flex: '0 0 auto',
  },
  composerPaneCompact: {
    flex: '1 1 auto',
    paddingBlock: tokens.spacingVerticalM,
  },
  // 半高窗顶部控制条：展开对话 / 静音 / 关闭（鼠标与触控都直接可见）
  composerTop: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minHeight: '40px',
    flex: '0 0 auto',
  },
  composerTopSpacer: {
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
    paddingBlock: tokens.spacingVerticalS,
    cursor: 'pointer',
    borderRadius: tokens.borderRadiusLarge,
    maskImage: 'linear-gradient(to bottom, transparent 0%, black 22%)',
    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 22%)',
    ':focus-visible': {
      outlineColor: tokens.colorStrokeFocus2,
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineOffset: '-2px',
    },
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
  composerSlot: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    flex: '0 0 auto',
  },
  composerSlotCenter: {
    // 录音 / 转写：声纹带放到输入窗中部（契约 §5）
    flex: '1 1 auto',
    justifyContent: 'center',
    paddingBlockEnd: tokens.spacingVerticalXXL,
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
  entryLayer: {
    position: 'absolute',
    // 盖住 1px 描边：入口按钮与容器同为 56×56（契约 §1）
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
    // 语义色只用于错误图标 + tooltip（契约 §4）
    pointerEvents: 'auto',
  },
  menuAnchor: {
    display: 'inline-flex',
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
  const [motion, setMotion] = useState<MorphKind>('open-composer');
  const [settingsOpen, setSettingsOpen] = useState(defaultSettingsOpen);
  const [menuOpen, setMenuOpen] = useState(false);
  const [focusSignal, setFocusSignal] = useState(0);
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
  /** 转写途中被收起：识别完成后不再把窗口弹回 chat（关闭就是关闭） */
  const suppressVoiceRevealRef = useRef(false);

  sessionRef.current = session;
  settingsOpenRef.current = settingsOpen;
  menuOpenRef.current = menuOpen;
  onOpenChangeRef.current = onOpenChange;

  const requestInputFocus = useCallback(() => setFocusSignal((value) => value + 1), []);

  /** 只改宽高与圆角阴影：形态切换的唯一入口 */
  const go = useCallback((next: SurfaceStage, kind: MorphKind) => {
    if (stageRef.current === next) return;
    stageRef.current = next;
    setMotion(kind);
    setStage(next);
  }, []);

  const openComposer = useCallback(() => {
    if (stageRef.current !== 'collapsed') return;
    go('composer', 'open-composer');
  }, [go]);

  const openChat = useCallback(() => {
    if (stageRef.current === 'chat') return;
    setChatViewKey((value) => value + 1);
    go('chat', 'open-chat');
    onOpenChangeRef.current?.(true);
  }, [go]);

  const chatToComposer = useCallback(() => {
    if (stageRef.current !== 'chat') return;
    sessionRef.current.stopSpeaking();
    go('composer', 'back-composer');
    requestInputFocus();
  }, [go, requestInputFocus]);

  const collapse = useCallback(() => {
    const current = stageRef.current;
    if (current === 'collapsed') return;
    sessionRef.current.stopSpeaking();
    // 录音中收起 = 放弃这次录音：不能留一个没人能停的麦克风在后台
    const voiceStage = sessionRef.current.voice.stage;
    if (voiceStage === 'recording') {
      sessionRef.current.cancelRecording();
    } else if (voiceStage === 'transcribing') {
      suppressVoiceRevealRef.current = true;
    }
    go('collapsed', current === 'chat' ? 'close-chat' : 'back-collapsed');
    onOpenChangeRef.current?.(false);
  }, [go]);

  /** 语音结束的回调：只有用户没有主动收起时才升级到 chat */
  const handleVoiceDone = useCallback(() => {
    if (suppressVoiceRevealRef.current) {
      suppressVoiceRevealRef.current = false;
      return;
    }
    openChat();
  }, [openChat]);

  const startVoice = useCallback(() => {
    const current = sessionRef.current;
    if (current.voice.stage !== 'idle' || current.status !== 'idle') return;
    suppressVoiceRevealRef.current = false;
    openComposer();
    void current.startRecording();
  }, [openComposer]);

  /** 入口按钮：点按 = 立即录音（不是先开窗再点录音，契约 §2/§5） */
  const handleEntryClick = () => {
    const current = sessionRef.current;
    if (current.voice.stage !== 'idle') {
      // 录音/转写中（理论上入口不可见）：回到输入窗即可
      openComposer();
      return;
    }
    if (current.status !== 'idle') {
      // 后台还在生成回答：先回到 chat 看结果，不叠新录音
      openChat();
      return;
    }
    startVoice();
  };

  // 受控 open：外部要求打开 chat 时进入 chat；收起时同步父层状态
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

  // 展开到 composer / chat 后焦点到输入框（录音入口不抢焦点，避免录音时弹出输入法）
  const focusStageRef = useRef<SurfaceStage>(stage);
  useEffect(() => {
    const previous = focusStageRef.current;
    focusStageRef.current = stage;
    if (stage === 'chat' || (stage === 'composer' && previous === 'chat')) {
      requestInputFocus();
    }
  }, [stage, requestInputFocus]);

  // 关闭后焦点回到入口按钮（契约 §2）。
  // 点外部收起时，pointerdown 的默认 focus 会在我们的 effect 之后落到 body/桌面卡片，
  // 所以在下一帧再抢一次焦点（Esc / X 路径同样受益，不影响草稿）。
  useEffect(() => {
    const previous = previousStageRef.current;
    previousStageRef.current = stage;
    if (stage !== 'collapsed' || previous === 'collapsed' || hideEntry) return undefined;
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
  }, [stage, hideEntry]);

  // 收起为按钮后绝不留“看不见的播报”：如果收起的瞬间/之后 TTS 才开始，立即停掉
  // （语音提问的自动朗读只在窗口打开时发生；关闭/收起 = 停止播报，契约 §5）
  useEffect(() => {
    if (stage === 'collapsed' && session.speakingMessageId) {
      session.stopSpeaking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, session.speakingMessageId]);

  // 空格 = 按住说话：keydown 立即开始录音，keyup 结束发送；<300ms 或失焦取消
  useEffect(() => {
    if (hideEntry) return undefined;

    const finishSpace = (token: SpaceSession) => {
      const current = sessionRef.current;
      // 先处理取消：<300ms 时 startRecording 可能还没走完，sessionRef 里仍是 idle，
      // 不能先做 stage 判断（会把取消吞掉）。hook 侧支持 starting 阶段取消。
      if (token.cancelled) {
        current.cancelRecording();
        return;
      }
      if (current.voice.stage !== 'recording') return;
      void current.stopRecording().then(() => openChat());
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.repeat) return;
      if (event.key !== ' ' || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
        return;
      }
      if (!canUseVoiceKeys(event, surfaceRef.current) || settingsOpenRef.current) return;
      const current = sessionRef.current;
      if (current.voice.stage !== 'idle' || current.status !== 'idle') return;

      event.preventDefault();
      const token: SpaceSession = { startedAt: performance.now(), cancelled: false, send: false };
      spaceRef.current = token;
      openComposer();
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
      const token = spaceRef.current;
      if (!token) return;
      spaceRef.current = null;
      token.cancelled = true;
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
  }, [hideEntry, openComposer, openChat]);

  // Esc：录音中取消；composer 收起；chat 退到 composer（契约 §2）
  useEffect(() => {
    if (stage === 'collapsed') return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return;
      if (settingsOpenRef.current || menuOpenRef.current) return;
      event.preventDefault();
      const current = sessionRef.current;
      if (current.voice.stage === 'recording') {
        current.cancelRecording();
        requestInputFocus();
        return;
      }
      if (current.voice.stage === 'transcribing') return;
      if (stageRef.current === 'chat') chatToComposer();
      else if (stageRef.current === 'composer') collapse();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [stage, chatToComposer, collapse, requestInputFocus]);

  // composer：点外部收起为按钮，草稿保留；chat：点外部不关（契约 §2）
  useEffect(() => {
    if (stage !== 'composer') return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (settingsOpenRef.current) return;
      if (sessionRef.current.voice.stage !== 'idle') return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (surfaceRef.current?.contains(target)) return;
      collapse();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [stage, collapse]);

  const messages = session.conversation?.messages ?? [];
  // 半高窗只展示最近 3 条有内容的对话（用户/助手），最新一条贴着输入区
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
  const inComposer = stage === 'composer';
  const voiceStage = session.voice.stage;

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

  const chatPaneStyle: CSSProperties = {
    position: inChat ? 'relative' : 'absolute',
    inset: inChat ? undefined : 0,
    flex: inChat ? '1 1 auto' : undefined,
    opacity: inChat ? 1 : 0,
    pointerEvents: inChat ? 'auto' : 'none',
    transitionProperty: 'opacity',
    transitionDuration: reducedMotion
      ? `${REDUCED_FADE_MS}ms`
      : `${inChat ? spec.content.duration : spec.chatExit}ms`,
    transitionTimingFunction: reducedMotion
      ? 'linear'
      : inChat
        ? motionTokens.curveDecelerateMid
        : motionTokens.curveAccelerateMid,
  };

  const hidden = hideEntry && stage === 'collapsed';
  const speaking = Boolean(session.speakingMessageId);
  // 麦克风不可用：入口旁 danger 图标 + Tooltip（docs/components/agent.md 错误与空态）
  const micError =
    session.voice.error?.kind === 'mic' ? session.voice.error.message : null;

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
          stage === 'chat' ? 'Agent 对话' : stage === 'composer' ? 'Agent 输入' : undefined
        }
      >
        <div
          className={styles.contentLayer}
          style={contentStyle}
          aria-hidden={stage === 'collapsed'}
          inert={stage === 'collapsed'}
        >
          <div
            className={styles.chatPane}
            style={chatPaneStyle}
            aria-hidden={!inChat}
            inert={!inChat}
          >
            <header className={styles.header}>
              <ChatSparkleRegular
                fontSize={20}
                className={styles.headerMark}
                aria-hidden="true"
              />
              <div className={styles.headerSpacer} />
              {/* 常驻朗读开关：显示当前是否会自动朗读（不再只在播放时才冒出一个控件） */}
              <Tooltip
                content={autoRead ? '关闭自动朗读' : '开启自动朗读'}
                relationship="label"
              >
                <ToggleButton
                  size="large"
                  appearance="subtle"
                  checked={autoRead}
                  icon={autoRead ? <Speaker2Regular /> : <SpeakerMuteRegular />}
                  aria-label={autoRead ? '关闭自动朗读' : '开启自动朗读'}
                  onClick={toggleAutoRead}
                />
              </Tooltip>
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
              <Tooltip content="收起到输入框" relationship="label">
                <Button
                  size="large"
                  appearance="subtle"
                  icon={<ChevronDownRegular />}
                  aria-label="收起到输入框"
                  onClick={chatToComposer}
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
          </div>

          <div
            className={`${styles.composerPane} ${
              inComposer ? styles.composerPaneCompact : styles.composerPaneChat
            }`}
          >
            {inComposer ? (
              <div className={styles.composerTop}>
                {/* 半高窗不再是死路：这里直接展开到全高对话 */}
                <Tooltip content="展开对话" relationship="label">
                  <Button
                    size="large"
                    appearance="subtle"
                    icon={<ChevronUpRegular />}
                    disabled={voiceStage !== 'idle'}
                    aria-label="展开对话"
                    onClick={openChat}
                  />
                </Tooltip>
                <div className={styles.composerTopSpacer} />
                <Tooltip
                  content={autoRead ? '关闭自动朗读' : '开启自动朗读'}
                  relationship="label"
                >
                  <ToggleButton
                    size="large"
                    appearance="subtle"
                    checked={autoRead}
                    icon={autoRead ? <Speaker2Regular /> : <SpeakerMuteRegular />}
                    aria-label={autoRead ? '关闭自动朗读' : '开启自动朗读'}
                    onClick={toggleAutoRead}
                  />
                </Tooltip>
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
            ) : null}
            {inComposer && voiceStage === 'idle' ? (
              <div
                className={styles.peekArea}
                role="button"
                tabIndex={0}
                aria-label="展开对话"
                onClick={openChat}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  openChat();
                }}
              >
                {peekMessages.length === 0 ? (
                  <div className={styles.peekEmpty} aria-hidden="true">
                    <ChatSparkleRegular fontSize={28} />
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
                        <Text size={200}>{message.content}</Text>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : null}
            <div
              className={`${styles.composerSlot} ${
                inComposer && voiceStage !== 'idle' ? styles.composerSlotCenter : ''
              }`}
            >
              <Composer
                session={session}
                stage={stage}
                focusSignal={focusSignal}
                onSent={openChat}
                onVoiceDone={handleVoiceDone}
                onOpenSettings={() => setSettingsOpen(true)}
              />
            </div>
          </div>
        </div>

        {!hideEntry ? (
          <div className={styles.entryLayer} style={entryStyle}>
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
