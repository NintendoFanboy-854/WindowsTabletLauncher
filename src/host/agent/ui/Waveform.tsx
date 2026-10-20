/**
 * 声纹：两种用途，共用同一套关键帧。
 *
 * - `Waveform`：录音 / 转写时输入区中部的声纹带（品牌底 + 实时电平条，契约 §5）；
 * - `VoicePeaks`：语音消息气泡顶部的静态声纹装饰（高度来自 `message.voicePeaks`，
 *   转写未回时轻微起伏，转写失败时变暗 —— 契约 §6）。
 *
 * 连续动画元素都带 `data-wtsl-agent-animated`，减少动态效果下由 agent.css 统一停掉。
 */

import { makeStyles, motionTokens, tokens } from '@fluentui/react-components';

/** 录音带竖条数量 */
const RECORDING_BARS = 28;
/** 语音消息声纹竖条数量（`voicePeaks` 为 24 桶，缺失时用固定形状兜底） */
const PEAK_BARS = 24;

const useStyles = makeStyles({
  band: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    width: '100%',
    height: '64px',
    paddingInline: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusXLarge,
    backgroundColor: tokens.colorBrandBackground2,
  },
  bar: {
    display: 'block',
    width: '3px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorBrandForeground1,
    transformOrigin: 'center',
    transitionProperty: 'height',
    transitionDuration: `${motionTokens.durationFast}ms`,
    transitionTimingFunction: motionTokens.curveEasyEase,
  },
  peaks: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    height: '24px',
  },
  peakBar: {
    display: 'block',
    width: '3px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorBrandForeground1,
    transformOrigin: 'center',
  },
});

/** 录音实时高度：中间高两侧低，叠加电平与固定抖动 */
function recordingBarHeight(index: number, level: number): number {
  const middle = (RECORDING_BARS - 1) / 2;
  const distance = Math.abs(index - middle) / middle;
  const envelope = Math.max(0.18, 1 - distance * distance);
  const jitter = 0.55 + 0.45 * Math.abs(Math.sin(index * 1.7));
  const amplitude = Math.min(1, Math.max(0.06, level));
  return Math.round(12 + envelope * jitter * amplitude * 76);
}

/** 缺失声纹时的确定性兜底形状，避免气泡高度塌陷 */
function fallbackPeaks(): number[] {
  return Array.from({ length: PEAK_BARS }, (_, index) => {
    const middle = (PEAK_BARS - 1) / 2;
    const distance = Math.abs(index - middle) / middle;
    return Math.max(0.15, 1 - distance * distance) * (0.55 + 0.45 * Math.abs(Math.sin(index * 2.1)));
  });
}

function normalizePeaks(peaks: number[] | undefined): number[] {
  if (!peaks || peaks.length === 0) return fallbackPeaks();
  return peaks.map((peak) => (Number.isFinite(peak) ? Math.min(1, Math.max(0, peak)) : 0));
}

export function Waveform({
  active,
  level = 0,
}: {
  /** 录音中：实时电平 + 起伏；转写中：静止（契约 §5） */
  active: boolean;
  level?: number;
}) {
  const styles = useStyles();

  return (
    <div className={styles.band} aria-hidden="true">
      {Array.from({ length: RECORDING_BARS }, (_, index) => (
        <span
          key={index}
          className={`${styles.bar} wtsl-agent-wave-bar`}
          data-wtsl-agent-animated={active ? 'true' : undefined}
          style={{
            height: `${recordingBarHeight(index, active ? level : 0)}px`,
            animationName: active ? 'wtsl-agent-wave' : undefined,
            animationDuration: `${motionTokens.durationSlow}ms`,
            animationTimingFunction: motionTokens.curveEasyEase,
            animationIterationCount: active ? 'infinite' : undefined,
            animationDelay: `${(index * 37) % 420}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function VoicePeaks({
  peaks,
  pending = false,
  failed = false,
}: {
  peaks?: number[];
  /** 转写未回：竖条轻微起伏 */
  pending?: boolean;
  /** 转写失败：整体变暗（不显示文字标签） */
  failed?: boolean;
}) {
  const styles = useStyles();
  const values = normalizePeaks(peaks);

  return (
    <div className={styles.peaks} aria-hidden="true">
      {values.map((peak, index) => (
        <span
          key={index}
          className={styles.peakBar}
          data-wtsl-agent-animated={pending ? 'true' : undefined}
          style={{
            height: `${Math.round(4 + peak * 22)}px`,
            opacity: failed ? 0.3 : pending ? 0.6 : 0.62,
            animationName: pending ? 'wtsl-agent-wave' : undefined,
            animationDuration: `${motionTokens.durationSlow}ms`,
            animationTimingFunction: motionTokens.curveEasyEase,
            animationIterationCount: pending ? 'infinite' : undefined,
            animationDelay: `${(index * 45) % 400}ms`,
          }}
        />
      ))}
    </div>
  );
}
