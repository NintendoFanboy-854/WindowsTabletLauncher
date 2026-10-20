/**
 * 单条消息：用户气泡 / Agent 回答卡片（工具卡片、思考过程、来源、单条朗读）。
 *
 * 契约 §6：语音消息与打字消息同形同色，顶部只多一条声纹装饰；转写未回时声纹轻微
 * 起伏 + 两行 shimmer 骨架（不写文字标签），ASR 回填后文字淡入、声纹静止；转写失败
 * 用警告图标 + tooltip 表达，不上屏解释文字。消息不再有头像：身份只由入口/头部承担。
 */

import { useState } from 'react';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Button,
  Link,
  Text,
  Tooltip,
  makeStyles,
  motionTokens,
  tokens,
} from '@fluentui/react-components';
import {
  AlertRegular,
  ChevronDownRegular,
  ChevronUpRegular,
  GlobeRegular,
  SoundWaveCircleRegular,
  StopRegular,
} from '@fluentui/react-icons';
import type { AgentSession } from '../hooks/useAgentSession';
import type { Message } from '../types';
import { stripSourceSection } from './markdown';
import { MessageContent } from './MessageContent';
import { ToolCallCard } from './ToolCallCard';
import { VoicePeaks } from './Waveform';

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
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
    flex: 1,
  },
  userColumn: {
    alignItems: 'flex-end',
    flex: '0 1 auto',
    maxWidth: '86%',
  },
  bubble: {
    borderRadius: tokens.borderRadiusXLarge,
    paddingInline: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalS,
    minWidth: 0,
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  userBubble: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorNeutralForeground1,
  },
  assistantBubble: {
    // DENSITY：分组靠留白/背景层级，不用 1px 分割线
    backgroundColor: tokens.colorNeutralBackground2,
  },
  plainVoiceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  shimmerBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    width: '100%',
    minWidth: '140px',
  },
  shimmerLine: {
    display: 'block',
    height: '10px',
    borderRadius: tokens.borderRadiusCircular,
  },
  shimmerWide: {
    width: '86%',
  },
  shimmerNarrow: {
    width: '52%',
  },
  contentFade: {
    minWidth: 0,
    overflowWrap: 'anywhere',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minHeight: '24px',
    color: tokens.colorNeutralForeground3,
    paddingInline: tokens.spacingHorizontalXS,
  },
  meta: {
    color: tokens.colorNeutralForeground3,
  },
  speakingButton: {
    color: tokens.colorBrandForeground1,
  },
  playButton: {
    // 非播放态也要看得见：fg2 而不是和元信息一样的 fg3
    color: tokens.colorNeutralForeground2,
  },
  errorIcon: {
    color: tokens.colorPaletteRedForeground1,
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
    marginTop: tokens.spacingVerticalS,
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
  reasoning: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
});

