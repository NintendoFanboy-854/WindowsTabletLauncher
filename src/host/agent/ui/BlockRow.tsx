/**
 * 时间线里的一行：**只按 `kind` 分派**，绝不按工具名分支。
 *
 * 四种原始形态（设计 §4.1）：
 * - `text`   → Markdown 正文（顶格，永不折叠，这是答案）；
 * - `thinking` → 折叠行（44 命中区）+ 展开的思考原文；
 * - `tool`   → 折叠行（44 命中区）+ 展开的参数/结果（等宽、块内滚动）；
 * - `notice` → 一行就地告知（图标 + 文字 + 可选动作，永不折叠）。
 *
 * 折叠行的三段结构固定：`[箭头] [摘要（可省略号）] [状态标记（flex-shrink:0）]`。
 * 失败**永远**在行尾固定的状态标记里（danger 圆点 + 「失败」），摘要被省略号吃掉也不影响
 * ——这是 `AGENT-SURFACE-CONTRACT.md` §17.2 既有的口径（形状 + 文字 + 颜色三重编码）。
 *
 * 进行中不加 spinner / 进度条：一屏唯一的进行中指示器是 `PendingLine`（FLUENT2 §12），
 * 这里只把摘要文字改成现在时、颜色升到品牌色。
 */
import {
  Link,
  Text,
  makeStyles,
  mergeClasses,
  motionTokens,
  tokens,
} from '@fluentui/react-components';
import {
  AlertRegular,
  ChevronDownRegular,
  ChevronRightRegular,
  InfoRegular,
  WarningRegular,
} from '@fluentui/react-icons';
import type { ToolBlock, TurnBlock } from '../types';
import { TOUCH_TARGET_CSS } from '../../design/metrics';
import { prettyJson, summarizeNotice, summarizeThinking, summarizeToolBlock } from './blockSummary';
import { MessageContent } from './MessageContent';
import { useReducedMotion } from './useReducedMotion';

const useStyles = makeStyles({
  textBlock: {
    minWidth: 0,
    overflowWrap: 'anywhere',
  },
  process: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  /**
   * 折叠行整行可点：命中区 = 触控目标 44（DESIGN.md:46 的下限，取项目唯一常量出口），
   * 横向撑满内容列，不做成一个小 chip。
   */
  header: {
    appearance: 'none',
    border: 'none',
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    width: '100%',
    minHeight: TOUCH_TARGET_CSS,
    paddingInline: 0,
    marginInline: 0,
    textAlign: 'start',
    cursor: 'pointer',
    color: tokens.colorNeutralForeground3,
    fontFamily: tokens.fontFamilyBase,
    ':hover': {
      color: tokens.colorNeutralForeground2,
    },
    ':focus-visible': {
      outlineColor: tokens.colorStrokeFocus2,
      outlineStyle: 'solid',
      outlineWidth: tokens.strokeWidthThin,
      outlineOffset: tokens.spacingHorizontalXXS,
      borderRadius: tokens.borderRadiusSmall,
    },
  },
  chevron: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground3,
  },
  summary: {
    flex: '1 1 auto',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground3,
  },
  runningSummary: {
    color: tokens.colorBrandForeground1,
  },
  /** 行尾固定标记：摘要再长也不被省略号吃掉 */
  marker: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
  },
  markerDot: {
    display: 'inline-block',
    flexShrink: 0,
    width: tokens.spacingHorizontalS,
    height: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorStatusDangerForeground1,
  },
  danger: {
    color: tokens.colorStatusDangerForeground1,
  },
  warning: {
    color: tokens.colorStatusWarningForeground1,
  },
  info: {
    color: tokens.colorNeutralForeground3,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    // 展开区相对折叠行再缩进一级，紧贴 rail 之后
    paddingInlineStart: tokens.spacingHorizontalM,
    paddingBlockEnd: tokens.spacingVerticalS,
    minWidth: 0,
  },
  sectionLabel: {
    color: tokens.colorNeutralForeground3,
  },
  reasoning: {
    margin: 0,
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase300,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
  /** 参数/结果：等宽 + 只占 8 行，超出在块内滚动（不把正文挤出屏幕） */
  mono: {
    margin: 0,
    maxHeight: `calc(${tokens.lineHeightBase200} * 8)`,
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
    color: tokens.colorNeutralForeground2,
  },
  notice: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
    minHeight: TOUCH_TARGET_CSS,
  },
  noticeIcon: {
    flexShrink: 0,
  },
  noticeText: {
    flex: '1 1 auto',
    minWidth: 0,
    color: tokens.colorNeutralForeground2,
    overflowWrap: 'anywhere',
  },
  actionLink: {
    flexShrink: 0,
    minHeight: TOUCH_TARGET_CSS,
    display: 'inline-flex',
    alignItems: 'center',
  },
});

