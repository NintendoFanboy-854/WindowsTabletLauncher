/**
 * 一行「进行中」状态条：状态文案 + 已用秒数 + 停止生成。
 *
 * 为什么需要它：`wait-ux.md:38` 与 `docs/FLUENT2.md:161` 都要求 AI 对话的响应指示器
 * **立即出现**（不受 1s 阈值保护），>3s 要给明确状态文案；半高窗此前只有 sr-only
 * 文本，视觉上「什么都没发生」（调查 §3.2 Q2-c）。这一行同时补齐三档：
 * 0s（立即出现）/ 1–3s（文案 + Spinner）/ >3s（持续计时的秒数 + 可中断）。
 *
 * 秒数：从 `startedAt`（assistant 消息创建时刻 = 发出时刻）算起，每秒刷新，
 * 一直走到结束（会话回 idle 时本组件随状态行一起卸载）。`ELAPSED_TICK_MS` 是
 * 计时器节拍这个功能常量，不是动效时长，所以不取 motionTokens。
 *
 * 文案只由 `turnPhase()` 产生，不在此处拼接；`…`、无句号、动词开头（content-design）。
 * reduced-motion 下 Fluent Spinner 自行停止动画，文案与秒数仍在（motion.md:82：
 * 动效不得是信息的唯一载体）。
 */
import { useEffect, useState } from 'react';
import {
  Button,
  Spinner,
  Text,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { StopRegular } from '@fluentui/react-icons';
import type { TurnPhase } from './turnPhase';
import { elapsedSeconds } from './turnPhase';

/** 已用秒数的刷新节拍（功能计时，不是动效时长） */
const ELAPSED_TICK_MS = 1000;

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    width: '100%',
    minWidth: 0,
    color: tokens.colorNeutralForeground2,
  },
  label: {
    flex: '1 1 auto',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  elapsed: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground3,
  },
});

export interface PendingLineProps {
  phase: TurnPhase;
  /** 计时起点（ms epoch） */
  startedAt: number;
  onStop: () => void;
  /**
   * 是否在本行给「停止生成」。全高对话里动作归输入区的同一个按钮
   * （状态与操作分离，契约 §2），所以那里传 false，避免一屏两个停止入口。
   */
  showStop?: boolean;
}

export function PendingLine({ phase, startedAt, onStop, showStop = true }: PendingLineProps) {
  const styles = useStyles();
  const [elapsedSec, setElapsedSec] = useState(() => elapsedSeconds(startedAt));

  useEffect(() => {
    setElapsedSec(elapsedSeconds(startedAt));
    const timer = window.setInterval(
      () => setElapsedSec(elapsedSeconds(startedAt)),
      ELAPSED_TICK_MS,
    );
    return () => window.clearInterval(timer);
  }, [startedAt]);

  return (
    <div
      className={styles.root}
      role="status"
      aria-live="polite"
      data-wtsl-agent-pending={phase.kind}
    >
      <Spinner size="extra-tiny" />
      <Text size={300} className={styles.label}>
        {phase.label}
      </Text>
      {/* 秒数每秒变化：对读屏隐藏，避免每秒播报；状态文案本身仍是 live region 的内容 */}
      <Text size={200} className={styles.elapsed} aria-hidden="true">
        {elapsedSec} 秒
      </Text>
      {showStop ? (
        <Tooltip content="停止生成" relationship="label">
          <Button
            size="large"
            appearance="secondary"
            icon={<StopRegular />}
            aria-label="停止生成"
            onClick={onStop}
          />
        </Tooltip>
      ) : null}
    </div>
  );
}
