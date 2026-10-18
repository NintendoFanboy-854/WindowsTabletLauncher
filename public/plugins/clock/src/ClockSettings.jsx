/**
 * 时钟设置视图（宿主全窗口 Fluent Dialog 里加载 ?settings=1）。
 * 设置即时生效并持久化；卡片视图通过 storage 事件同步更新。
 * 字号/层级一律用 Fluent Text 的 size / weight 档位（type ramp）。
 */

import { useEffect, useState } from 'react';
import {
  Divider,
  Radio,
  RadioGroup,
  Switch,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { useStoredConfig } from '../../_shared/host.js';
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  formatDate,
  formatTime,
  normalizeSettings,
} from './settings.js';

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
  preview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  numeric: {
    fontVariantNumeric: 'tabular-nums',
  },
  subtle: {
    color: tokens.colorNeutralForeground3,
  },
  secondary: {
    color: tokens.colorNeutralForeground2,
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
  radios: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
});

export default function ClockSettings() {
  const styles = useStyles();
  const [settings, setSettings, loaded] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const time = formatTime(now, settings);
  const date = formatDate(now, settings);

  return (
    <div className={styles.root} data-clock-settings>
      <div className={styles.preview} aria-hidden="true">
        <Text className={styles.numeric} size={800} weight="semibold">
          {time.main}
          {settings.showSeconds ? `:${time.seconds}` : ''}
          {settings.hour12 ? ` ${time.meridiem}` : ''}
        </Text>
        <Text className={styles.secondary} size={300}>
          {date.date} · {date.weekday}
        </Text>
      </div>

      <section className={styles.section} aria-label="时间显示">
        <Text size={400} weight="semibold">
          时间显示
        </Text>
        <div className={styles.row}>
          <div className={styles.rowText}>
            <Text size={300}>24 小时制</Text>
            <Text className={styles.subtle} size={200}>
              关闭后显示 12 小时制（AM / PM）
            </Text>
          </div>
          <Switch
            checked={!settings.hour12}
            disabled={!loaded}
            aria-label="24 小时制"
            onChange={(_, detail) => setSettings((previous) => ({ ...previous, hour12: !detail.checked }))}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.rowText}>
            <Text size={300}>显示秒</Text>
            <Text className={styles.subtle} size={200}>
              1×1 档位空间不足，按规格不显示秒
            </Text>
          </div>
          <Switch
            checked={settings.showSeconds}
            disabled={!loaded}
            aria-label="显示秒"
            onChange={(_, detail) => setSettings((previous) => ({ ...previous, showSeconds: detail.checked }))}
          />
        </div>
      </section>

      <Divider />

      <section className={styles.section} aria-label="日期格式">
        <Text size={400} weight="semibold">
          日期格式
        </Text>
        <div className={styles.radios}>
          <RadioGroup
            value={settings.dateFormat}
            onChange={(_, detail) => setSettings((previous) => ({ ...previous, dateFormat: detail.value }))}
          >
            <Radio value="zh" label="10月18日 星期日（中文）" />
            <Radio value="iso" label="2026-10-18（ISO）" />
            <Radio value="en" label="10/18 Sun（英文）" />
          </RadioGroup>
        </div>
      </section>

      <Divider />

      <Text className={styles.subtle} size={200}>
        长按卡片或右键可以再次打开设置；点击卡片切换 12 / 24 小时制。
      </Text>
    </div>
  );
}
