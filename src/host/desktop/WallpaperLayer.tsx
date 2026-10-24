/**
 * 桌面壁纸层（v0.4.0）：必应每日壁纸 + 壁纸说明。
 *
 * 用户要求（2026-10-23）：
 * - 用原生必应壁纸接口（API 实际域 `api.bimg.cc`，文档站 `api-bimg-cc.apifox.cn`），UHD 4K；
 * - 屏幕比例与壁纸不一致时用“填充”（`object-fit: cover`），不拉伸；
 * - 带上图片描述，但用符合设计原则的方式（安静、低层级、不抢小组件）。
 *
 * 视觉全部取 Fluent token：底色 `colorNeutralBackground3`、说明卡面用与桌面卡片一致的
 * `colorNeutralBackground1` + 既有材质 token、文字 `colorNeutralForeground2/3`。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';

import { wallpaperCredit, type BingWallpaper } from '../shell/wallpaper';
import type { ColorScheme } from '../shell/themeMode';
import {
  computeGridMetrics,
  layoutFrame,
  reportFooterPillHeight,
  useFooterPillHeight,
} from '../layout';

const useWallpaperStyles = makeStyles({
  root: {
    position: 'fixed',
    inset: 0,
    /*
     * 最底层：壁纸只做背景，不许盖住任何可交互元素。
     * 层级取 `--wtsl-layer-wallpaper`（styles.css 里的层级约定），未定义时回落到 0；
     * 换层级只改变量，不在各处写 z-index 字面量。
     */
    zIndex: 'var(--wtsl-layer-wallpaper, 0)',
    overflow: 'hidden',
    // 图片未到/失败时的 Fluent 中性底色（不写死颜色）
    backgroundColor: tokens.colorNeutralBackground3,
    pointerEvents: 'none',
  },
  image: {
    display: 'block',
    width: '100%',
    height: '100%',
    // 用户要求：比例不匹配用填充（cover），不拉伸
    objectFit: 'cover',
    objectPosition: 'center',
    // 图片层自己不拦指针：壁纸是纯背景，点击/拖拽要透到桌面层
    pointerEvents: 'none',
  },
  scrim: {
    position: 'absolute',
    inset: 0,
    // Fluent 语义遮罩色；不同亮暗只调强度，不新增颜色
    backgroundColor: tokens.colorBackgroundOverlay,
    // 遮罩同样不拦指针（根节点已设，这里显式声明，避免以后有人挪动 DOM 时丢掉）
    pointerEvents: 'none',
  },
  /*
   * 说明 pill 的**定位壳**：它就是 `layoutFrame().pill` 那一行——左缘与网格齐平、
   * 上缘 = 网格下缘 + 一个 widget gutter（g）、高度 = pill 实测高度 H_p。
   *
   * 对齐口径：**下缘**。壳高恒等于 H_p，pill 用 `align-items: flex-end` 贴在壳底，
   * 而 chat 入口的下缘同样取这一行的下缘（`layoutFrame().entry` 的 y + size），
   * 所以两者下缘落在同一条线上（= pill.bottom）——由同一个值推导，不是两套规则。
   * 不用 transform 补偿，也不写死像素；pill 自身高度由文字内容决定，壳跟着它走。
   */
  creditDock: {
    position: 'absolute',
    // 与桌面层同一层级（样式层级约定的唯一来源在 styles.css）：
    // 要压在壁纸之上、又要低于 Agent 面板（--wtsl-layer-overlay）
    zIndex: 'var(--wtsl-layer-desktop)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    pointerEvents: 'none',
  },
  credit: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    maxWidth: '420px',
    boxSizing: 'border-box',
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusCircular,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 78%, transparent)`,
    backdropFilter: 'blur(var(--wtsl-material-blur))',
    boxShadow: tokens.shadow4,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  creditLine: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  creditDivider: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground3,
  },
  creditTitle: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground2,
  },
  creditMeta: {
    color: tokens.colorNeutralForeground3,
  },
});

export interface WallpaperLayerProps {
  wallpaper: BingWallpaper | null;
  colorScheme: ColorScheme;
}

/** 全屏壁纸层：画在桌面内容下方，不拦指针。 */
export function WallpaperLayer({ wallpaper, colorScheme }: WallpaperLayerProps) {
  const styles = useWallpaperStyles();
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const handleError = useCallback(() => {
    setFailedUrl(wallpaper?.url ?? null);
  }, [wallpaper?.url]);
  const visible = Boolean(wallpaper && failedUrl !== wallpaper.url);

  return (
    <div className={styles.root} aria-hidden="true" data-wallpaper-layer="true">
      {visible && wallpaper ? (
        <img
          className={styles.image}
          src={wallpaper.url}
          alt=""
          draggable={false}
          decoding="async"
          onError={handleError}
          data-wallpaper-source={wallpaper.source}
        />
      ) : null}
      {/* 暗色压暗以保证小组件上的文字可读；亮色只做极轻的压暗 */}
      <div className={styles.scrim} style={{ opacity: colorScheme === 'light' ? 0.06 : 0.24 }} />
    </div>
  );
}

/** 屏幕尺寸（与桌面层同一口径：宿主根满屏无内边距 → window.innerWidth/Height） */
function readViewportSize(): { width: number; height: number } {
  if (typeof window === 'undefined') return { width: 0, height: 0 };
  return { width: window.innerWidth, height: window.innerHeight };
}

function useViewportSize(): { width: number; height: number } {
  const [size, setSize] = useState(readViewportSize);
  useEffect(() => {
    const measure = () => {
      const next = readViewportSize();
      setSize((previous) =>
        previous.width === next.width && previous.height === next.height ? previous : next,
      );
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  return size;
}

/**
 * 壁纸说明：安静地待在桌面左下角，两行 12px，标题 + 地点短句；
 * 完整版权放 `aria-label`/`title`，不展开成另一套界面。
 *
 * 位置不再写死 `bottom: 8`，也不落在一条写死高 56 的带子里：整块挂在 `layoutFrame().pill`
 * （1440×960 / H_p=26 下为 (22,907)-(1418,933)），上缘 = 网格下缘 + 一个 widget gutter。
 * 它自己的高度由文字内容决定，并且**反向成为布局的输入**：
 * `ResizeObserver` 量自身 border-box 高度 → `reportFooterPillHeight`（`layout/footer` 的
 * 取整去重 store）→ 本组件与桌面层、Agent 入口都通过 `useFooterPillHeight` 订阅，
 * 于是 grid 的 insetY、pill 的 top、chat 入口的 bottom 在下一帧一起按新的 H_p 重算。
 */
export function WallpaperCredit({ wallpaper }: { wallpaper: BingWallpaper }) {
  const styles = useWallpaperStyles();
  const credit = wallpaperCredit(wallpaper);
  const viewport = useViewportSize();
  const pillHeight = useFooterPillHeight();
  const pillRef = useRef<HTMLDivElement | null>(null);

  // 只观测 pill 自身：量的是 border-box（padding + 描边 + 行高），与布局无关，
  // 因此不会出现「布局变 → 尺寸变 → 再改布局」的回环。取整与去重在 store 里完成。
  useEffect(() => {
    const element = pillRef.current;
    if (!element) return;
    const measure = () => reportFooterPillHeight(element.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const frame = useMemo(
    () =>
      layoutFrame(
        computeGridMetrics(viewport.width, viewport.height),
        viewport.width,
        viewport.height,
        pillHeight,
      ),
    [viewport.width, viewport.height, pillHeight],
  );
  const { pill } = frame;

  return (
    <div
      className={styles.creditDock}
      style={{ left: pill.left, top: pill.top, width: pill.width, height: pill.height }}
    >
      <div
        ref={pillRef}
        className={styles.credit}
        data-wallpaper-credit="true"
        data-wallpaper-source={wallpaper.source}
        aria-label={`壁纸：${credit.title}。${credit.full}`}
        title={credit.full}
      >
        <Text size={200} weight="semibold" className={mergeClasses(styles.creditLine, styles.creditTitle)}>
          {credit.title}
        </Text>
        {credit.location ? (
          <>
            <Text size={200} className={styles.creditDivider} aria-hidden="true">
              ·
            </Text>
            <Text size={200} className={mergeClasses(styles.creditLine, styles.creditMeta)}>
              {credit.location}
            </Text>
          </>
        ) : null}
      </div>
    </div>
  );
}
