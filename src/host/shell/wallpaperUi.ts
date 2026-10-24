/**
 * 壁纸相关的「界面偏好」——只放**纯显示**的选择，不放壁纸本身的状态。
 *
 * 为什么单独一个模块：壁纸数据（当前是哪张图、历史、模式）由 `shell/wallpaper.ts`
 * 管；而「说明条要不要显示」这类只影响呈现的开关，既不属于壁纸数据，也不属于
 * Agent 设置，单独存一份最不容易互相覆盖。设置页与桌面层都只通过这里的 hook 读写，
 * 保证只有一个写入点。
 *
 * 存储键固定为 `wtsl.wallpaper.ui`，结构向后兼容：读到坏数据一律回落默认值，
 * 缺字段按默认补齐（不做「迁移」逻辑，因为这个结构只会加字段）。
 */
import { useCallback, useEffect, useState } from 'react';

export const WALLPAPER_UI_KEY = 'wtsl.wallpaper.ui';

export interface WallpaperUiPrefs {
  /** 桌面左下角的壁纸说明条是否显示（本机图片时用户可能只想看纯壁纸） */
  captionHidden: boolean;
}

const DEFAULTS: WallpaperUiPrefs = {
  captionHidden: false,
};

/** 同一文档内的同步事件：设置页改了，桌面层立刻跟着变（storage 事件只在跨 window 时触发） */
const CHANGED_EVENT = 'wtsl:wallpaper-ui-changed';

function storage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function readWallpaperUi(): WallpaperUiPrefs {
  const store = storage();
  if (!store) return { ...DEFAULTS };
  try {
    const raw = store.getItem(WALLPAPER_UI_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<WallpaperUiPrefs> | null;
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULTS };
    return {
      captionHidden: typeof parsed.captionHidden === 'boolean' ? parsed.captionHidden : DEFAULTS.captionHidden,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function writeWallpaperUi(next: WallpaperUiPrefs): void {
  const store = storage();
  if (store) {
    try {
      store.setItem(WALLPAPER_UI_KEY, JSON.stringify(next));
    } catch {
      /* 存不了就本次会话有效 */
    }
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHANGED_EVENT));
}

export function useWallpaperUi(): {
  captionHidden: boolean;
  setCaptionHidden: (next: boolean) => void;
} {
  const [prefs, setPrefs] = useState<WallpaperUiPrefs>(readWallpaperUi);

  useEffect(() => {
    const sync = () => setPrefs(readWallpaperUi());
    window.addEventListener(CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const setCaptionHidden = useCallback((next: boolean) => {
    // 先读再写：避免把别人刚写进去的其它字段覆盖掉
    writeWallpaperUi({ ...readWallpaperUi(), captionHidden: next });
  }, []);

  return { captionHidden: prefs.captionHidden, setCaptionHidden };
}
