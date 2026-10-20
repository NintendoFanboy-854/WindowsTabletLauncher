/**
 * 消息列表：内部滚动，只有用户本来就停在底部时才自动跟随新内容。
 *
 * 空态只有 ChatSparkle 小标 + 少量可直接发送的建议（不写标题、不回显模型名）；
 * 生成/工具调用只给不打断的进度指示，不写“正在生成…”这类解释文字（必要 aria 保留）。
 */

import { useEffect, useRef, type ReactElement } from 'react';
import { Button, Spinner, makeStyles, tokens } from '@fluentui/react-components';
import {
  ChatSparkleRegular,
  CheckmarkCircleRegular,
  ClockRegular,
  SearchRegular,
} from '@fluentui/react-icons';
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
    gap: tokens.spacingVerticalL,
    padding: tokens.spacingHorizontalL,
    maxWidth: '320px',
  },
  emptyMark: {
    color: tokens.colorBrandForeground1,
  },
  suggestions: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    width: '100%',
  },
  suggestionButton: {
    justifyContent: 'flex-start',
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    paddingInline: tokens.spacingHorizontalM,
    color: tokens.colorNeutralForeground3,
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
    stickToBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 96;
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
          <ChatSparkleRegular fontSize={24} className={styles.emptyMark} aria-hidden="true" />
          <div className={styles.suggestions}>
            {SUGGESTIONS.map((suggestion) => (
              <Button
                key={suggestion.text}
                appearance="outline"
                size="large"
                className={styles.suggestionButton}
                icon={suggestion.icon}
                onClick={() => void session.send(suggestion.text)}
              >
                {suggestion.text}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            session={session}
            showReasoning={session.settings.thinking}
            index={index}
          />
        ))
      )}

      {session.status === 'streaming' ? (
        <div
          className={styles.progressRow}
          role="status"
          aria-label="正在生成回答"
          data-wtsl-agent-animated="true"
        >
          <Spinner size="extra-tiny" />
        </div>
      ) : null}
      {session.status === 'tools' ? (
        <div
          className={styles.progressRow}
          role="status"
          aria-label="正在调用工具"
          data-wtsl-agent-animated="true"
        >
          <Spinner size="extra-tiny" />
        </div>
      ) : null}
    </div>
  );
}
