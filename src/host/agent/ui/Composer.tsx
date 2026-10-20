/**
 * 输入组件：打字发送 / 语音按钮 / 草稿与录音态。
 *
 * - 打字 Enter 发送、Shift+Enter 换行，发送是“半高窗 → 全高浮栏”的唯一自动升级路径；
 * - 语音按钮与录音态只调用 session 的 startRecording / stopRecording / cancelRecording，
 *   不直接碰 recorder（契约 §8：UI 只消费 session）；
 * - 录音 / 转写时整块输入卡换成声纹带（中部），停止方块与取消 X 在带子右侧；
 * - 发送按钮空内容时保持可见的禁用态（outline + disabled，契约 §2）；
 * - 错误提示与配置引导都在这里，但只给“现状 + 下一步动作”，不写解释性状态文案。
 */

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  Button,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  Spinner,
  Textarea,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowClockwiseRegular,
  DismissRegular,
  SendRegular,
  SoundWaveCircleRegular,
  StopRegular,
} from '@fluentui/react-icons';
import type { AgentSession } from '../hooks/useAgentSession';
import type { SurfaceStage } from './types';
import { VoiceCapture } from './VoiceCapture';

/** 输入框最高 3 行：3 × 22（lineHeightBase400）+ 上下内边距 */
const MAX_INPUT_HEIGHT = 82;
const MIN_INPUT_HEIGHT = 44;

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    minWidth: 0,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusXLarge,
    // 输入区内嵌一层 background2，靠明度分组、不画分割线（契约 §4）
    backgroundColor: tokens.colorNeutralBackground2,
  },
  textarea: {
    width: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    '::after': { border: 'none' },
    // 焦点交给 Fluent Textarea 自己的品牌下划线：不再叠一圈白色 outline（会看起来像禁用态）
  },
  textareaInner: {
    resize: 'none',
    minHeight: `${MIN_INPUT_HEIGHT}px`,
    maxHeight: `${MAX_INPUT_HEIGHT}px`,
    padding: 0,
    overflowY: 'auto',
    fontSize: tokens.fontSizeBase400,
    lineHeight: tokens.lineHeightBase400,
    fontWeight: tokens.fontWeightRegular,
    backgroundColor: 'transparent',
  },
  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  spacer: {
    flex: 1,
  },
  banner: {
    width: '100%',
  },
});

export interface ComposerProps {
  session: AgentSession;
  stage: SurfaceStage;
  /** 外部请求聚焦输入框（展开 / chat 收起 / 录音取消后） */
  focusSignal: number;
  /** 打字发送已触发：由 AgentSurface 执行 composer → chat 的 morph */
  onSent: () => void;
  /** 语音发送已触发（stopRecording 返回）：由 AgentSurface 执行 → chat 的 morph */
  onVoiceDone: () => void;
  /** 打开 Agent 设置 */
  onOpenSettings: () => void;
}

