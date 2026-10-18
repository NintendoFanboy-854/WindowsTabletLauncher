/**
 * 输入区：多行输入 + 发送/停止 + 麦克风；上方按需显示配置引导、错误重试、语音错误。
 */

import { useState, type KeyboardEvent } from 'react';
import {
  Button,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarTitle,
  Textarea,
  ToggleButton,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowClockwiseRegular,
  DismissRegular,
  MicRegular,
  SendRegular,
  StopRegular,
} from '@fluentui/react-icons';
import type { AgentSession } from '../hooks/useAgentSession';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingHorizontalM,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  inputRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: tokens.spacingHorizontalS,
  },
  textarea: {
    flex: 1,
    minWidth: 0,
  },
  textareaInner: {
    resize: 'none',
    maxHeight: '120px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  banner: {
    width: '100%',
  },
});

export function Composer({
  session,
  onOpenSettings,
}: {
  session: AgentSession;
  onOpenSettings: () => void;
}) {
  const styles = useStyles();
  const [draft, setDraft] = useState('');
  const busy = session.status !== 'idle';
  const recording = session.voice.stage === 'recording';
  const transcribing = session.voice.stage === 'transcribing';
  const showSetupBanner = !session.configured && !session.isMock;

  const submit = () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft('');
    void session.send(text);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  const handleMic = () => {
    if (transcribing) return;
    if (recording) {
      void session.stopRecording();
      return;
    }
    session.enterVoice();
    void session.startRecording();
  };

  return (
    <div className={styles.root}>
      {showSetupBanner ? (
        <MessageBar intent="warning" className={styles.banner}>
          <MessageBarBody>
            <MessageBarTitle>还没配置 MiMo API Key</MessageBarTitle>
            Agent 现在只能看不能答。去设置里填 Key，或者先开 Mock 演示模式看完整流程。
          </MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button appearance="transparent" size="small" onClick={onOpenSettings}>
                打开设置
              </Button>
            }
          >
            <Button
              size="small"
              appearance="outline"
              onClick={() => session.updateSettings({ mock: true })}
            >
              开启 Mock 演示
            </Button>
          </MessageBarActions>
        </MessageBar>
      ) : null}

      {session.error ? (
        <MessageBar intent="error" className={styles.banner}>
          <MessageBarBody>
            <MessageBarTitle>请求失败</MessageBarTitle>
            {session.error.message}
          </MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button
                appearance="transparent"
                size="small"
                icon={<DismissRegular />}
                aria-label="关闭错误提示"
                onClick={session.dismissError}
              />
            }
          >
            {session.error.retryable ? (
              <Button
                size="small"
                appearance="outline"
                icon={<ArrowClockwiseRegular />}
                onClick={() => void session.retry()}
              >
                重试
              </Button>
            ) : null}
          </MessageBarActions>
        </MessageBar>
      ) : null}

      {session.voice.error && !session.voice.active ? (
        <MessageBar intent="warning" className={styles.banner}>
          <MessageBarBody>{session.voice.error}</MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button
                appearance="transparent"
                size="small"
                icon={<DismissRegular />}
                aria-label="关闭语音提示"
                onClick={session.dismissVoiceError}
              />
            }
          />
        </MessageBar>
      ) : null}

      <div className={styles.inputRow}>
        <Textarea
          className={styles.textarea}
          textarea={{ className: styles.textareaInner }}
          value={draft}
          placeholder="问点什么…（Enter 发送，Shift+Enter 换行）"
          resize="none"
          rows={1}
          onChange={(_, data) => setDraft(data.value)}
          onKeyDown={handleKeyDown}
          aria-label="给 Agent 发消息"
        />
        <div className={styles.actions}>
          <ToggleButton
            appearance="subtle"
            icon={recording ? <StopRegular /> : <MicRegular />}
            checked={recording}
            disabled={transcribing || busy}
            aria-label={recording ? '停止录音并发送' : '语音输入'}
            title={recording ? '停止录音并发送' : '语音输入'}
            onClick={handleMic}
          />
          {busy ? (
            <Button
              appearance="primary"
              icon={<StopRegular />}
              aria-label="停止生成"
              title="停止生成"
              onClick={session.stop}
            />
          ) : (
            <Button
              appearance="primary"
              icon={<SendRegular />}
              disabled={!draft.trim()}
              aria-label="发送"
              title="发送"
              onClick={submit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
