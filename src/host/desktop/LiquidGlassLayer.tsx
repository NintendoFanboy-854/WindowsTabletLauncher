/**
 * 桌面上的「液态玻璃」层。
 *
 * 它盖在壁纸图片之上、压暗遮罩之下，只负责画那些会融合、会变形的玻璃液滴。
 * 纹理来自当前壁纸：本机图片直接读 blob URL；必应图片要先经 Rust 代取成
 * data URL —— 跨源图片喂进 `texImage2D` 会被浏览器拒绝（见 `wallpaper_texture.rs`）。
 *
 * 纹理没到之前画布保持透明，底图照常显示；取不到就整层不出现，桌面不受影响。
 */
import { useEffect, useRef } from 'react';
import { makeStyles } from '@fluentui/react-components';

import { invokeCommand, isTauriRuntime } from '../plugins/tauri';
import { createLiquidGlass, type LiquidGlassHandle } from './liquidGlass/renderer';

const useStyles = makeStyles({
  canvas: {
    position: 'absolute',
    inset: 0,
    display: 'block',
    width: '100%',
    height: '100%',
    // 壁纸是纯背景：所有指针事件都要透到桌面层
    pointerEvents: 'none',
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: '480ms',
    transitionTimingFunction: 'ease-out',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0ms',
    },
  },
  ready: {
    opacity: 1,
  },
});

export interface LiquidGlassLayerProps {
  /** 壁纸地址：本机图片是 blob URL，必应是 https 图片地址 */
  url: string | null;
  kind: 'local' | 'remote';
  /** 壁纸身份（内容哈希或条目 key），变化时才重新取纹理 */
  identity: string | null;
}

export function LiquidGlassLayer({ url, kind, identity }: LiquidGlassLayerProps) {
  const styles = useStyles();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handleRef = useRef<LiquidGlassHandle | null>(null);

  // 渲染器生命周期：只建一次，组件卸载时销毁
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const handle = createLiquidGlass(canvas);
    if (!handle) return undefined;
    handleRef.current = handle;

    const onResize = () => handle.resize();
    const onVisibility = () => handle.setPaused(document.hidden);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    handle.setPaused(document.hidden || reduced.matches);

    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      handle.destroy();
      handleRef.current = null;
    };
  }, []);

  // 纹理：壁纸变了才重新取
  useEffect(() => {
    const handle = handleRef.current;
    const canvas = canvasRef.current;
    if (!handle || !canvas || !url) return undefined;

    let cancelled = false;

    const apply = (src: string) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        if (cancelled) return;
        handle.setImage(image);
        canvas.classList.add(styles.ready);
      };
      image.src = src;
    };

    if (kind === 'local' || !isTauriRuntime()) {
      apply(url);
    } else {
      // 必应图片没有 CORS 头，必须由 Rust 取回来编码成 data URL
      invokeCommand<string>('fetch_wallpaper_texture', { url })
        .then((dataUrl) => {
          if (cancelled || !dataUrl) return;
          apply(dataUrl);
        })
        .catch(() => {
          /* 取不到就不显示玻璃层，底图照常工作 */
        });
    }

    return () => {
      cancelled = true;
    };
  }, [identity, kind, styles.ready, url]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" data-liquid-glass="true" />;
}
