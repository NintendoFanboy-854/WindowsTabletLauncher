/**
 * 语音波形：录音时按真实电平起伏，朗读/回答时按固定节奏起伏。
 * 关键帧在 agent.css，时长与曲线取 motionTokens。
 */

import { makeStyles, motionTokens, tokens } from '@fluentui/react-components';

const BAR_COUNT = 28;

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalXS,
    height: '72px',
    color: tokens.colorBrandForeground1,
    width: '100%',
    maxWidth: '560px',
  },
  bar: {
    display: 'block',
    width: '4px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: 'currentColor',
    transformOrigin: 'center',
    transitionProperty: 'height, opacity',
    transitionDuration: `${motionTokens.durationFast}ms`,
    transitionTimingFunction: motionTokens.curveEasyEase,
  },
});

export type WaveformVariant = 'listening' | 'speaking' | 'idle';

export function Waveform({
  active,
  level = 0,
  variant,
}: {
  active: boolean;
  level?: number;
  variant: WaveformVariant;
}) {
  const styles = useStyles();
  const middle = (BAR_COUNT - 1) / 2;

  return (
    <div className={styles.root} aria-hidden>
      {Array.from({ length: BAR_COUNT }, (_, index) => {
        const distance = Math.abs(index - middle) / middle;
        const envelope = Math.max(0.12, 1 - distance * distance);
        const speakingShape = 0.35 + Math.abs(Math.sin(index * 0.9)) * 0.65;
        const heightPercent =
          variant === 'listening'
            ? 14 + envelope * level * 82
            : variant === 'speaking' && active
              ? 18 + envelope * speakingShape * 74
              : 12 + envelope * 10;
        return (
          <span
            key={index}
            className={styles.bar}
            data-wtsl-agent-animated={active ? 'true' : 'false'}
            style={{
              height: `${Math.round(heightPercent)}%`,
              opacity: active ? 1 : 0.35,
              animationName: active ? 'wtsl-agent-wave' : undefined,
              animationDuration: `${motionTokens.durationSlow}ms`,
              animationTimingFunction: motionTokens.curveEasyEase,
              animationIterationCount: active ? 'infinite' : undefined,
              animationDelay: `${(index * 34) % 400}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
