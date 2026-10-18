/**
 * 久坐提醒设置视图（宿主全窗口 Fluent Dialog，?view=settings 加载）。
 * 设置即时写入宿主配置；后台引擎每 10 秒读一次，改完自动生效。
 */

import {
  Divider,
  Field,
  Input,
  Switch,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { useStoredConfig } from '../../_shared/host.js';
import {
  DEFAULT_SETTINGS,
  DEFAULT_QUIET_HOURS,
  SETTINGS_KEY,
  normalizeSettings,
} from './data/engine.js';

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
  numbers: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalL,
    alignItems: 'flex-end',
  },
  field: {
    minWidth: '160px',
    flex: '1 1 160px',
  },
  quiet: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
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
      <section className={styles.section} aria-label="提醒开关">
        <div className={styles.row}>
          <div className={styles.rowText}>
            <Text size={300}>启用久坐提醒</Text>
            <Text className={styles.subtle} size={200}>
              关闭后不计时也不提醒
            </Text>
          </div>
          <Switch
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
            checked={settings.strongReminder}
            disabled={!loaded}
            aria-label="全屏强提醒"
            onChange={(_, detail) => patch({ strongReminder: detail.checked })}
          />
        </div>
      </section>

      <Divider />

      <section className={styles.section} aria-label="计时参数">
        <Text size={400} weight="semibold">
          计时参数
        </Text>
        <div className={styles.numbers}>
          <Field label="提醒阈值（分钟）" className={styles.field}>
            <Input
              type="number"
              min={1}
              value={String(settings.thresholdMin)}
              disabled={!loaded}
              onChange={setNumber('thresholdMin', DEFAULT_SETTINGS.thresholdMin)}
            />
          </Field>
          <Field label="未起身再催（分钟）" className={styles.field}>
            <Input
              type="number"
              min={1}
              value={String(settings.remindEveryMin)}
              disabled={!loaded}
              onChange={setNumber('remindEveryMin', DEFAULT_SETTINGS.remindEveryMin)}
            />
          </Field>
          <Field label="空闲判定起身（分钟）" className={styles.field}>
            <Input
              type="number"
              min={1}
              value={String(settings.idleResetMin)}
              disabled={!loaded}
              onChange={setNumber('idleResetMin', DEFAULT_SETTINGS.idleResetMin)}
            />
          </Field>
        </div>
      </section>

      <Divider />

      <section className={styles.section} aria-label="免打扰">
        <div className={styles.row}>
          <div className={styles.rowText}>
            <Text size={300}>免打扰时段</Text>
            <Text className={styles.subtle} size={200}>
              时段内不提醒但继续计时，结束后补一次提醒
            </Text>
          </div>
          <Switch
            checked={Boolean(quiet)}
            disabled={!loaded}
            aria-label="免打扰时段"
            onChange={(_, detail) =>
              patch({ quietHours: detail.checked ? { ...DEFAULT_QUIET_HOURS } : null })
            }
          />
        </div>
        {quiet && (
          <div className={styles.quiet}>
            <Field label="开始" className={styles.field}>
              <Input
                type="time"
                value={quiet.start}
                disabled={!loaded}
                onChange={(_, detail) =>
                  patch({ quietHours: { ...quiet, start: detail.value || DEFAULT_QUIET_HOURS.start } })
                }
              />
            </Field>
            <Field label="结束" className={styles.field}>
              <Input
                type="time"
                value={quiet.end}
                disabled={!loaded}
                onChange={(_, detail) =>
                  patch({ quietHours: { ...quiet, end: detail.value || DEFAULT_QUIET_HOURS.end } })
                }
              />
            </Field>
          </div>
        )}
      </section>

      <Text className={styles.subtle} size={200}>
        判定依据：系统输入空闲时长；空闲超过「空闲判定起身」分钟数、锁屏或休眠都算一次起身。
        后台常驻 iframe 负责计时与提醒，桌面卡片只负责显示与打卡。
      </Text>
    </div>
  );
}
