/**
 * 宿主页面路由：桌面之外还有设置 / 复盘 / 插件管理三个全屏页。
 *
 * 路由不进 React Router（项目没有这个依赖，也不需要）：页面 id 和 URL 的
 * `?page=` 参数一一对应，刷新/截图/深链都能直达。App 接线时用
 * `useHostPage()` 拿当前页，导航走它返回的 setter 即可。
 */

import { useCallback, useEffect, useState } from 'react';

export type HostPage = 'desktop' | 'settings' | 'review' | 'plugins';

export const HOST_PAGES: readonly HostPage[] = ['desktop', 'settings', 'review', 'plugins'];

export const PAGE_TITLES: Record<HostPage, string> = {
  desktop: '桌面',
  settings: '设置',
  review: '复盘',
  plugins: '插件管理',
};

export const PAGE_PARAM = 'page';

export function isHostPage(value: unknown): value is HostPage {
  return typeof value === 'string' && (HOST_PAGES as readonly string[]).includes(value);
}

/** 从 querystring 读当前页；没有/非法参数当桌面 */
export function parseHostPage(search: string): HostPage {
  const value = new URLSearchParams(search).get(PAGE_PARAM);
  return isHostPage(value) ? value : 'desktop';
}

export function readHostPage(): HostPage {
  if (typeof window === 'undefined') return 'desktop';
  return parseHostPage(window.location.search);
}

/** 把页面写进 URL（replace，不产生历史记录）；保留其它查询参数 */
export function writeHostPage(page: HostPage): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (page === 'desktop') url.searchParams.delete(PAGE_PARAM);
  else url.searchParams.set(PAGE_PARAM, page);
  window.history.replaceState(window.history.state, '', url);
}

/** 当前页面 + 导航；监听 popstate，浏览器后退也能同步 */
export function useHostPage(): [HostPage, (page: HostPage) => void] {
  const [page, setPage] = useState<HostPage>(() => readHostPage());

  useEffect(() => {
    const onPopState = () => setPage(readHostPage());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((next: HostPage) => {
    writeHostPage(next);
    setPage(next);
  }, []);

  return [page, navigate];
}
