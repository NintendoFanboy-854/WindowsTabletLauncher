/**
 * 倒数日设置视图（宿主全窗口 Fluent Dialog，?view=settings 加载）。
 * 浮层重排 v1（docs/OVERLAY-REWRITE-SPEC.md §1/§2）：
 * - 单列 max-width 720 居中，视图 padding 24，section 间距 24，组内行距 12
 * - 行式开关项：label 14 + 说明 12 fg3 + 控件 40，行高 48
 * - 即时保存（不放大号保存按钮），不用 Divider 分组
 */

import {
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
  sectionHint: {
    color: tokens.colorNeutralForeground3,
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
  subtle: {
    color: tokens.colorNeutralForeground3,
  },
  switchControl: {
    flex: '0 0 auto',
    minHeight: '40px',
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
      <div className={styles.scrollArea}>
        <div className={styles.content}>
          <section className={styles.section} aria-label="显示">
            <Text size={500} weight="semibold">
              显示
            </Text>
            <div className={styles.row}>
              <div className={styles.rowText}>
                <Text size={300}>显示已过去的事件</Text>
                <Text className={styles.subtle} size={200}>
                  关闭后只显示今天与未来的事件
                </Text>
              </div>
              <Switch
                className={styles.switchControl}
                checked={settings.showPast}
                disabled={!loaded}
                aria-label="显示已过去的事件"
                onChange={(_, detail) =>
                  setSettings((previous) => ({ ...previous, showPast: detail.checked }))
                }
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
                className={styles.switchControl}
                checked={settings.highlightSoon}
                disabled={!loaded}
                aria-label="强调 7 天内的事件"
                onChange={(_, detail) =>
                  setSettings((previous) => ({ ...previous, highlightSoon: detail.checked }))
                }
              />
            </div>
          </section>

          <section className={styles.section} aria-label="使用提示">
            <Text size={500} weight="semibold">
              使用提示
            </Text>
            <Text className={styles.sectionHint} size={300}>
              长按事件行可以编辑或删除；点击「添加倒数日」新增一条事件。事件颜色只用于状态圆点，不再染主数字。
            </Text>
          </section>
        </div>
      </div>
    </div>
  );
}