export function Composer({
  session,
  stage,
  focusSignal,
  onSent,
  onVoiceDone,
  onOpenSettings,
}: ComposerProps) {
  const styles = useStyles();
  const [draft, setDraft] = useState('');
  const [voiceBusy, setVoiceBusy] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const voiceStage = session.voice.stage;
  const recording = voiceStage === 'recording';
  const transcribing = voiceStage === 'transcribing';
  const busy = session.status !== 'idle';
  const showSetup = !session.configured && !session.isMock;
  const canSend = draft.trim().length > 0 && !busy && !recording && !transcribing;

  // 输入框自动增高，最多 3 行（契约 §1）
  useLayoutEffect(() => {
    const element = inputRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.min(
      MAX_INPUT_HEIGHT,
      Math.max(MIN_INPUT_HEIGHT, element.scrollHeight),
    )}px`;
  }, [draft, stage, voiceStage]);

  // 展开 / 收起回输入框 / 录音结束：焦点回到输入框（契约 §2）
  useEffect(() => {
    if (focusSignal > 0 && voiceStage === 'idle') {
      inputRef.current?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSignal]);

  const previousVoiceStageRef = useRef(voiceStage);
  useEffect(() => {
    const previous = previousVoiceStageRef.current;
    previousVoiceStageRef.current = voiceStage;
    if (previous !== 'idle' && voiceStage === 'idle') {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [voiceStage]);

  const submit = () => {
    const text = draft.trim();
    if (!text || busy || recording || transcribing) return;
    setDraft('');
    session.stopSpeaking();
    void session.send(text);
    onSent();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  };

  const startVoice = () => {
    if (voiceBusy || busy || voiceStage !== 'idle') return;
    session.stopSpeaking();
    void session.startRecording();
  };

  const stopVoice = async () => {
    if (voiceBusy || voiceStage !== 'recording') return;
    setVoiceBusy(true);
    try {
      await session.stopRecording();
      onVoiceDone();
    } finally {
      setVoiceBusy(false);
    }
  };

  const cancelVoice = () => {
    if (voiceBusy) return;
    session.cancelRecording();
    inputRef.current?.focus({ preventScroll: true });
  };

  const voiceIcon = transcribing ? (
    <Spinner size="extra-tiny" />
  ) : recording ? (
    <StopRegular />
  ) : (
    <SoundWaveCircleRegular />
  );
  const voiceLabel = recording ? '结束录音并发送' : transcribing ? '正在识别语音' : '语音输入';

  return (
    <div className={styles.root}>
      {showSetup ? (
        <MessageBar intent="warning" className={styles.banner}>
          <MessageBarBody>还没有填写 MiMo API Key</MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button appearance="transparent" size="large" onClick={onOpenSettings}>
                去设置
              </Button>
            }
          />
        </MessageBar>
      ) : null}

      {session.error ? (
        <MessageBar intent="error" className={styles.banner}>
          <MessageBarBody>{session.error.message}</MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button
                appearance="transparent"
                size="large"
                icon={<DismissRegular />}
                aria-label="关闭错误提示"
                onClick={session.dismissError}
              />
            }
          >
            {session.error.action ? (
              <Button
                size="large"
                appearance="secondary"
                onClick={() => {
                  const url = session.error?.action?.url;
                  if (url) window.open(url, '_blank', 'noopener,noreferrer');
                }}
              >
                {session.error.action.label}
              </Button>
            ) : null}
            {session.error.retryable ? (
              <Button
                size="large"
                appearance="outline"
                icon={<ArrowClockwiseRegular />}
                aria-label="重试"
                onClick={() => void session.retry()}
              />
            ) : null}
          </MessageBarActions>
        </MessageBar>
      ) : null}

      {session.voice.error && voiceStage === 'idle' ? (
        <MessageBar intent="warning" className={styles.banner}>
          <MessageBarBody>{session.voice.error.message}</MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button
                appearance="transparent"
                size="large"
                icon={<DismissRegular />}
                aria-label="关闭语音提示"
                onClick={session.dismissError}
              />
            }
          />
        </MessageBar>
      ) : null}

      {session.voice.speechError ? (
        <MessageBar intent="warning" className={styles.banner}>
          <MessageBarBody>{session.voice.speechError}</MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button
                appearance="transparent"
                size="large"
                icon={<DismissRegular />}
                aria-label="关闭朗读提示"
                onClick={session.dismissSpeechError}
              />
            }
          />
        </MessageBar>
      ) : null}

      <div className={styles.card}>
        {recording || transcribing ? (
          <VoiceCapture
            stage={voiceStage === 'recording' ? 'recording' : 'transcribing'}
            level={session.voice.level}
            busy={voiceBusy}
            onStop={() => void stopVoice()}
            onCancel={cancelVoice}
          />
        ) : (
          <>
            <Textarea
              ref={inputRef}
              className={styles.textarea}
              textarea={{ className: styles.textareaInner }}
              value={draft}
              placeholder="问点什么…"
              resize="none"
              rows={1}
              onChange={(_, data) => setDraft(data.value)}
              onKeyDown={handleKeyDown}
              aria-label="给 Agent 发消息"
            />
            <div className={styles.actionsRow}>
              <Tooltip content={voiceLabel} relationship="label">
                <Button
                  size="large"
                  appearance="subtle"
                  icon={voiceIcon}
                  disabled={busy || transcribing}
                  aria-label={voiceLabel}
                  onClick={recording ? () => void stopVoice() : startVoice}
                />
              </Tooltip>
              <div className={styles.spacer} />
              {busy ? (
                <Tooltip content="停止生成" relationship="label">
                  <Button
                    size="large"
                    appearance="secondary"
                    icon={<StopRegular />}
                    aria-label="停止生成"
                    onClick={session.stop}
                  />
                </Tooltip>
              ) : (
                <Tooltip content={canSend ? '发送' : '输入内容后发送'} relationship="label">
                  <Button
                    size="large"
                    appearance={canSend ? 'primary' : 'outline'}
                    icon={<SendRegular />}
                    disabled={!canSend}
                    aria-label="发送"
                    onClick={submit}
                  />
                </Tooltip>
              )}
            </div>
          </>
        )}
      </div>
      <span className="wtsl-agent-sr-only" aria-live="polite">
        {busy ? '正在回答' : session.voice.stage === 'idle' ? '' : ''}
      </span>
    </div>
  );
}
