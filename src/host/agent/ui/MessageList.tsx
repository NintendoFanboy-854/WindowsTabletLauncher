/**
 * 消息列表：内部滚动，只有用户本来就停在底部时才自动跟随新内容。
 *
 * 空态只有 ChatSparkle 小标 + 少量可直接发送的建议（不写标题、不回显模型名）。
 * 进行中的反馈**不再由本列表承担**：它已并入轮次时间线（`MessageBubble` → `TurnTimeline`
 * + `PendingLine`），一屏只有一个进行中指示器（FLUENT2 §12「不用多个 spinner 同时出现」；
 * 旧实现在列表尾部再放一个 spinner，与工具卡里的 spinner 重复）。
 *
 * 内容轴：与语音窗/对话面板同一套内衬 16（`spacingHorizontalL`）；本列表**不随形态
 * 切换重排**（父层按固定尺寸排版），所以展开/收起不会重置滚动位置。
 *
 * 滚动条**不参与布局**（`[data-wtsl-message-scroll]` 在 agent.css 里隐藏）：WebView2 的经典
 * 滚动条会吃掉 15px 布局宽度，`stable` 只占右侧时内容盒相对容器中心左偏半个条宽（8.5px），
 * `stable both-edges` 两侧都占时左缘又比 Composer 右偏 15px——两种都不是「和输入框同一条轴」。
 * 触控产品的滚动靠滑动，不靠拖条，所以直接不显示滚动条：左右内衬严格 16、与 Composer 同线，
 * 且滚动条出现/消失都不会引起回流。
 */

import { useEffect, useRef, type ReactElement } from 'react';
import { Button, makeStyles, tokens } from '@fluentui/react-components';
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
    padding: tokens.spacingHorizontalL,
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
    <div className={styles.scroll} ref={containerRef} onScroll={handleScroll} data-wtsl-message-scroll>
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
          <MessageBubble key={message.id} message={message} session={session} index={index} />
        ))
      )}
    </div>
  );
}
