/**
 * 全局快捷键（B5）：
 * - Ctrl+Shift+H：隐藏 / 显示窗口 —— 走 Rust 命令 `window_toggle_visible`；
 *   Rust 侧同时用 tauri-plugin-global-shortcut 注册了同一个系统级热键，
 *   所以窗口隐藏后按热键也能恢复（不依赖 WebView 焦点）。
 * - Ctrl+Q：退出应用（Rust `app_exit`）
 * - Esc：交给上层（桌面层在编辑模式里自己要处理 Esc，App 只在非桌面页把 Esc 当“返回桌面”）
 *
 * 页面内再按一次 Ctrl+Shift+H 也生效（非全局路径），两者最终都落到同一个 Rust 命令。
 */

import { useEffect, useRef } from 'react';

import { appExit, isTauriRuntime, windowToggleVisible } from '../plugins/tauri';

export interface GlobalShortcutHandlers {
  /** Esc（非输入框内） */
  onEscape?: () => void;
  /** 覆盖默认 Ctrl+Shift+H 行为 */
  onToggleVisibility?: () => void | Promise<void>;
  /** 覆盖默认 Ctrl+Q 行为 */
  onQuit?: () => void | Promise<void>;
  /** 失败/不可用提示 */
  notify?: (text: string) => void;
  /** 总开关，默认 true */
  enabled?: boolean;
}

export type SwitchVisibilityResult = 'hidden' | 'shown' | 'unsupported' | 'error';

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** 切换主窗口可见性，返回切换后的状态（失败返回 error/unsupported） */
export async function toggleWindowVisibility(
  notify?: (text: string) => void,
): Promise<SwitchVisibilityResult> {
  if (!isTauriRuntime()) {
    notify?.('隐藏/显示窗口只在 Tauri 运行时可用');
    return 'unsupported';
  }
  try {
    const visible = await windowToggleVisible();
    return visible ? 'shown' : 'hidden';
  } catch (error) {
    notify?.(`切换窗口可见性失败：${toMessage(error)}`);
    return 'error';
  }
}

/** 退出应用（Rust 侧 app_exit） */
export async function quitApplication(notify?: (text: string) => void): Promise<void> {
  if (!isTauriRuntime()) {
    notify?.('退出只在 Tauri 运行时可用');
    return;
  }
  try {
    await appExit();
  } catch (error) {
    notify?.(`退出失败：${toMessage(error)}`);
  }
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/** 在 App 顶层调用一次即可 */
export function useGlobalShortcuts(handlers: GlobalShortcutHandlers = {}): void {
  const latest = useRef(handlers);
  latest.current = handlers;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (latest.current.enabled === false) return;
      if (event.defaultPrevented || event.isComposing) return;

      const ctrlOnly = event.ctrlKey && !event.altKey && !event.metaKey;
      if (ctrlOnly && !event.shiftKey && (event.key === 'q' || event.key === 'Q')) {
        event.preventDefault();
        const handlersNow = latest.current;
        void (handlersNow.onQuit ? handlersNow.onQuit() : quitApplication(handlersNow.notify));
        return;
      }

      if (ctrlOnly && event.shiftKey && (event.key === 'h' || event.key === 'H')) {
        event.preventDefault();
        const handlersNow = latest.current;
        void (handlersNow.onToggleVisibility
          ? handlersNow.onToggleVisibility()
          : toggleWindowVisibility(handlersNow.notify));
        return;
      }

      if (
        event.key === 'Escape' &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey &&
        !isEditableTarget(event.target)
      ) {
        latest.current.onEscape?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
