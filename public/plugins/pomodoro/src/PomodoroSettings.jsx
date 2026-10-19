/**
 * 番茄钟设置视图（宿主全窗口 Fluent Dialog，?view=settings 加载）。
 * 浮层重排 v1（docs/OVERLAY-REWRITE-SPEC.md §1/§2）：
 * - 分组顺序：常用（时长）→ 行为（自动开始/提示音/keepAwake）→ 高级（白噪音）
 * - 单列 max-width 720 居中；Field 上下布局控件 40；开关行 48；不用 Divider
 * - 即时保存到宿主配置，卡片通过 storage 事件同步
 */

import {
  Dropdown,
  Field,
  Input,
  Option,
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
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 24px 0',
    overflow: 'hidden',
    color: tokens.colorNeutralForeground1,
    '@media (max-width: 699px)': { padding: '16px 16px 0' },
  },
  scrollArea: {
    flex: '1 1 auto',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingBottom: tokens.spacingVerticalXXL,
  },
  content: {
    width: '100%',
    maxWidth: '720px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXL,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: tokens.spacingVerticalL,
    '@media (max-width: 559px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    minHeight: '48px',
  },
  rowText: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    minHeight: '40px',
  },
  slider: {
    flex: '1 1 auto',
    minWidth: 0,
    minHeight: '40px',
  },
  value: {
    fontVariantNumeric: 'tabular-nums',
    minWidth: '40px',
    textAlign: 'right',
    color: tokens.colorNeutralForeground2,
  },
  control: {
    minHeight: '42px',
  },
  switchControl: {
    flex: '0 0 auto',
    minHeight: '40px',
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
  const noiseLabel = (NOISE_KINDS.find((kind) => kind.id === settings.whiteNoise) ?? NOISE_KINDS[0])
    .label;

  return (
    <div className={styles.root}>
      <div className={styles.scrollArea}>
        <div className={styles.content}>
          <section className={styles.section} aria-label="时长与轮数">
            <Text size={500} weight="semibold">
              时长与轮数
            </Text>
            <div className={styles.grid}>
              <Field label="专注" hint="一轮专注的分钟数">
                <Input
                  className={styles.control}
                  size="large"
                  type="number"
                  min={1}
                  value={String(settings.focusMin)}
                  disabled={!loaded}
                  onChange={setNumber('focusMin', DEFAULT_SETTINGS.focusMin)}
                />
              </Field>
              <Field label="短休" hint="专注后的短休息分钟数">
                <Input
                  className={styles.control}
                  size="large"
                  type="number"
                  min={1}
                  value={String(settings.shortBreakMin)}
                  disabled={!loaded}
                  onChange={setNumber('shortBreakMin', DEFAULT_SETTINGS.shortBreakMin)}
                />
              </Field>
              <Field label="长休" hint="连续多轮后的长休息分钟数">
                <Input
                  className={styles.control}
                  size="large"
                  type="number"
                  min={1}
                  value={String(settings.longBreakMin)}
                  disabled={!loaded}
                  onChange={setNumber('longBreakMin', DEFAULT_SETTINGS.longBreakMin)}
                />
              </Field>
              <Field label="长休前轮数" hint="完成几轮专注后进入长休">
                <Input
                  className={styles.control}
                  size="large"
                  type="number"
                  min={1}
                  value={String(settings.roundsBeforeLongBreak)}
                  disabled={!loaded}
                  onChange={setNumber('roundsBeforeLongBreak', DEFAULT_SETTINGS.roundsBeforeLongBreak)}
                />
              </Field>
            </div>
          </section>

          <section className={styles.section} aria-label="行为">
            <Text size={500} weight="semibold">
              行为
            </Text>
            <div className={styles.row}>
              <div className={styles.rowText}>
                <Text size={300}>自动开始下一阶段</Text>
                <Text className={styles.subtle} size={200}>
                  关闭时阶段结束停在「待开始」
                </Text>
              </div>
              <Switch
                className={styles.switchControl}
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
                  由系统合成，不占用网络
                </Text>
              </div>
              <Switch
                className={styles.switchControl}
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
                  专注期间不锁屏，结束后自动恢复
                </Text>
              </div>
              <Switch
                className={styles.switchControl}
                checked={settings.keepAwake}
                disabled={!loaded}
                aria-label="专注时阻止息屏"
                onChange={(_, detail) => patch({ keepAwake: detail.checked })}
              />
            </div>
          </section>

          <section className={styles.section} aria-label="白噪音">
            <Text size={500} weight="semibold">
              白噪音
            </Text>
            <Field label="类型" hint="只在本轮专注进行时播放；阶段结束自动淡出">
              <Dropdown
                className={styles.control}
                size="large"
                value={noiseLabel}
                selectedOptions={[settings.whiteNoise]}
                onOptionSelect={(_, detail) =>
                  patch({ whiteNoise: detail.optionValue ?? 'none' })
                }
              >
                {NOISE_KINDS.map((kind) => (
                  <Option key={kind.id} value={kind.id}>
                    {kind.label}
                  </Option>
                ))}
              </Dropdown>
            </Field>
            <div className={styles.sliderRow}>
              <Text size={300}>音量</Text>
              <Slider
                className={styles.slider}
                className={styles.slider}
                min={0}
                max={100}
                value={settings.whiteNoiseVolume}
                aria-label="白噪音音量"
                onChange={(_, detail) => patch({ whiteNoiseVolume: detail.value })}
              />
              <Text size={300} className={styles.value}>
                {settings.whiteNoiseVolume}
              </Text>
            </div>
            <Text className={styles.subtle} size={200}>
              浏览器要求用户手势后才能播放声音；改动后回到卡片点一次开始即可生效。
            </Text>
          </section>
        </div>
      </div>
    </div>
  );
}



