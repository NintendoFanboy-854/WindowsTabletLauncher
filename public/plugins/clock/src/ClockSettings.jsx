/**
 * 时钟设置视图（宿主全窗口 Fluent Dialog 里加载 ?view=settings）。
 *
 * 布局按 docs/OVERLAY-REWRITE-SPEC.md：单列 max 720 居中、padding 24、
 * section 间距 24、行式设置项 label14 + 描述12 + 控件40、行高 48；
 * 浮层标题/关闭由宿主 Dialog 提供，这里不重复。
 */

import { useEffect, useState } from 'react';
import {
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
    display: 'flex',
    flexDirection: 'column',
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL} 0`,
    overflow: 'hidden',
    color: tokens.colorNeutralForeground1,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    paddingBottom: tokens.spacingVerticalXXL,
  },
  content: {
    width: '100%',
    maxWidth: '720px',
    marginInline: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXL,
  },
  preview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL}`,
    borderRadius: tokens.borderRadiusXLarge,
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
  sectionTitle: {
    color: tokens.colorNeutralForeground1,
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalL,
    minHeight: '48px',
  },
  rowText: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  radio: {
    minHeight: '40px',
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
      <div className={styles.scroll}>
        <div className={styles.content}>
          <div className={styles.preview} aria-hidden="true">
            <Text className={styles.numeric} size={900} weight="semibold">
              {time.main}
              {settings.showSeconds ? `:${time.seconds}` : ''}
              {settings.hour12 ? ` ${time.meridiem}` : ''}
            </Text>
            <Text className={styles.secondary} size={300}>
              {date.date} · {date.weekday}
            </Text>
          </div>

          <section className={styles.section} aria-label="时间显示">
            <Text className={styles.sectionTitle} size={500} weight="semibold">
              时间显示
            </Text>
            <div className={styles.rows}>
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
            </div>
          </section>

          <section className={styles.section} aria-label="日期格式">
            <Text className={styles.sectionTitle} size={500} weight="semibold">
              日期格式
            </Text>
            <RadioGroup
              value={settings.dateFormat}
              onChange={(_, detail) => setSettings((previous) => ({ ...previous, dateFormat: detail.value }))}
            >
              <Radio className={styles.radio} value="zh" label="10月18日 星期日（中文）" />
              <Radio className={styles.radio} value="iso" label="2026-10-18（ISO）" />
              <Radio className={styles.radio} value="en" label="10/18 Sun（英文）" />
            </RadioGroup>
          </section>

          <Text className={styles.subtle} size={200}>
            长按卡片或右键可以再次打开设置；点击卡片切换 12 / 24 小时制。
          </Text>
        </div>
      </div>
    </div>
  );
}
