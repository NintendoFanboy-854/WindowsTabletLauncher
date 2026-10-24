/**
 * 一轮回复的时间线：**按发生顺序**把块堆下来，结构上无法产生「先全部思考、再全部工具」。
 *
 * 结构固定三件事，与「有哪些工具」完全无关（设计 §4）：
 *
 *   <ol class="timeline">            ← role="list"，语义就是有序列表
 *     <li> <节点圆点/> <BlockRow/> </li>   × N
 *   </ol>
 *
 * 三个视觉信号（都不靠颜色深浅、不靠动效）：
 * 1. **连续竖线（rail）** = `ol` 的左边框，一条不断的线本身就是「顺序」的隐喻；
 * 2. **缩进差**：`text` 顶格（答案），`thinking`/`tool`/`notice` 缩进一级（机器内部）；
 * 3. **统一纵向节奏**：块之间一律 `spacingVerticalS`，不给「正文前」多加间距（那会又变成分类聚合）。
 *
 * 节点形状承担「这是什么」：thinking 空心、tool 实心、notice 状态色实心；text 不出节点
 * （rail 从它背后穿过）。进行中只改颜色，不加动效（一屏一个进行中指示器 = PendingLine）。
 */
import { makeStyles, tokens } from '@fluentui/react-components';
import { isProcessBlock, type TurnBlock } from '../types';
import { BlockRow } from './BlockRow';
import { summarizeNotice, summarizeThinking, summarizeToolBlock } from './blockSummary';
import { useTurnBlocks } from './useTurnBlocks';

/** 折叠行的高度（与 BlockRow 的命中区同源：44 = 触控下限） */
const HEADER_HEIGHT = `calc(${tokens.spacingHorizontalXXXL} * 2 + ${tokens.spacingHorizontalXS})`;
/** 节点圆点尺寸 = spacingHorizontalXS（4），与 rail 同心 */
const DOT_SIZE = tokens.spacingHorizontalXS;

const useStyles = makeStyles({
  timeline: {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    minWidth: 0,
    // 一条不断的竖线（rail）由 agent.css 的 .wtsl-turn-timeline 画：逻辑属性 border-inline-start
    // 不在 Griffel 的类型表里，写在 CSS 里才能只用 token、且 LTR/RTL 都正确。
  },
  item: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    // 统一纵向节奏：块之间一律 spacingVerticalS
    marginBlock: tokens.spacingVerticalS,
  },
  /** 答案顶格 */
  textItem: {
    paddingInlineStart: 0,
  },
  /** 机器内部缩进一级（与 rail 上节点的位置不重叠） */
  processItem: {
    paddingInlineStart: tokens.spacingHorizontalL,
  },
  /** 节点圆点：压在 rail 上（左移半个直径，让圆心落在那条细描边线上） */
  dot: {
    position: 'absolute',
    boxSizing: 'border-box',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: tokens.borderRadiusCircular,
    insetInlineStart: `calc(${DOT_SIZE} / -2)`,
    // 垂直居中于折叠行（44 / 2 − 圆点半径）
    insetBlockStart: `calc(${HEADER_HEIGHT} / 2 - ${DOT_SIZE} / 2)`,
    pointerEvents: 'none',
  },
  /** thinking：空心 */
  dotThinking: {
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke3}`,
    backgroundColor: 'transparent',
  },
  /** tool：实心 */
  dotTool: {
    backgroundColor: tokens.colorNeutralForeground3,
  },
  /** notice：状态色实心 */
  dotNotice: {
    backgroundColor: tokens.colorNeutralForeground3,
  },
  dotError: {
    backgroundColor: tokens.colorStatusDangerForeground1,
  },
  dotWarning: {
    backgroundColor: tokens.colorStatusWarningForeground1,
  },
  dotRunning: {
    backgroundColor: tokens.colorBrandForeground1,
  },
});

function blockLabel(block: TurnBlock): string | undefined {
  if (block.kind === 'thinking') return summarizeThinking(block);
  if (block.kind === 'tool') return summarizeToolBlock(block);
  if (block.kind === 'notice') return summarizeNotice(block);
  // 正文不做 aria-label：那会把正文内容从读屏里替换掉
  return undefined;
}

export interface TurnTimelineProps {
  blocks: TurnBlock[];
}

export function TurnTimeline({ blocks }: TurnTimelineProps) {
  const styles = useStyles();
  const expansion = useTurnBlocks();

  if (blocks.length === 0) return null;
  const processIds = blocks.filter(isProcessBlock).map((block) => block.id);

  return (
    <ol className={`${styles.timeline} wtsl-turn-timeline`} role="list" data-wtsl-turn-timeline="true">
      {blocks.map((block) => {
        const label = blockLabel(block);
        const process = isProcessBlock(block);
        const expanded = process ? expansion.isOpen(block.id) : false;
        const running =
          block.kind === 'thinking'
            ? block.open
            : block.kind === 'tool'
              ? block.call.status === 'running'
              : false;

        return (
          <li
            key={block.id}
            role="listitem"
            aria-label={label}
            data-wtsl-turn-block={block.kind}
            data-wtsl-turn-seq={block.seq}
            className={`${styles.item} ${
              // 只有答案顶格：thinking / tool / notice 都是「机器内部」，缩进一级
              block.kind === 'text' ? styles.textItem : styles.processItem
            }`}
          >
            {block.kind === 'thinking' ? (
              <span
                aria-hidden="true"
                className={`${styles.dot} ${styles.dotThinking} ${running ? styles.dotRunning : ''}`}
              />
            ) : null}
            {block.kind === 'tool' ? (
              <span
                aria-hidden="true"
                className={`${styles.dot} ${
                  block.call.status === 'error' ? styles.dotError : styles.dotTool
                } ${running ? styles.dotRunning : ''}`}
              />
            ) : null}
            {block.kind === 'notice' ? (
              <span
                aria-hidden="true"
                className={`${styles.dot} ${styles.dotNotice} ${
                  block.level === 'error'
                    ? styles.dotError
                    : block.level === 'warning'
                      ? styles.dotWarning
                      : ''
                }`}
              />
            ) : null}
            <BlockRow
              block={block}
              expanded={expanded}
              onToggle={() => expansion.toggle(block.id, processIds)}
            />
          </li>
        );
      })}
    </ol>
  );
}
