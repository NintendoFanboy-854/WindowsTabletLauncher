/**
 * 全屏语音面板：大字幕 + 波形 + 说话按钮。
 * 与浮层/侧栏共用同一个会话状态，因此语音里产生的对话回到浮层也还在。
 */

import {
  Button,
  MessageBar,
  MessageBarBody,
  Text,
  Title2,
  ToggleButton,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowLeftRegular,
  ArrowClockwiseRegular,
  MicRegular,
  SettingsRegular,
  Speaker2Regular,
  SpeakerMuteRegular,
  StopRegular,
} from '@fluentui/react-icons';
import type { AgentSession } from '../hooks/useAgentSession';
import { Waveform } from './Waveform';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    background:
      `radial-gradient(1200px 700px at 50% -10%, ${tokens.colorBrandBackground2}, transparent 70%), ${tokens.colorNeutralBackground1}`,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingHorizontalL,
  },
  topBarTitle: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    flex: 1,
    minWidth: 0,
  },
  body: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalL,
    paddingInline: tokens.spacingHorizontalXXL,
    paddingBlock: tokens.spacingVerticalM,
    overflow: 'hidden',
  },
  userLine: {
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
    maxWidth: '800px',
    overflowWrap: 'anywhere',
  },
  answer: {
    maxWidth: '900px',
    textAlign: 'center',
    color: tokens.colorNeutralForeground1,
    overflowY: 'auto',
    maxHeight: '46vh',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    // 大字幕：小屏用 base500，大屏升到 hero700
    fontSize: `clamp(${tokens.fontSizeBase500}, 3.6vmin, ${tokens.fontSizeHero700})`,
    lineHeight: `clamp(${tokens.lineHeightBase500}, 4.6vmin, ${tokens.lineHeightHero700})`,
    fontWeight: tokens.fontWeightRegular,
  },
  statusText: {
    color: tokens.colorNeutralForeground2,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalXXL,
    paddingInline: tokens.spacingHorizontalL,
  },
  primaryActions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
  },
  micButton: {
    width: 'clamp(72px, 14vmin, 120px)',
    height: 'clamp(72px, 14vmin, 120px)',
    borderRadius: tokens.borderRadiusCircular,
  },
  hint: {
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
  },
  error: {
    width: 'min(640px, 92vw)',
  },
});

function stopLabel(session: AgentSession): string {
  if (session.voice.stage === 'recording') return '正在聆听，再说一句或点按钮结束';
  if (session.voice.stage === 'transcribing') return '正在识别刚才的语音…';
  if (session.voice.stage === 'speaking') return '正在朗读回答';
  if (session.status !== 'idle') return '正在回答…';
  return '点一下麦克风开始说话';
}

export function VoiceStage({
  session,
  onExit,
  onOpenSettings,
}: {
  session: AgentSession;
  onExit: () => void;
  onOpenSettings: () => void;
}) {
  const styles = useStyles();
  const messages = session.conversation?.messages ?? [];
  const lastUser = [...messages].reverse().find((message) => message.role === 'user');
  const lastAssistant = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant' && message.content.trim());

  const recording = session.voice.stage === 'recording';
  const transcribing = session.voice.stage === 'transcribing';
  const reading = session.settings.tts.continuous || session.voice.stage === 'speaking';
  const busy = session.status !== 'idle';

  const handleMic = () => {
    if (transcribing) return;
    if (recording) {
      void session.stopRecording();
      return;
    }
    void session.startRecording();
  };

  return (
    <div className={styles.root}>
      <div className={styles.topBar}>
        <Button
          appearance="subtle"
          icon={<ArrowLeftRegular />}
          onClick={onExit}
          aria-label="退出语音模式"
        >
          返回
        </Button>
        <div className={styles.topBarTitle}>
          <Title2>语音模式</Title2>
          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
            {session.isMock ? 'Mock 演示：语音为模拟状态' : 'MiMo 流式语音'}
          </Text>
        </div>
        <ToggleButton
          appearance="subtle"
          icon={reading ? <SpeakerMuteRegular /> : <Speaker2Regular />}
          checked={reading}
          onClick={session.toggleContinuousReading}
          aria-label={reading ? '关闭连续朗读' : '开启连续朗读'}
          title={reading ? '关闭连续朗读' : '开启连续朗读'}
        />
        <Button
          appearance="subtle"
          icon={<SettingsRegular />}
          onClick={onOpenSettings}
          aria-label="打开设置"
        />
      </div>

      <div className={styles.body}>
        {lastUser ? (
          <Text className={styles.userLine} size={400} truncate>
            你说：{lastUser.content}
          </Text>
        ) : (
          <Text className={styles.userLine} size={400}>
            说点什么吧，比如「帮我看看今天的待办」
          </Text>
        )}

        <Text className={styles.answer}>
          {lastAssistant?.content ??
            (session.voice.stage === 'recording' ? '我在听…' : '你好，我是桌面 Agent')}
        </Text>

        <Waveform
          active={recording || reading || busy}
          level={session.voice.level}
          variant={recording ? 'listening' : reading ? 'speaking' : 'idle'}
        />

        <div className={styles.statusText}>
          {session.voice.error ? null : <Text size={300}>{stopLabel(session)}</Text>}
        </div>

        {session.voice.error ? (
          <MessageBar intent="warning" className={styles.error}>
            <MessageBarBody>{session.voice.error}</MessageBarBody>
          </MessageBar>
        ) : null}
      </div>

      <div className={styles.footer}>
        <div className={styles.primaryActions}>
          <ToggleButton
            size="large"
            shape="circular"
            className={styles.micButton}
            style={{
              width: 'clamp(76px, 15vmin, 124px)',
              height: 'clamp(76px, 15vmin, 124px)',
            }}
            appearance={recording ? 'primary' : 'outline'}
            checked={recording}
            icon={recording ? <StopRegular /> : transcribing ? <ArrowClockwiseRegular /> : <MicRegular />}
            disabled={transcribing || busy}
            onClick={handleMic}
            aria-label={recording ? '结束录音' : '开始录音'}
            title={recording ? '结束录音并发送' : '开始说话'}
          />
        </div>
        <Text className={styles.hint} size={200}>
          语音交互会自动切到全屏；关掉全屏后对话仍在浮层里
        </Text>
      </div>
    </div>
  );
}
