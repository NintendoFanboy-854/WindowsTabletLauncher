/**
 * 倒数日设置视图（宿主全窗口 Fluent Dialog，?view=settings 加载）。
 * 只放两张开关；列表/编辑在卡片与编辑视图里。
 */

import {
  Divider,
  Switch,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { useStoredConfig } from '../../_shared/host.js';
import { DEFAULT_SETTINGS, SETTINGS_KEY, normalizeSettings } from './data/items.js';

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
  subtle: {
    color: tokens.colorNeutralForeground3,
  },
});

export default function CountdownSettings() {
  const styles = useStyles();
  const [settings, setSettings, loaded] = useStoredConfig(
    SETTINGS_KEY,
    DEFAULT_SETTINGS,
    normalizeSettings,
  );

  return (
    <div className={styles.root}>
      <section className={styles.section} aria-label="显示设置">
        <Text size={400} weight="semibold">
          显示设置
        </Text>
        <div className={styles.row}>
          <div className={styles.rowText}>
            <Text size={300}>显示已过去的事件</Text>
            <Text className={styles.subtle} size={200}>
              关闭后只显示今天与未来的事件
            </Text>
          </div>
          <Switch
            checked={settings.showPast}
            disabled={!loaded}
            aria-label="显示已过去的事件"
            onChange={(_, detail) => setSettings((previous) => ({ ...previous, showPast: detail.checked }))}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.rowText}>
            <Text size={300}>强调 7 天内的事件</Text>
            <Text className={styles.subtle} size={200}>
              不足 7 天的天数用事件颜色强调
            </Text>
          </div>
          <Switch
            checked={settings.highlightSoon}
            disabled={!loaded}
            aria-label="强调 7 天内的事件"
            onChange={(_, detail) =>
              setSettings((previous) => ({ ...previous, highlightSoon: detail.checked }))
            }
          />
        </div>
      </section>

      <Divider />

      <Text className={styles.subtle} size={200}>
        长按事件行可以编辑或删除；点击「添加倒数日」新增一条事件。
      </Text>
    </div>
  );
}
