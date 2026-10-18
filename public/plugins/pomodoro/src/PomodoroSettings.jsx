/**
 * 番茄钟设置视图（宿主全窗口 Fluent Dialog，?view=settings 加载）。
 * 时长 / 轮数 / 自动开始 / 提示音 / keepAwake / 白噪音都在这里；改动即时写宿主配置，
 * 卡片视图通过 storage 事件同步给引擎。
 */

import {
  Divider,
  Field,
  Input,
  Radio,
  RadioGroup,
  Slider,
  Switch,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { useStoredConfig } from '../../_shared/host.js';
import { NOISE_KINDS } from './data/audio.js';
import { DEFAULT_SETTINGS, SETTINGS_KEY, normalizeSettings } from './data/timer.js';

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL}`,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    overflowY: 'auto',
    color: tokens.colorNeutralForeground1,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  numbers: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalL,
    alignItems: 'flex-end',
  },
  field: {
    minWidth: '140px',
    flex: '1 1 140px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalL,
    minHeight: '40px',
  },
  rowText: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  noiseRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
    flexWrap: 'wrap',
  },
  slider: {
    flex: '1 1 220px',
    minWidth: '180px',
  },
  subtle: {
    color: tokens.colorNeutralForeground3,
  },
});

export default function PomodoroSettings() {
  const styles = useStyles();
  const [settings, setSettings, loaded] = useStoredConfig(
    SETTINGS_KEY,
    DEFAULT_SETTINGS,
    normalizeSettings,
  );

  const patch = (value) => setSettings((previous) => ({ ...previous, ...value }));
  const setNumber = (key, fallback) => (event) => {
    const raw = Number(event.target.value);
    const next = Number.isFinite(raw) && raw > 0 ? Math.round(raw) : fallback;
    patch({ [key]: next });
  };

  return (
    <div className={styles.root}>
      <section className={styles.section} aria-label="时长">
        <Text size={400} weight="semibold">
          时长与轮数
        </Text>
        <div className={styles.numbers}>
          <Field label="专注（分钟）" className={styles.field}>
            <Input
              type="number"
              min={1}
              value={String(settings.focusMin)}
              disabled={!loaded}
              onChange={setNumber('focusMin', DEFAULT_SETTINGS.focusMin)}
            />
          </Field>
          <Field label="短休（分钟）" className={styles.field}>
            <Input
              type="number"
              min={1}
              value={String(settings.shortBreakMin)}
              disabled={!loaded}
              onChange={setNumber('shortBreakMin', DEFAULT_SETTINGS.shortBreakMin)}
            />
          </Field>
          <Field label="长休（分钟）" className={styles.field}>
            <Input
              type="number"
              min={1}
              value={String(settings.longBreakMin)}
              disabled={!loaded}
              onChange={setNumber('longBreakMin', DEFAULT_SETTINGS.longBreakMin)}
            />
          </Field>
          <Field label="长休前轮数" className={styles.field}>
            <Input
              type="number"
              min={1}
              value={String(settings.roundsBeforeLongBreak)}
              disabled={!loaded}
              onChange={setNumber('roundsBeforeLongBreak', DEFAULT_SETTINGS.roundsBeforeLongBreak)}
            />
          </Field>
        </div>
      </section>

      <Divider />

      <section className={styles.section} aria-label="行为">
        <div className={styles.row}>
          <div className={styles.rowText}>
            <Text size={300}>自动开始下一阶段</Text>
            <Text className={styles.subtle} size={200}>
              关闭时阶段结束停在「待开始」
            </Text>
          </div>
          <Switch
            checked={settings.autoStartNext}
            disabled={!loaded}
            aria-label="自动开始下一阶段"
            onChange={(_, detail) => patch({ autoStartNext: detail.checked })}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.rowText}>
            <Text size={300}>阶段结束提示音</Text>
            <Text className={styles.subtle} size={200}>
              WebAudio 合成，不联网
            </Text>
          </div>
          <Switch
            checked={settings.sound}
            disabled={!loaded}
            aria-label="阶段结束提示音"
            onChange={(_, detail) => patch({ sound: detail.checked })}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.rowText}>
            <Text size={300}>专注时阻止息屏</Text>
            <Text className={styles.subtle} size={200}>
              通过宿主 setKeepAwake 实现
            </Text>
          </div>
          <Switch
            checked={settings.keepAwake}
            disabled={!loaded}
            aria-label="专注时阻止息屏"
            onChange={(_, detail) => patch({ keepAwake: detail.checked })}
          />
        </div>
      </section>

      <Divider />

      <section className={styles.section} aria-label="白噪音">
        <Text size={400} weight="semibold">
          白噪音
        </Text>
        <RadioGroup
          value={settings.whiteNoise}
          layout="horizontal"
          onChange={(_, detail) => patch({ whiteNoise: detail.value })}
        >
          {NOISE_KINDS.map((kind) => (
            <Radio key={kind.id} value={kind.id} label={kind.label} />
          ))}
        </RadioGroup>
        <div className={styles.noiseRow}>
          <Text size={300} className={styles.subtle}>
            音量 {settings.whiteNoiseVolume}
          </Text>
          <Slider
            className={styles.slider}
            min={0}
            max={100}
            value={settings.whiteNoiseVolume}
            aria-label="白噪音音量"
            onChange={(_, detail) => patch({ whiteNoiseVolume: detail.value })}
          />
        </div>
        <Text className={styles.subtle} size={200}>
          白噪音随阶段结束淡出；浏览器要求用户手势后才能播放，改动后回到卡片点一次开始即可生效。
        </Text>
      </section>
    </div>
  );
}
