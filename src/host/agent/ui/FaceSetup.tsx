/**
 * 人脸注册：预览摄像头 → 拍样本存特征向量（只存本机 localStorage）。
 */

import { useEffect, useRef, useState } from 'react';
import {
  Badge,
  Button,
  MessageBar,
  MessageBarBody,
  Slider,
  Switch,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { CameraRegular, DeleteRegular, PersonRegular } from '@fluentui/react-icons';
import { faceService } from '../face/faceService';
import { useFaceState } from '../hooks/useFaceState';
import type { SettingsPatch } from '../settings';
import type { AgentSettings } from '../types';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    minHeight: '40px',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
  },
  preview: {
    width: 'min(240px, 60vw)',
    aspectRatio: '4 / 3',
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground4,
    objectFit: 'cover',
    transform: 'scaleX(-1)',
  },
  spacer: { flex: 1 },
  rowWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  control40: {
    minHeight: '40px',
  },
});

export function FaceSetup({
  settings,
  onUpdate,
}: {
  settings: AgentSettings;
  onUpdate: (patch: SettingsPatch) => void;
}) {
  const styles = useStyles();
  const faceState = useFaceState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(
    () => () => {
      faceService.detachPreview();
    },
    [],
  );

  const sampleCount = settings.face.descriptors.length;
  const unavailable = faceState.status === 'error';

  const startPreview = async () => {
    const target = videoRef.current;
    if (!target) return;
    setBusy(true);
    setLocalError(null);
    try {
      await faceService.attachPreview(target);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  const capture = async () => {
    setBusy(true);
    setLocalError(null);
    try {
      const descriptor = await faceService.captureDescriptor();
      onUpdate({ face: { descriptors: [...settings.face.descriptors, descriptor] } });
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  const clearSamples = () => {
    onUpdate({ face: { descriptors: [] } });
  };

  return (
    <div className={styles.root}>
      <div className={styles.row}>
        <Switch
          className={styles.control40}
          checked={settings.face.enabled}
          onChange={(_, data) => onUpdate({ face: { enabled: data.checked } })}
          label="人脸唤醒"
        />
        <Badge appearance="tint" color={unavailable ? 'danger' : faceState.status === 'ready' ? 'success' : 'informative'}>
          {unavailable
            ? '不可用'
            : faceState.status === 'loading'
              ? '模型加载中'
              : faceState.status === 'ready'
                ? '就绪'
                : '未开启'}
        </Badge>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          已注册 {sampleCount} 个样本
        </Text>
        <div className={styles.spacer} />
        {sampleCount > 0 ? (
          <Button
            size="large"
            appearance="subtle"
            icon={<DeleteRegular />}
            onClick={clearSamples}
          >
            清除样本
          </Button>
        ) : null}
      </div>

      {faceState.detail ? (
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          {faceState.detail}
        </Text>
      ) : null}

      {localError ? (
        <MessageBar intent="warning">
          <MessageBarBody>{localError}</MessageBarBody>
        </MessageBar>
      ) : null}

      <div className={styles.rowWrap}>
        <video ref={videoRef} className={styles.preview} muted playsInline />
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS }}>
          <Button
            size="large"
            appearance="secondary"
            icon={<CameraRegular />}
            onClick={() => void startPreview()}
            disabled={busy}
          >
            打开摄像头预览
          </Button>
          <Button
            size="large"
            appearance="primary"
            icon={<PersonRegular />}
            onClick={() => void capture()}
            disabled={busy || unavailable}
          >
            拍一张人脸样本
          </Button>
          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
            建议正对屏幕、光线均匀；拍 2–3 张不同角度。
          </Text>
        </div>
      </div>

      <div className={styles.row}>
        <Text size={300} style={{ minWidth: '96px' }}>
          匹配阈值
        </Text>
        <Slider
          className={styles.control40}
          style={{ flex: 1, minWidth: '160px' }}
          min={0.2}
          max={0.8}
          step={0.01}
          value={settings.face.threshold}
          onChange={(_, data) => onUpdate({ face: { threshold: data.value } })}
          aria-label="人脸匹配阈值"
        />
        <Text size={300}>{settings.face.threshold.toFixed(2)}</Text>
      </div>
      <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
        数值越小越严格（0.4–0.6 之间比较合适）。系统每隔约半秒识别一次，
        连续确认后才会唤醒；唤醒后自动进入全屏语音并开始录音。特征只保存在本机，不会上传。
      </Text>
    </div>
  );
}
