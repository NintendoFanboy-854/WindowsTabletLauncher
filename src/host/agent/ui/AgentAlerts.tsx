/**
 * Agent 的错误 / 引导提示条（配置、会话错误、麦克风、朗读失败）。
 *
 * 半高语音窗与全高对话窗都要能看到同一份提示，所以从 Composer 抽出来共用；
 * 只给“现状 + 下一步动作”，不写解释性状态文案（契约 §9）。
 */

import {
  Button,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { ArrowClockwiseRegular, DismissRegular } from '@fluentui/react-icons';
import type { AgentSession } from '../hooks/useAgentSession';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    minWidth: 0,
  },
  banner: {
    width: '100%',
  },
});

export interface AgentAlertsProps {
  session: AgentSession;
  /** 打开 Agent 设置（配置引导） */
  onOpenSettings: () => void;
}

export function AgentAlerts({ session, onOpenSettings }: AgentAlertsProps) {
  const styles = useStyles();
  const showSetup = !session.configured && !session.isMock;
  const showMicError = Boolean(session.voice.error) && session.voice.stage === 'idle';
  if (!showSetup && !session.error && !showMicError && !session.voice.speechError) return null;

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

      {showMicError ? (
        <MessageBar intent="warning" className={styles.banner}>
          <MessageBarBody>{session.voice.error?.message}</MessageBarBody>
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
    </div>
  );
}
