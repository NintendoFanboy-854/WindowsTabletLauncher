/**
 * 折叠态录音胶囊（340×56）：声纹 + 计时 + 取消 ✕。
 *
 * **只有一个"停"的出口：入口 orb 本身**（录音中它的 `aria-label` 是「录音中，点一下结束」，
 * 胶囊里也写着「点一下结束」）。早先胶囊里还放了一个 ■「结束并发送」，与入口点按完全重复，
 * 用户看到的是"两个停止录音按钮"——已移除。现在胶囊里只保留 ✕：它不是"停"，是**丢弃**
 * （取消本次录音、不写消息），语义与入口点按不同，所以两个动作不重复。
 *
 * 为什么用胶囊而不是「两个浮在小圆钮旁边的按钮」（`wtsl-touch-voice-design.md` §3.1 / §4.3）：
 * orb 只有 56，再塞按钮会互相贴边；胶囊把声纹、计时与 44 命中区放进同一容器，
 * 天然满足 44 与 ≥8 间距，宽 340 < 516、高 56 ≪ 340，不覆盖内容区。
 *
 * 尺寸不在这里写死：宽高由 `AgentSurface` 从桌面栅格推导（2 列 + 1 gutter、与 orb 同高）后传入。
 * 视觉复用 `Waveform` 的 `compact` 窄版，不新造第二套声纹。
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
import { DismissRegular } from '@fluentui/react-icons';
import { TOUCH_TARGET_CSS } from '../../design/metrics';
import { Waveform } from './Waveform';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    boxSizing: 'border-box',
    paddingInline: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusXLarge,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow16,
    color: tokens.colorNeutralForeground1,
  },
  wave: {
    flex: '1 1 auto',
    minWidth: 0,
  },
  timer: {
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
    color: tokens.colorNeutralForeground2,
    minWidth: tokens.spacingHorizontalXXXL,
    textAlign: 'end',
  },
  hint: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground3,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
  },
  // 44 触控目标（HIG §6 / Fluent 2 layout 44×44）：Fluent large 图标按钮实测 ≈40
  touchTarget: {
    minWidth: TOUCH_TARGET_CSS,
    minHeight: TOUCH_TARGET_CSS,
  },
  transcribing: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flex: 1,
    minWidth: 0,
  },
});

/** `12` → `0:12`，`75` → `1:15`（计时只在录音态出现，不进 aria-live，避免每秒播报） */
export function formatDuration(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? Math.floor(totalSeconds) : 0;
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export interface RecordingPillProps {
  /** 由栅格推导的胶囊宽高（AgentSurface 传入，不在这里写像素） */
  width: number;
  height: number;
  mode: 'recording' | 'transcribing';
  /** 点按后已锁定（再点一下才结束）：把语义写在胶囊上，误判可自纠 */
  locked: boolean;
  level: number;
  durationSec: number;
  /** 丢弃这次录音（不写消息）。"结束并发送"由入口 orb 点按完成，不在这里重复 */
  onCancel: () => void;
  /** 转写中收起提示（不中断转写/回答，结果仍保存在会话里） */
  onDismiss: () => void;
}

export function RecordingPill({
  width,
  height,
  mode,
  locked,
  level,
  durationSec,
  onCancel,
  onDismiss,
}: RecordingPillProps) {
  const styles = useStyles();
  const recording = mode === 'recording';
  // FLUENT2 wait-ux：转写通常 <1s，不闪 spinner；超过 400ms 才出（与 VoiceCapture 同口径）
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
    <div
      className={styles.root}
      style={{ width: `${width}px`, height: `${height}px` }}
      data-wtsl-agent-pill={mode}
      data-wtsl-agent-locked={locked ? 'true' : undefined}
      role="group"
      aria-label={recording ? '正在录音' : '正在转写'}
    >
      {recording ? (
        <>
          <div className={styles.wave}>
            <Waveform active level={level} compact />
          </div>
          <Text size={300} className={styles.timer} aria-hidden="true">
            {formatDuration(durationSec)}
          </Text>
          {locked ? (
            <Text size={200} className={styles.hint}>
              点一下结束
            </Text>
          ) : null}
          <div className={styles.actions}>
            {/* 只有"取消"：结束并发送由入口 orb 点按完成（见文件头），这里不再放第二个"停" */}
            <Tooltip content="取消并丢弃这次录音" relationship="label">
              <Button
                size="large"
                appearance="subtle"
                className={styles.touchTarget}
                icon={<DismissRegular />}
                aria-label="取消并丢弃这次录音"
                onClick={onCancel}
              />
            </Tooltip>
          </div>
        </>
      ) : (
        <>
          <div className={styles.transcribing}>
            <div className={styles.wave}>
              <Waveform active={false} level={0} compact />
            </div>
            <Text size={300} className={styles.timer}>
              转写中
            </Text>
            {showSlowSpinner ? <Spinner size="extra-tiny" aria-hidden="true" /> : null}
          </div>
          <div className={styles.actions}>
            <Tooltip content="收起（转写结果仍会保存）" relationship="label">
              <Button
                size="large"
                appearance="subtle"
                className={styles.touchTarget}
                icon={<DismissRegular />}
                aria-label="收起转写提示"
                onClick={onDismiss}
              />
            </Tooltip>
          </div>
        </>
      )}
      <span className="wtsl-agent-sr-only" role="status">
        {recording ? '正在录音' : '正在转写'}
      </span>
    </div>
  );
}
