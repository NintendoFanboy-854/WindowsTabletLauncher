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
import {
  ArrowClockwiseRegular,
  DismissRegular,
  KeyboardRegular,
  MicRegular,
  OpenRegular,
} from '@fluentui/react-icons';
import { TOUCH_TARGET_CSS } from '../../design/metrics';
import type { AgentSession, AgentSessionError } from '../hooks/useAgentSession';

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
  // 44 触控目标：Fluent large 图标按钮 ≈40，触控口径要兜到 44
  touchTarget: {
    minWidth: TOUCH_TARGET_CSS,
    minHeight: TOUCH_TARGET_CSS,
  },
});

export interface SessionErrorBarProps {
  error: AgentSessionError;
  onRetry: () => void;
  onDismiss: () => void;
  className?: string;
}

/**
 * 单条会话错误的提示条（现状 + 下一步动作）。
 *
 * 从 `AgentAlerts` 抽出来是为了**同一份错误只有一处渲染**：全高对话里，失败那一轮
 * 没有正文时提示条内联在轮次容器里（轮次自己就是错误的主体），此时输入区的
 * `AgentAlerts` 不再重复一遍；半高语音窗没有消息列表，仍由 `AgentAlerts` 承担。
 */
export function SessionErrorBar({ error, onRetry, onDismiss, className }: SessionErrorBarProps) {
  return (
    <MessageBar intent="error" className={className}>
      <MessageBarBody>{error.message}</MessageBarBody>
      <MessageBarActions
        containerAction={
          <Button
            appearance="transparent"
            size="large"
            icon={<DismissRegular />}
            aria-label="关闭错误提示"
            onClick={onDismiss}
          />
        }
      >
        {error.action ? (
          <Button
            size="large"
            appearance="secondary"
            onClick={() => {
              if (error.action?.url) window.open(error.action.url, '_blank', 'noopener,noreferrer');
            }}
          >
            {error.action.label}
          </Button>
        ) : null}
        {error.retryable ? (
          <Button
            size="large"
            appearance="outline"
            icon={<ArrowClockwiseRegular />}
            aria-label="重试"
            onClick={onRetry}
          />
        ) : null}
      </MessageBarActions>
    </MessageBar>
  );
}

export interface AgentAlertsProps {
  session: AgentSession;
  /** 打开 Agent 设置（配置引导） */
  onOpenSettings: () => void;
  /**
   * 抑制 `session.error` 那条提示：错误已经内联渲染在失败轮次里时传 true，
   * 避免同一条错误在窗口里出现两次（其余三类提示照常）。
   */
  suppressTurnError?: boolean;
  /**
   * 转写失败的就地出口（半高语音窗传 true）：
   * 「再说一次」= 直接开始录音（不是新页面），「改用键盘」= 打开全高对话。
   */
  voiceFailureActions?: boolean;
  onRetryVoice?: () => void;
  onUseKeyboard?: () => void;
  /** 麦克风错误时的系统引导（打开 ms-settings:privacy-microphone） */
  onOpenMicSettings?: () => void;
}

export function AgentAlerts({
  session,
  onOpenSettings,
  suppressTurnError = false,
  voiceFailureActions = false,
  onRetryVoice,
  onUseKeyboard,
  onOpenMicSettings,
}: AgentAlertsProps) {
  const styles = useStyles();
  const showSetup = !session.configured && !session.isMock;
  const showMicError = Boolean(session.voice.error) && session.voice.stage === 'idle';
  const showTurnError = Boolean(session.error) && !suppressTurnError;
  if (!showSetup && !showTurnError && !showMicError && !session.voice.speechError) return null;

  const voiceError = session.voice.error;
  const asrFailed = voiceError?.kind === 'asr';
  const retryVoice = voiceFailureActions && Boolean(onRetryVoice);
  const useKeyboard = voiceFailureActions && Boolean(onUseKeyboard);

  return (
    <div className={styles.root}>
      {showSetup ? (
        <MessageBar intent="warning" className={styles.banner}>
          <MessageBarBody>还没有填写 MiMo API Key</MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button
                appearance="transparent"
                size="large"
                className={styles.touchTarget}
                onClick={onOpenSettings}
              >
                去设置
              </Button>
            }
          />
        </MessageBar>
      ) : null}

      {showTurnError && session.error ? (
        <SessionErrorBar
          error={session.error}
          onRetry={() => void session.retry()}
          onDismiss={session.dismissError}
          className={styles.banner}
        />
      ) : null}

      {showMicError && voiceError ? (
        <MessageBar intent="warning" className={styles.banner}>
          {/* 转写失败不写工程错误：一句人能听懂的提示 + 两个出口；原始错误留在 title 里供排障 */}
          <MessageBarBody title={voiceError.message}>
            {asrFailed ? '没听清，再说一次' : voiceError.message}
          </MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button
                appearance="transparent"
                size="large"
                className={styles.touchTarget}
                icon={<DismissRegular />}
                aria-label="关闭语音提示"
                onClick={session.dismissError}
              />
            }
          >
            {retryVoice ? (
              <Button
                size="large"
                appearance="primary"
                className={styles.touchTarget}
                icon={<MicRegular />}
                onClick={onRetryVoice}
              >
                再说一次
              </Button>
            ) : null}
            {useKeyboard ? (
              <Button
                size="large"
                appearance="secondary"
                className={styles.touchTarget}
                icon={<KeyboardRegular />}
                onClick={onUseKeyboard}
              >
                改用键盘
              </Button>
            ) : null}
            {!asrFailed && onOpenMicSettings ? (
              <Button
                size="large"
                appearance="secondary"
                className={styles.touchTarget}
                icon={<OpenRegular />}
                onClick={onOpenMicSettings}
              >
                打开 Windows 设置
              </Button>
            ) : null}
          </MessageBarActions>
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
