/**
 * 录音 / 转写态：输入区中部换成声纹带，右侧是停止方块（主操作）与取消 X。
 * 界面不写“正在聆听 / 正在识别”等解释文字；屏幕阅读器用 aria-label 与隐藏状态文本。
 */

import { useEffect, useState } from 'react';
import { Button, Spinner, Tooltip, makeStyles, tokens } from '@fluentui/react-components';
import { DismissRegular, StopRegular } from '@fluentui/react-icons';
import { Waveform } from './Waveform';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    width: '100%',
  },
  band: {
    flex: 1,
    minWidth: 0,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
  },
});

export function VoiceCapture({
  stage,
  level,
  busy,
  onStop,
  onCancel,
}: {
  stage: 'recording' | 'transcribing';
  /** 0..1 实时电平 */
  level: number;
  /** 已点停止、等待转写返回 */
  busy: boolean;
  onStop: () => void;
  onCancel: () => void;
}) {
  const styles = useStyles();
  const recording = stage === 'recording';
  // FLUENT2 wait-ux：识别通常 <1s，不闪 spinner；超过 400ms 才显示，避免一帧噪声
  const [showSlowSpinner, setShowSlowSpinner] = useState(false);
  useEffect(() => {
    if (recording) {
      setShowSlowSpinner(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setShowSlowSpinner(true), 400);
    return () => window.clearTimeout(timer);
  }, [recording]);

  return (
    <div className={styles.root}>
      <div className={styles.band}>
        <Waveform active={recording} level={level} />
      </div>
      {recording ? (
        <div className={styles.actions}>
          <Tooltip content="取消录音" relationship="label">
            <Button
              size="large"
              appearance="subtle"
              icon={<DismissRegular />}
              aria-label="取消录音"
              onClick={onCancel}
            />
          </Tooltip>
          <Tooltip content="结束并发送" relationship="label">
            <Button
              size="large"
              appearance="primary"
              icon={busy ? <Spinner size="extra-tiny" /> : <StopRegular />}
              aria-label="结束录音并发送"
              disabled={busy}
              onClick={onStop}
            />
          </Tooltip>
        </div>
      ) : null}
      {!recording && showSlowSpinner ? (
        <div className={styles.actions} aria-hidden="true">
          <Spinner size="extra-tiny" />
        </div>
      ) : null}
      <span className="wtsl-agent-sr-only" role="status">
        {recording ? '正在录音' : '正在识别语音'}
      </span>
    </div>
  );
}
