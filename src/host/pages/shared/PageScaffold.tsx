/**
 * 全屏页面的公共骨架：返回按钮 + 标题 + 右侧操作 + 可滚动内容。
 * 设置 / 复盘 / 插件管理三个页面共用，保证页头、间距、滚动行为一致。
 *
 * 密度约定（docs/DENSITY.md）：页头只用留白与字阶和内容分组，不加分割线。
 */
import type { ReactNode } from 'react';
import { Button, Text, Title2, makeStyles, tokens } from '@fluentui/react-components';

export interface PageScaffoldProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backLabel?: string;
  /** 页头右侧的操作区 */
  actions?: ReactNode;
  children: ReactNode;
  /** 内容最大宽度（内容区居中）；默认不限制 */
  maxContentWidth?: string;
}

const useStyles = makeStyles({
  root: {
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    width: '100%',
    height: '100%',
    minHeight: 0,
    boxSizing: 'border-box',
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXXL}`,
    paddingBottom: tokens.spacingVerticalM,
    '@media (max-width: 640px)': {
      padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
      paddingBottom: tokens.spacingVerticalS,
    },
  },
  headerText: {
    display: 'grid',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  headerSubtitle: {
    color: tokens.colorNeutralForeground3,
  },
  headerSpacer: {
    flex: 1,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  body: {
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalXXL} ${tokens.spacingVerticalXXL}`,
    '@media (max-width: 640px)': {
      padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalL} ${tokens.spacingVerticalXL}`,
    },
  },
  bodyInner: {
    width: '100%',
    marginInline: 'auto',
  },
});

export function PageScaffold({
  title,
  subtitle,
  onBack,
  backLabel = '返回桌面',
  actions,
  children,
  maxContentWidth,
}: PageScaffoldProps) {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Button appearance="subtle" onClick={onBack}>
          {backLabel}
        </Button>
        <div className={styles.headerText}>
          <Title2>{title}</Title2>
          {subtitle && (
            <Text size={200} className={styles.headerSubtitle}>
              {subtitle}
            </Text>
          )}
        </div>
        <div className={styles.headerSpacer} />
        {actions && <div className={styles.headerActions}>{actions}</div>}
      </header>
      <div className={styles.body}>
        <div className={styles.bodyInner} style={maxContentWidth ? { maxWidth: maxContentWidth } : undefined}>
          {children}
        </div>
      </div>
    </div>
  );
}
