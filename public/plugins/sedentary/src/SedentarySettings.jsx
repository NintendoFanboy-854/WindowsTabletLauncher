/**
 * 久坐提醒设置视图（宿主全窗口 Fluent Dialog，?view=settings 加载）。
 * 浮层重排 v1（docs/OVERLAY-REWRITE-SPEC.md §1/§2）：
 * - 分组顺序：提醒（常用）→ 计时（行为）→ 免打扰（高级）
 * - 单列 max-width 720 居中；Field 上下布局控件 40；开关行 48；不用 Divider
 * - 设置即时写宿主配置，后台引擎每 10 秒读取一次
 */

import {
  Field,
  Input,
  Switch,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { useStoredConfig } from '../../_shared/host.js';
import {
  DEFAULT_QUIET_HOURS,
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  normalizeSettings,
} from './data/engine.js';

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
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: tokens.spacingVerticalL,
    '@media (max-width: 639px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
  },
  grid2: {
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
  switchControl: {
    flex: '0 0 auto',
    minHeight: '40px',
  },
  control: {
    minHeight: '42px',
  },
  subtle: {
    color: tokens.colorNeutralForeground3,
  },
});

export default function SedentarySettings() {
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

  const quiet = settings.quietHours;

  return (
    <div className={styles.root}>
      <div className={styles.scrollArea}>
        <div className={styles.content}>
          <section className={styles.section} aria-label="提醒">
            <Text size={500} weight="semibold">
              提醒
            </Text>
            <div className={styles.row}>
              <div className={styles.rowText}>
                <Text size={300}>启用久坐提醒</Text>
                <Text className={styles.subtle} size={200}>
                  关闭后不计时也不提醒
                </Text>
              </div>
              <Switch
                className={styles.switchControl}
                checked={settings.enabled}
                disabled={!loaded}
                aria-label="启用久坐提醒"
                onChange={(_, detail) => patch({ enabled: detail.checked })}
              />
            </div>
            <div className={styles.row}>
              <div className={styles.rowText}>
                <Text size={300}>全屏强提醒</Text>
                <Text className={styles.subtle} size={200}>
                  关闭时只发一条通知
                </Text>
              </div>
              <Switch
                className={styles.switchControl}
                checked={settings.strongReminder}
                disabled={!loaded}
                aria-label="全屏强提醒"
                onChange={(_, detail) => patch({ strongReminder: detail.checked })}
              />
            </div>
          </section>

          <section className={styles.section} aria-label="计时">
            <Text size={500} weight="semibold">
              计时
            </Text>
            <div className={styles.grid}>
              <Field label="提醒阈值" hint="连续久坐多少分钟后提醒（分钟）">
                <Input
                  className={styles.control}
                  size="large"
                  type="number"
                  min={1}
                  value={String(settings.thresholdMin)}
                  disabled={!loaded}
                  onChange={setNumber('thresholdMin', DEFAULT_SETTINGS.thresholdMin)}
                />
              </Field>
              <Field label="未起身再催" hint="提醒后仍未起身，隔多少分钟再催（分钟）">
                <Input
                  className={styles.control}
                  size="large"
                  type="number"
                  min={1}
                  value={String(settings.remindEveryMin)}
                  disabled={!loaded}
                  onChange={setNumber('remindEveryMin', DEFAULT_SETTINGS.remindEveryMin)}
                />
              </Field>
              <Field label="空闲判定起身" hint="无输入超过该分钟数即视为起身（分钟）">
                <Input
                  className={styles.control}
                  size="large"
                  type="number"
                  min={1}
                  value={String(settings.idleResetMin)}
                  disabled={!loaded}
                  onChange={setNumber('idleResetMin', DEFAULT_SETTINGS.idleResetMin)}
                />
              </Field>
            </div>
          </section>

          <section className={styles.section} aria-label="免打扰">
            <Text size={500} weight="semibold">
              免打扰
            </Text>
            <div className={styles.row}>
              <div className={styles.rowText}>
                <Text size={300}>免打扰时段</Text>
                <Text className={styles.subtle} size={200}>
                  时段内不提醒但继续计时，结束后补一次提醒
                </Text>
              </div>
              <Switch
                className={styles.switchControl}
                checked={Boolean(quiet)}
                disabled={!loaded}
                aria-label="免打扰时段"
                onChange={(_, detail) =>
                  patch({ quietHours: detail.checked ? { ...DEFAULT_QUIET_HOURS } : null })
                }
              />
            </div>
            {quiet && (
              <div className={styles.grid2}>
                <Field label="开始时间">
                  <Input
                    className={styles.control}
                    size="large"
                    type="time"
                    value={quiet.start}
                    disabled={!loaded}
                    onChange={(_, detail) =>
                      patch({
                        quietHours: { ...quiet, start: detail.value || DEFAULT_QUIET_HOURS.start },
                      })
                    }
                  />
                </Field>
                <Field label="结束时间">
                  <Input
                    className={styles.control}
                    size="large"
                    type="time"
                    value={quiet.end}
                    disabled={!loaded}
                    onChange={(_, detail) =>
                      patch({
                        quietHours: { ...quiet, end: detail.value || DEFAULT_QUIET_HOURS.end },
                      })
                    }
                  />
                </Field>
              </div>
            )}
            <Text className={styles.subtle} size={300}>
              判定依据：系统输入空闲时长；空闲超过「空闲判定起身」分钟数、锁屏或休眠都算一次起身。
              连续久坐超过提醒阈值后会先提醒一次，仍未起身则按「未起身再催」的间隔再次提醒。
            </Text>
          </section>
        </div>
      </div>
    </div>
  );
}

