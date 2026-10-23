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
import { useCallback, useState } from 'react';
import { Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';

import { wallpaperCredit, type BingWallpaper } from '../shell/wallpaper';
import type { ColorScheme } from '../shell/themeMode';

const useWallpaperStyles = makeStyles({
  root: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
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
  },
  scrim: {
    position: 'absolute',
    inset: 0,
    // Fluent 语义遮罩色；不同亮暗只调强度，不新增颜色
    backgroundColor: tokens.colorBackgroundOverlay,
  },
  credit: {
    position: 'absolute',
    left: tokens.spacingHorizontalXL,
    bottom: tokens.spacingVerticalS,
    zIndex: 4,
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

/**
 * 壁纸说明：安静地待在桌面左下角（网格底部留白带内），两行 12px，
 * 标题 + 地点短句；完整版权放 `aria-label`/`title`，不展开成另一套界面。
 */
export function WallpaperCredit({ wallpaper }: { wallpaper: BingWallpaper }) {
  const styles = useWallpaperStyles();
  const credit = wallpaperCredit(wallpaper);
  return (
    <div
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
  );
}
