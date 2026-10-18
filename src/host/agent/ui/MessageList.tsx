/**
 * 消息列表：内部滚动，只有用户本来就停在底部时才自动跟随新内容。
 */

import { useEffect, useRef, type ReactElement } from 'react';
import { Button, Spinner, Text, Title2, makeStyles, tokens } from '@fluentui/react-components';
import { BotRegular, SearchRegular, ClockRegular, CheckmarkCircleRegular } from '@fluentui/react-icons';
import type { AgentSession } from '../hooks/useAgentSession';
import { MessageBubble } from './MessageBubble';

const useStyles = makeStyles({
  scroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    padding: tokens.spacingHorizontalM,
    scrollbarGutter: 'stable',
  },
  empty: {
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalM,
    textAlign: 'center',
    padding: tokens.spacingHorizontalXL,
    maxWidth: '420px',
  },
  emptyIcon: {
    width: '48px',
    height: '48px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorNeutralForeground1,
  },
  suggestions: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    width: '100%',
  },
  streamingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground3,
    paddingInline: tokens.spacingHorizontalM,
  },
});

const SUGGESTIONS: Array<{ text: string; icon: ReactElement }> = [
  { text: '今天还有什么待办？', icon: <CheckmarkCircleRegular /> },
  { text: '现在几点了？', icon: <ClockRegular /> },
  { text: '搜一下 MiMo V2.6 的最新消息', icon: <SearchRegular /> },
];

export function MessageList({ session }: { session: AgentSession }) {
  const styles = useStyles();
  const containerRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const messages = session.conversation?.messages ?? [];
  const lastMessage = messages[messages.length - 1];
  const contentLength = messages.reduce((sum, message) => sum + message.content.length, 0);

  const handleScroll = () => {
    const element = containerRef.current;
    if (!element) return;
    stickToBottom.current =
      element.scrollHeight - element.scrollTop - element.clientHeight < 96;
  };

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !stickToBottom.current) return;
    element.scrollTop = element.scrollHeight;
  }, [messages.length, contentLength, session.status, lastMessage?.status]);

  return (
    <div className={styles.scroll} ref={containerRef} onScroll={handleScroll}>
      {messages.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <BotRegular fontSize={24} />
          </div>
          <Title2>桌面 Agent</Title2>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            直接说人话：查待办、开番茄钟、搜实时信息，我会调用插件工具完成。
          </Text>
          <div className={styles.suggestions}>
            {SUGGESTIONS.map((suggestion) => (
              <Button
                key={suggestion.text}
                appearance="outline"
                size="large"
                icon={suggestion.icon}
                onClick={() => void session.send(suggestion.text)}
              >
                {suggestion.text}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            session={session}
            showReasoning={session.settings.thinking}
          />
        ))
      )}

      {session.status === 'streaming' ? (
        <div className={styles.streamingRow} data-wtsl-agent-animated="true">
          <Spinner size="tiny" />
          <Text size={200}>正在生成…</Text>
        </div>
      ) : null}
      {session.status === 'tools' ? (
        <div className={styles.streamingRow} data-wtsl-agent-animated="true">
          <Spinner size="tiny" />
          <Text size={200}>正在调用工具…</Text>
        </div>
      ) : null}
    </div>
  );
}
