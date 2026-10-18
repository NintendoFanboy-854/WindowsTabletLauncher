/**
 * 单条消息：用户气泡 / Agent 回答卡片（含工具卡片、思考过程、来源、朗读按钮）。
 */

import { useState } from 'react';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Button,
  Link,
  Text,
  makeStyles,
  motionTokens,
  tokens,
} from '@fluentui/react-components';
import {
  AlertRegular,
  BotRegular,
  ChevronDownRegular,
  ChevronUpRegular,
  GlobeRegular,
  PersonRegular,
  Speaker2Regular,
  SpeakerMuteRegular,
} from '@fluentui/react-icons';
import type { AgentSession } from '../hooks/useAgentSession';
import type { Message } from '../types';
import { MessageContent } from './MessageContent';
import { ToolCallCard } from './ToolCallCard';

const useStyles = makeStyles({
  row: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    alignItems: 'flex-start',
    maxWidth: '100%',
    minWidth: 0,
  },
  userRow: {
    flexDirection: 'row-reverse',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
    maxWidth: '92%',
  },
  userColumn: {
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: tokens.borderRadiusXLarge,
    paddingInline: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalS,
    minWidth: 0,
  },
  userBubble: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorNeutralForeground1,
    borderStartEndRadius: tokens.borderRadiusSmall,
  },
  assistantBubble: {
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderStartStartRadius: tokens.borderRadiusSmall,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    color: tokens.colorNeutralForeground3,
    paddingInline: tokens.spacingHorizontalXS,
  },
  caret: {
    display: 'inline-block',
    width: '0.5em',
    color: tokens.colorBrandForeground1,
  },
  sources: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    paddingTop: tokens.spacingVerticalXS,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  sourceChip: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
    paddingInline: tokens.spacingHorizontalS,
    paddingBlock: tokens.spacingVerticalXXS,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground3,
    textDecoration: 'none',
  },
  sourceTitle: {
    flex: 1,
    minWidth: 0,
  },
  sourceMeta: {
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
  sourcesFooter: {
    color: tokens.colorNeutralForeground3,
    textAlign: 'end',
  },
  reasoning: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
  avatarUser: {
    backgroundColor: tokens.colorNeutralBackground3,
  },
  avatarAgent: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorNeutralForeground1,
  },
});

/** 来源 chips 首屏上限（docs/DENSITY.md · Agent：最多 3 条，其余折叠） */
const SOURCE_CHIP_LIMIT = 3;

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export interface MessageBubbleProps {
  message: Message;
  session: AgentSession;
  /** 是否展示“思考过程”折叠区 */
  showReasoning: boolean;
}

export function MessageBubble({ message, session, showReasoning }: MessageBubbleProps) {
  const styles = useStyles();
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const sources = message.sources ?? [];
  const visibleSources = sourcesExpanded ? sources : sources.slice(0, SOURCE_CHIP_LIMIT);
  const hiddenSourceCount = sources.length - visibleSources.length;
  const isUser = message.role === 'user';
  const isStreaming = message.status === 'streaming';
  const speaking = session.speakingMessageId === message.id;
  const canSpeak =
    message.role === 'assistant' && message.status === 'done' && Boolean(message.content.trim());

  return (
    <div
      className={`${styles.row} ${isUser ? styles.userRow : ''}`}
      data-wtsl-agent-animated="true"
      style={{
        animationName: 'wtsl-agent-fade-rise',
        animationDuration: `${motionTokens.durationNormal}ms`,
        animationTimingFunction: motionTokens.curveDecelerateMid,
      }}
    >
      <Avatar
        size={28}
        icon={isUser ? <PersonRegular /> : <BotRegular />}
        className={isUser ? styles.avatarUser : styles.avatarAgent}
      />
      <div className={`${styles.column} ${isUser ? styles.userColumn : ''}`}>
        <div
          className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}
        >
          {message.toolCalls?.map((record) => (
            <ToolCallCard key={record.id} record={record} />
          ))}

          {!isUser && showReasoning && message.reasoning ? (
            <Accordion collapsible>
              <AccordionItem value="reasoning">
                <AccordionHeader size="small">思考过程</AccordionHeader>
                <AccordionPanel>
                  <Text as="p" className={styles.reasoning}>
                    {message.reasoning}
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          ) : null}

          {message.content ? <MessageContent text={message.content} /> : null}

          {isStreaming ? (
            <span
              className={styles.caret}
              data-wtsl-agent-animated="true"
              style={{
                animationName: 'wtsl-agent-caret',
                animationDuration: `${motionTokens.durationUltraSlow}ms`,
                animationTimingFunction: motionTokens.curveLinear,
                animationIterationCount: 'infinite',
              }}
            >
              ▍
            </span>
          ) : null}

          {sources.length ? (
            <div className={styles.sources}>
              <Text size={200} weight="semibold">
                来源
              </Text>
              {visibleSources.map((source) => (
                <Link
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.sourceChip}
                  title={source.summary ?? source.url}
                >
                  <GlobeRegular />
                  <Text size={200} truncate className={styles.sourceTitle}>
                    {source.title || source.url}
                  </Text>
                  {source.siteName ? (
                    <Text size={100} className={styles.sourceMeta}>
                      {source.siteName}
                    </Text>
                  ) : null}
                </Link>
              ))}
              {hiddenSourceCount > 0 ? (
                <Button
                  size="small"
                  appearance="subtle"
                  icon={sourcesExpanded ? <ChevronUpRegular /> : <ChevronDownRegular />}
                  onClick={() => setSourcesExpanded((previous) => !previous)}
                >
                  {sourcesExpanded ? '收起来源' : `还有 ${hiddenSourceCount} 条来源`}
                </Button>
              ) : null}
              {message.webSearchUsage ? (
                <Text size={100} className={styles.sourcesFooter}>
                  联网搜索 · {message.webSearchUsage.toolUsage} 次检索 /{' '}
                  {message.webSearchUsage.pageUsage} 个页面
                </Text>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className={styles.statusRow}>
          <Text size={100}>{formatTime(message.createdAt)}</Text>
          {message.status === 'aborted' ? <Text size={100}>已停止生成</Text> : null}
          {message.status === 'error' ? (
            <>
              <AlertRegular />
              <Text size={100}>生成失败</Text>
            </>
          ) : null}
          {canSpeak ? (
            <Button
              size="small"
              appearance="subtle"
              icon={speaking ? <SpeakerMuteRegular /> : <Speaker2Regular />}
              aria-label={speaking ? '停止朗读这条回答' : '朗读这条回答'}
              title={speaking ? '停止朗读' : '朗读'}
              onClick={() => session.speakMessage(message.id)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
