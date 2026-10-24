/**
 * 插件浮层视图的容器（MOTION §4 / §8）。
 *
 * 只做三件事：
 * 1. 用 Fluent `Dialog` 提供模态语义（焦点进入、Esc、点遮罩、aria）；
 * 2. 关掉 Fluent 自带的 backdrop 淡入（`backdropMotion={null}`），换成自己的 scrim，
 *    避免默认动效和 container transform 叠加；
 * 3. 把 surface / scrim / 内容层的样式全权交给 `useOverlayTransform`（E4 container transform）。
 *
 * 关闭动画期间浮层必须还挂着，所以这里不在 `onOpenChange` 里直接卸载：所有关闭入口
 * （X / Esc / 点遮罩 / 插件 request-overlay-close）都走 `requestClose`，动画结束后
 * 才回调 `onClosed` 让父组件卸载。
 */
import { useRef } from 'react';
import type { ReactNode } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';

import { useOverlayTransform } from './overlayMotion';
import type { OverlaySource } from './overlayMotion';

const useStyles = makeStyles({
  /**
   * 浮层 surface 的自然尺寸（container transform 的终点由它决定）：
   * 1440 下 880×680，1024×768 下 880×553（min(72vh, 680px)）。
   * 圆角起止同值（卡片 12）；动画期间由内联样式接管定位与尺寸。
   */
  surface: {
    width: 'min(880px, 92vw)',
    maxWidth: '92vw',
    height: 'min(72vh, 680px)',
    borderRadius: tokens.borderRadius2XLarge,
    boxShadow: tokens.shadow64,
  },
  body: {
    height: '100%',
    minHeight: 0,
  },
  /**
   * 宿主唯一内容内衬：DialogSurface 自身 24 + DialogContent 16 = 40。
   * 插件 detail 骨架的横向 padding 归零（_shared/ui.jsx），避免插件再叠一条内容轴。
   */
  content: {
    height: '100%',
    minHeight: 0,
    padding: tokens.spacingHorizontalL,
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  closeButton: {
    minWidth: `calc(${tokens.spacingHorizontalXL} + ${tokens.spacingHorizontalXL})`,
    minHeight: `calc(${tokens.spacingVerticalXL} + ${tokens.spacingVerticalXL})`,
  },
  /** 自定义 scrim：只负责透明度，点击关闭仍由 Fluent 的 backdrop 处理 */
  scrim: {
    backgroundColor: tokens.colorBackgroundOverlay,
  },
});

export interface PluginOverlayProps {
  /** 打开浮层时捕获的来源卡片快照（决定 container transform 的起点） */
  source: OverlaySource | null;
  /** DialogSurface 的 aria-label（读屏用的完整描述） */
  ariaLabel: string;
  /** 标题栏文字 */
  title: string;
  /** 关闭动画结束：父组件在这里卸载浮层并把焦点还给来源卡片 */
  onClosed: () => void;
  /** 拿到 close 后挂到插件 iframe 的 Esc / 设置跳转上 */
  children: (close: () => void) => ReactNode;
}

export function PluginOverlay({
  source,
  ariaLabel,
  title,
  onClosed,
  children,
}: PluginOverlayProps) {
  const styles = useStyles();
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const { mode, surfaceStyle, scrimStyle, contentStyle, requestClose, phase } = useOverlayTransform({
    source,
    surfaceRef,
    onClosed,
  });

  return (
    <Dialog
      open
      modalType="modal"
      onOpenChange={(_event, detail) => {
        // Esc / 点遮罩：Fluent 只是“请求”关闭，真正的卸载在关闭动画之后
        if (!detail.open) requestClose();
      }}
    >
      <DialogSurface
        ref={surfaceRef}
        className={styles.surface}
        style={surfaceStyle}
        aria-label={ariaLabel}
        // 状态属性：验收脚本按它区分 container transform / 兜底 / 关闭阶段（同 E2 的 data-hover 约定）
        data-overlay-mode={mode}
        data-overlay-phase={phase}
        // 默认 backdrop 淡入（FadeRelaxed）会和自定义 scrim 叠加，这里直接关掉
        backdropMotion={null}
        backdrop={{ className: styles.scrim, style: scrimStyle }}
      >
        <DialogBody className={styles.body} style={contentStyle}>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                size="large"
                className={styles.closeButton}
                icon={<Dismiss24Regular />}
                aria-label="关闭浮层"
                onClick={requestClose}
              />
            }
          >
            {title}
          </DialogTitle>
          <DialogContent className={styles.content}>{children(requestClose)}</DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
