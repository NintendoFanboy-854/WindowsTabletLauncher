/**
 * 全高对话窗的输入区：单行 [语音] [输入] [发送]。
 *
 * v0.3.7（语音优先）：
 * - 文字对话是兜底，输入框只存在于全高 `chat` 形态；半高语音窗没有输入框；
 * - 一行放得下：语音按钮、输入框、发送按钮同一行，不再上下两行；
 * - 不自动聚焦输入框（由 AgentSurface 统一管理焦点）：默认焦点不在输入框里，
 *   空格 = 按住说话；用户主动点进输入框（或 Tab 进来）才打字；
 * - 录音 / 转写时整行换成声纹带（VoiceCapture），停止 / 取消复用同一套 hook。
 */

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  Button,
  Textarea,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { SendRegular, SoundWaveCircleRegular, StopRegular } from '@fluentui/react-icons';
import type { AgentSession } from '../hooks/useAgentSession';
import { AgentAlerts } from './AgentAlerts';
import { isEmptyAssistantMessage } from './turnPhase';
import { VoiceCapture } from './VoiceCapture';
import { useVoiceControls } from './useVoiceControls';

/** 单行输入高度：1 行正文 + 内边距；最多长到 3 行后内部滚动（全部来自 type ramp 与 spacing token） */
const INPUT_MIN_HEIGHT = `calc(${tokens.lineHeightBase400} + ${tokens.spacingVerticalS})`;
const INPUT_MAX_HEIGHT = `calc(${tokens.lineHeightBase400} * 3 + ${tokens.spacingVerticalS})`;

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    minWidth: 0,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    paddingInline: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalXXS,
    borderRadius: tokens.borderRadiusXLarge,
    // 输入区内嵌一层 background2，靠明度分组、不画分割线（契约 §4）
    backgroundColor: tokens.colorNeutralBackground2,
  },
  inputHost: {
    flex: '1 1 auto',
    minWidth: 0,
  },
  textarea: {
    width: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    '::after': { border: 'none' },
    // 焦点交给 Fluent Textarea 自己的品牌下划线：不再叠一圈白色 outline
  },
  textareaInner: {
    resize: 'none',
    minHeight: INPUT_MIN_HEIGHT,
    maxHeight: INPUT_MAX_HEIGHT,
    paddingBlock: tokens.spacingVerticalXS,
    paddingInline: 0,
    overflowY: 'auto',
    fontSize: tokens.fontSizeBase400,
    lineHeight: tokens.lineHeightBase400,
    fontWeight: tokens.fontWeightRegular,
    backgroundColor: 'transparent',
  },
});

export interface ComposerProps {
  session: AgentSession;
  /** 打开 Agent 设置 */
  onOpenSettings: () => void;
}

export function Composer({ session, onOpenSettings }: ComposerProps) {
  const styles = useStyles();
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const voiceStage = session.voice.stage;
  const recording = voiceStage === 'recording';
  const transcribing = voiceStage === 'transcribing';
  const busy = session.status !== 'idle';
  const canSend = draft.trim().length > 0 && !busy && !recording && !transcribing;
  const voice = useVoiceControls(session);
  /**
   * 失败轮已经内联渲染了同一条错误（`MessageBubble` 的轮次容器），这里不再重复一遍：
   * 「同一条错误只有一处渲染」。判据 = 最后一条助手消息为空且失败 + 会话里确有错误。
   */
  const messages = session.conversation?.messages ?? [];
  const lastAssistant = [...messages].reverse().find((item) => item.role === 'assistant');
  const errorRenderedInTurn =
    Boolean(session.error) &&
    Boolean(lastAssistant) &&
    lastAssistant?.status === 'error' &&
    isEmptyAssistantMessage(lastAssistant);

  // 输入框自动增高，最多 3 行（超出由 CSS max-height 截住、内部滚动）
  useLayoutEffect(() => {
    const element = inputRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, [draft, voiceStage]);

  const submit = () => {
    const text = draft.trim();
    if (!text || busy || recording || transcribing) return;
    setDraft('');
    session.stopSpeaking();
    void session.send(text);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  };

  const startVoice = () => {
    if (voice.busy || busy || voiceStage !== 'idle') return;
    session.stopSpeaking();
    void session.startRecording();
  };

  return (
    <div className={styles.root} data-wtsl-agent-composer="chat">
      <AgentAlerts
        session={session}
        onOpenSettings={onOpenSettings}
        suppressTurnError={errorRenderedInTurn}
      />

      <div className={styles.card}>
        {recording || transcribing ? (
          <div className={styles.inputHost}>
            <VoiceCapture
              stage={transcribing ? 'transcribing' : 'recording'}
              level={session.voice.level}
              busy={voice.busy}
              onStop={voice.stop}
              onCancel={voice.cancel}
            />
          </div>
        ) : (
          <>
            <Tooltip content="语音输入" relationship="label">
              <Button
                size="large"
                appearance="subtle"
                icon={<SoundWaveCircleRegular />}
                disabled={busy || transcribing}
                aria-label="语音输入"
                onClick={startVoice}
              />
            </Tooltip>
            <div className={styles.inputHost}>
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
            </div>
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
          </>
        )}
      </div>

      <span className="wtsl-agent-sr-only" aria-live="polite">
        {busy ? '正在回答' : ''}
      </span>
    </div>
  );
}