export interface BlockRowProps {
  block: TurnBlock;
  /** 只有 thinking / tool 会用到：这一块是否展开 */
  expanded: boolean;
  onToggle: () => void;
}

function isRunning(block: Exclude<TurnBlock, { kind: 'text' } | { kind: 'notice' }>): boolean {
  return block.kind === 'thinking' ? block.open : block.call.status === 'running';
}

function isFailed(block: ToolBlock): boolean {
  return block.call.status === 'error';
}

export function BlockRow({ block, expanded, onToggle }: BlockRowProps) {
  const styles = useStyles();
  const reducedMotion = useReducedMotion();

  /** 展开区入场：一次性淡入 + 极小位移；减少动态效果下只留透明度 */
  const bodyStyle = {
    animationName: reducedMotion ? undefined : 'wtsl-agent-expand',
    animationDuration: `${motionTokens.durationFaster}ms`,
    animationTimingFunction: motionTokens.curveDecelerateMid,
    animationFillMode: 'both' as const,
  };

  if (block.kind === 'text') {
    return (
      <div className={styles.textBlock}>
        <MessageContent text={block.text} />
      </div>
    );
  }

  if (block.kind === 'notice') {
    const tone =
      block.level === 'error'
        ? styles.danger
        : block.level === 'warning'
          ? styles.warning
          : styles.info;
    const NoticeIcon =
      block.level === 'error' ? AlertRegular : block.level === 'warning' ? WarningRegular : InfoRegular;
    return (
      <div className={styles.notice}>
        <NoticeIcon
          fontSize={16}
          className={mergeClasses(styles.noticeIcon, tone)}
          aria-hidden="true"
        />
        <Text size={200} className={styles.noticeText}>
          {summarizeNotice(block)}
        </Text>
        {block.action ? (
          <Link
            href={block.action.url}
            target="_blank"
            rel="noreferrer"
            className={styles.actionLink}
          >
            <Text size={200}>{block.action.label}</Text>
          </Link>
        ) : null}
      </div>
    );
  }

  const summary = block.kind === 'thinking' ? summarizeThinking(block) : summarizeToolBlock(block);
  const failed = block.kind === 'tool' && isFailed(block);
  const running = isRunning(block);

  return (
    <div className={styles.process}>
      <button
        type="button"
        className={styles.header}
        aria-expanded={expanded}
        data-wtsl-turn-collapsed={expanded ? 'false' : 'true'}
        onClick={onToggle}
      >
        {expanded ? (
          <ChevronDownRegular fontSize={16} className={styles.chevron} aria-hidden="true" />
        ) : (
          <ChevronRightRegular fontSize={16} className={styles.chevron} aria-hidden="true" />
        )}
        <Text
          size={200}
          className={mergeClasses(styles.summary, running ? styles.runningSummary : undefined)}
        >
          {summary}
        </Text>
        {failed ? (
          <span className={styles.marker} data-wtsl-turn-failed="true">
            <span className={styles.markerDot} aria-hidden="true" />
            <Text size={200} className={styles.danger}>
              失败
            </Text>
          </span>
        ) : null}
      </button>

      {expanded ? (
        block.kind === 'thinking' ? (
          <div className={styles.body} style={bodyStyle}>
            <Text size={200} className={styles.sectionLabel}>
              思考
            </Text>
            <p className={styles.reasoning}>{block.text}</p>
          </div>
        ) : (
          <div className={styles.body} style={bodyStyle}>
            <Text size={200} className={styles.sectionLabel}>
              参数
            </Text>
            <pre className={styles.mono}>{prettyJson(block.call.args)}</pre>
            {isFailed(block) ? (
              <>
                <Text size={200} className={styles.sectionLabel}>
                  错误
                </Text>
                <p className={mergeClasses(styles.reasoning, styles.danger)}>
                  {block.call.error ?? '工具执行失败'}
                </p>
              </>
            ) : (
              <>
                <Text size={200} className={styles.sectionLabel}>
                  结果
                </Text>
                <pre className={styles.mono}>{prettyJson(block.call.result)}</pre>
              </>
            )}
          </div>
        )
      ) : null}
    </div>
  );
}