/** 来源 chips 首屏上限（docs/DENSITY.md · Agent：最多 3 条，其余折叠） */
const SOURCE_CHIP_LIMIT = 3;
/** 气泡 20ms 错峰（契约 §3），长会话只让最后几屏有错峰感 */
const STAGGER_MS = 20;
const STAGGER_CAP = 9;

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, '0')}`;
}

export interface MessageBubbleProps {
  message: Message;
  session: AgentSession;
  /** 是否展示“思考过程”折叠区 */
  showReasoning: boolean;
  /** 列表内序号：用于气泡 20ms 错峰 */
  index: number;
}

export function MessageBubble({ message, session, showReasoning, index }: MessageBubbleProps) {
  const styles = useStyles();
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const sources = message.sources ?? [];
  const visibleSources = sourcesExpanded ? sources : sources.slice(0, SOURCE_CHIP_LIMIT);
  const hiddenSourceCount = sources.length - visibleSources.length;
  const isUser = message.role === 'user';
  const isVoice = isUser && message.input === 'voice';
  const transcriptPending = isVoice && message.transcriptStatus === 'pending';
  const transcriptFailed = isVoice && message.transcriptStatus === 'failed';
  const isStreaming = message.status === 'streaming';
  const speaking = session.speakingMessageId === message.id;
  const canSpeak =
    message.role === 'assistant' && message.status === 'done' && Boolean(message.content.trim());
  // 来源只保留 chips：有 annotations 时去掉正文末尾的“来源：”清单
  const displayContent = sources.length ? stripSourceSection(message.content) : message.content;
  const spokenLabel = isVoice
    ? `语音消息：${message.content || (transcriptFailed ? '未识别出文字' : '正在识别')}`
    : undefined;

  return (
    <div
      className={`${styles.row} ${isUser ? styles.userRow : ''} wtsl-agent-enter`}
      style={{
        animationName: 'wtsl-agent-fade-rise',
        animationDuration: `${motionTokens.durationFast}ms`,
        animationTimingFunction: motionTokens.curveDecelerateMid,
        animationDelay: `${Math.min(index, STAGGER_CAP) * STAGGER_MS}ms`,
        animationFillMode: 'both',
      }}
      aria-label={spokenLabel}
    >
      <div className={`${styles.column} ${isUser ? styles.userColumn : ''}`}>
        <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
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

          {isVoice ? (
            <VoicePeaks
              peaks={message.voicePeaks}
              pending={transcriptPending}
              failed={transcriptFailed}
            />
          ) : null}

          {transcriptPending ? (
            <div className={styles.shimmerBlock} aria-hidden="true">
              <span
                className={`${styles.shimmerLine} ${styles.shimmerWide} wtsl-agent-shimmer`}
                data-wtsl-agent-animated="true"
                style={{
                  animationName: 'wtsl-agent-shimmer',
                  animationDuration: `${motionTokens.durationSlower}ms`,
                  animationTimingFunction: motionTokens.curveLinear,
                  animationIterationCount: 'infinite',
                }}
              />
              <span
                className={`${styles.shimmerLine} ${styles.shimmerNarrow} wtsl-agent-shimmer`}
                data-wtsl-agent-animated="true"
                style={{
                  animationName: 'wtsl-agent-shimmer',
                  animationDuration: `${motionTokens.durationSlower}ms`,
                  animationTimingFunction: motionTokens.curveLinear,
                  animationIterationCount: 'infinite',
                }}
              />
            </div>
          ) : displayContent ? (
            <div
              className={`${styles.contentFade} wtsl-agent-enter`}
              style={{
                animationName: 'wtsl-agent-fade',
                animationDuration: `${motionTokens.durationFast}ms`,
                animationTimingFunction: motionTokens.curveDecelerateMid,
                animationFillMode: 'both',
              }}
            >
              <MessageContent text={displayContent} />
            </div>
          ) : null}

          {transcriptFailed ? (
            <div className={styles.plainVoiceRow}>
              <Tooltip content="没有识别出文字" relationship="label">
                <AlertRegular
                  className={styles.errorIcon}
                  aria-label="没有识别出文字"
                  fontSize={16}
                />
              </Tooltip>
            </div>
          ) : null}

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
              {visibleSources.map((source) => (
                <Link
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.sourceChip}
                  title={source.summary ?? source.url}
                >
                  <GlobeRegular fontSize={16} />
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
                  size="large"
                  appearance="subtle"
                  icon={sourcesExpanded ? <ChevronUpRegular /> : <ChevronDownRegular />}
                  onClick={() => setSourcesExpanded((previous) => !previous)}
                >
                  {sourcesExpanded ? '收起' : `还有 ${hiddenSourceCount} 条`}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className={styles.statusRow}>
          <Text size={200}>{formatTime(message.createdAt)}</Text>
          {isVoice && message.voiceDurationSec ? (
            <Text size={200} className={styles.meta}>
              {formatDuration(message.voiceDurationSec)}
            </Text>
          ) : null}
          {message.status === 'aborted' ? (
            <Tooltip content="已停止" relationship="label">
              <StopRegular aria-label="已停止" fontSize={12} />
            </Tooltip>
          ) : null}
          {message.status === 'error' ? (
            <Tooltip content="生成失败" relationship="label">
              <AlertRegular className={styles.errorIcon} aria-label="生成失败" fontSize={12} />
            </Tooltip>
          ) : null}
          {canSpeak ? (
            <Tooltip content={speaking ? '停止朗读' : '朗读'} relationship="label">
              <Button
                size="large"
                appearance="subtle"
                className={speaking ? styles.speakingButton : styles.playButton}
                icon={speaking ? <StopRegular /> : <SoundWaveCircleRegular />}
                data-wtsl-agent-animated={speaking ? 'true' : undefined}
                style={{
                  animationName: speaking ? 'wtsl-agent-pulse' : undefined,
                  animationDuration: `${motionTokens.durationSlow}ms`,
                  animationTimingFunction: motionTokens.curveEasyEase,
                  animationIterationCount: speaking ? 'infinite' : undefined,
                }}
                aria-label={speaking ? '停止朗读' : '朗读这条回答'}
                onClick={() => session.speakMessage(message.id)}
              />
            </Tooltip>
          ) : null}
        </div>
      </div>
    </div>
  );
}
