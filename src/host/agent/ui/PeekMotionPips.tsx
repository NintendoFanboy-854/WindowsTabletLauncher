/**
 * 半高 peek 的「极大压缩后的过程指示」：一排 ≤3 个状态点 + 溢出计数。
 *
 * 半高只有三行文本的位置（84 全角字预算 + 顶部渐隐），放不下过程行，所以过程在这里
 * 退化成「存在指示」（设计 §8.2）：
 * - 一个点 = 一个过程块（`thinking` / `tool`），最多 3 个，超出补 `+N`；
 * - 完成 = 中性色，进行中 = 品牌色，**失败 = danger 色**（失败必须在全折叠下也看得见）；
 * - 不可点：peek 整块已经是 `role="button"`，嵌套交互会破坏键盘语义；
 * - 没有过程块时整行不渲染。
 */
import { useMemo } from 'react';
import { Text, makeStyles, tokens } from '@fluentui/react-components';
import { isProcessBlock, type TurnBlock } from '../types';

/** 最多画几个点（设计 §8.2：≤3 个，其余用 `+N` 表达） */
const MAX_PIPS = 3;

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    minWidth: 0,
    // 只占一行线高的三分之一：存在感，不是可读信息
    lineHeight: tokens.lineHeightBase100,
    pointerEvents: 'none',
  },
  dot: {
    display: 'inline-block',
    flexShrink: 0,
    width: tokens.spacingHorizontalXS,
    height: tokens.spacingHorizontalXS,
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralForeground3,
  },
  running: {
    backgroundColor: tokens.colorBrandForeground1,
  },
  failed: {
    backgroundColor: tokens.colorStatusDangerForeground1,
  },
  overflow: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground3,
  },
});

type PipTone = 'done' | 'running' | 'failed';

function toneOf(block: TurnBlock): PipTone {
  if (block.kind === 'thinking') return block.open ? 'running' : 'done';
  if (block.kind === 'tool') {
    if (block.call.status === 'error') return 'failed';
    if (block.call.status === 'running') return 'running';
  }
  return 'done';
}

export interface PeekMotionPipsProps {
  blocks: TurnBlock[];
}

export function PeekMotionPips({ blocks }: PeekMotionPipsProps) {
  const styles = useStyles();
  const process = useMemo(() => blocks.filter(isProcessBlock), [blocks]);

  if (process.length === 0) return null;

  const visible = process.slice(-MAX_PIPS);
  const hidden = process.length - visible.length;

  return (
    <span className={styles.root} aria-hidden="true" data-wtsl-agent-pips="true">
      {visible.map((block) => {
        const tone = toneOf(block);
        return (
          <span
            key={block.id}
            className={`${styles.dot} ${tone === 'running' ? styles.running : ''} ${
              tone === 'failed' ? styles.failed : ''
            }`}
            data-wtsl-agent-pip={tone}
          />
        );
      })}
      {hidden > 0 ? (
        <Text size={100} className={styles.overflow}>
          +{hidden}
        </Text>
      ) : null}
    </span>
  );
}
