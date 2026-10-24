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
    /* 页面层内的局部层叠：装饰层 0 / 内容层 1；不要在这里再写 z-index 魔数 */
    position: 'relative',
    isolation: 'isolate',
    width: '100%',
    height: '100%',
    minHeight: 0,
    boxSizing: 'border-box',
    color: tokens.colorNeutralForeground1,
  },
  /*
   * 磨砂装饰层：只负责把壁纸糊掉，不拦指针，也不承担可读性。
   * 它必须是透明的，若在这里铺实色，后面的内容层就看不到模糊结果。
   *
   * `backdrop-filter` 自 Chromium 76 起可用（无前缀形式，不需要 -webkit- 别名），
   * WebView2 运行时下限是 86，所以这里不写前缀、也不做 JS 探测：不支持时该声明被丢弃，
   * 装饰层退化为全透明，可读性由内容层的兜底底色接管（见下面 surface 的注释）。
   */
  backdrop: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    backdropFilter: 'blur(var(--wtsl-page-blur))',
  },
  /*
   * 内容层底色：**不再**在这里写 color-mix()。
   *
   * 旧 WebView2（Chromium 96–100，Windows 10 1809 上的常见情况）不认识 color-mix，
   * 一条内联到 Griffel 的 color-mix 声明会被整条丢弃 → 内容层没有底色 → 页面变透明
   * → 正文压在壁纸上，等于把 0.4.x「设置页看不清字」的 bug 重新装回来。
   *
   * 取值改由 styles.css 的 `--wtsl-page-surface-background` 分档：默认是不透明的
   * Fluent 中性底（--colorNeutralBackground1），在 `@supports (background-color: color-mix(...))`
   * 成立时换成与改动前逐字相同的 94% 半透明混合。这样：
   * - 新运行时：取到的值与改动前完全一致，观感零变化；
   * - 旧运行时：整页不透明中性底，磨砂少一层，但文字对比度不降级；
   * - 判定发生在 CSS 层，不依赖 Griffel 与全局样式表的插入顺序，也没有 JS 分支。
   *
   * 该变量由 styles.css 声明在 `[data-wtsl-page-surface]`（就是本元素）上：Fluent 的
   * `--colorNeutralBackground1` 只在 FluentProvider 子树里定义，变量必须在使用处取值；
   * 末端保留一个 token 兜底，即使那条 CSS 因任何原因没生效也仍有可读底。
   */
  surface: {
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    width: '100%',
    height: '100%',
    minHeight: 0,
    boxSizing: 'border-box',
    backgroundColor: 'var(--wtsl-page-surface-background, var(--colorNeutralBackground1))',
  },
  header: {
    position: 'relative',
    /* 页头在内容层内部再抬一层，结构上保证返回按钮与标题永远高于磨砂装饰层 */
    zIndex: 1,
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
      <div
        className={styles.backdrop}
        aria-hidden="true"
        data-wtsl-page-backdrop="true"
      />
      <div className={styles.surface} data-wtsl-page-surface="true">
        <header className={styles.header}>
          <Button appearance="subtle" size="large" onClick={onBack}>
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
          <div
            className={styles.bodyInner}
            style={maxContentWidth ? { maxWidth: maxContentWidth } : undefined}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
