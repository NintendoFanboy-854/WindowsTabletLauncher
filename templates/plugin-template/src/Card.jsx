/**
 * 模板卡片（L0）。
 *
 * 只演示共享骨架的接法：
 * - CardIdentity 是内容区第一行（20px 身份色图标 + 组件名），照抄即符合 Equal Except Hue；
 * - CardRoot 负责卡片手势、键盘 Enter/Space 与内部控件过滤；
 * - 卡体点击请求 L1 详情；快捷按钮 stopPropagation + CardRoot 的控件过滤，不打开详情；
 * - 1×1 按 DENSITY 只留主数值与标签；2×2 / 3×2 才出现列表行和快捷操作。
 */

import { Add20Regular, Apps20Regular } from '@fluentui/react-icons';
import { Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import {
  requestOverlay,
  useAgentTools,
  useHostSize,
  useStoredConfig,
} from './shared/host.js';
import { CardIdentity, CardRoot, ListRow, Metric, TouchButton } from './shared/ui.jsx';
import { useDemoCount } from './demo.js';
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  SUMMARY_TOOL,
  describeSummary,
  normalizeSettings,
  sizeKeyOf,
} from './settings.js';

const AGENT_TOOLS = [SUMMARY_TOOL];

const useStyles = makeStyles({
  root: {
    justifyContent: 'flex-start',
  },
  rootCompact: {
    justifyContent: 'flex-start',
  },
  rootMedium: {},
  rootLarge: {},
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
  },
  hint: {
    minWidth: 0,
    color: tokens.colorNeutralForeground3,
  },
});

export default function Card() {
  const styles = useStyles();
  const sizeKey = useHostSize(sizeKeyOf, '2x2');
  const [settings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const [count, addCount] = useDemoCount();

  const compact = sizeKey === '1x1';
  const large = sizeKey === '3x2';

  // Agent 对等示例：声明与 UI 同一份数据源；只在卡片视图注册，
  // 桌面卡片会随桌面常驻，L1 浮层打开期间工具仍然可用。
  useAgentTools(AGENT_TOOLS, {
    'template.summary': () => describeSummary(count, settings),
  });

  const handleQuickAdd = (event) => {
    // CardRoot 已过滤 button；这里再 stopPropagation，演示控件不会触发卡片主操作。
    event.stopPropagation();
    addCount(settings.step);
  };

  return (
    <CardRoot
      ariaLabel={`模板示例：已完成 ${count} ${settings.unit}。快捷按钮每次增加 ${settings.step} ${settings.unit}；点击卡片打开详情`}
      onActivate={() => requestOverlay('detail', '模板详情')}
      className={mergeClasses(
        styles.root,
        compact && styles.rootCompact,
        !compact && styles.rootMedium,
        large && styles.rootLarge,
      )}
    >
      <CardIdentity
        icon={<Apps20Regular />}
        label="模板"
        compact={compact}
        trailing={large ? <Text size={200}>3×2</Text> : undefined}
      />

      <Metric
        value={count}
        unit={settings.unit}
        label={compact ? '示例进度' : '已完成示例'}
      />

      {!compact ? (
        <ListRow
          title="示例条目"
          subtitle={`当前 ${count} ${settings.unit} · 每次 +${settings.step}`}
        />
      ) : null}

      {!compact ? (
        <div className={styles.actions}>
          <TouchButton appearance="secondary" icon={<Add20Regular />} onClick={handleQuickAdd}>
            增加 {settings.step} {settings.unit}
          </TouchButton>
          {settings.showHint ? (
            <Text size={200} className={styles.hint}>
              点击卡片查看详情
            </Text>
          ) : null}
        </div>
      ) : null}
    </CardRoot>
  );
}
