/**
 * 必应每日壁纸（v0.4.0）。
 *
 * 数据源按用户要求「都试一下」，依次尝试（第一个成功的就用）：
 *   1. `api.bimg.cc` —— 必应壁纸 API 的实际接口（文档站是 `api-bimg-cc.apifox.cn`）；
 *   2. `api-bimg-cc.apifox.cn` —— 用户提供的文档站域名，若它本身也提供接口则直接用；
 *   3. `www.bing.com/HPImageArchive.aspx` —— 必应原生每日壁纸 JSON（可能没有 CORS，失败即跳过）。
 *
 * 图片统一取 UHD（3840×2160，4K），按用户要求用 `object-fit: cover`（填充）而不是拉伸。
 * 只负责取数/缓存/降级；颜色与排版在 WallpaperLayer / WallpaperCredit 里用 Fluent token。
 */

import { useEffect, useState } from 'react';

const CACHE_KEY = 'wtsl.wallpaper.v1';
/** 壁纸一天一变；缓存 12 小时，避免每次启动都打接口，又不至于跨天不更新。 */
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;

export type WallpaperSource = 'bimg' | 'apifox' | 'bing';

export interface BingWallpaper {
  /** 必应给图片起的短标题，如「荒野伙伴」 */
  title: string;
  /** 完整版权描述，如「两只灰狼，黄石国家公园，怀俄明州，美国 (© John Morrison/Getty Images)」 */
  copyright: string;
  /** 必应搜索链接（保留给后续「查看原图」入口） */
  copyrightlink: string;
  /** 4K（UHD）图片地址 */
  url: string;
  /** 图片日期 YYYY-MM-DD */
  datetime: string;
  source: WallpaperSource;
}

interface WallpaperCache {
  savedAt: number;
  wallpaper: BingWallpaper;
}

/* ------------------------------------------------------------------ */
/* 缓存                                                                */
/* ------------------------------------------------------------------ */

export function readCachedWallpaper(): BingWallpaper | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WallpaperCache> | null;
    const savedAt = parsed?.savedAt;
    const wallpaper = parsed?.wallpaper;
    if (typeof savedAt !== 'number' || !isWallpaper(wallpaper)) return null;
    if (Date.now() - savedAt > CACHE_TTL_MS) return null;
    return wallpaper;
  } catch {
    return null;
  }
}

function writeCachedWallpaper(wallpaper: BingWallpaper): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const cache: WallpaperCache = { savedAt: Date.now(), wallpaper };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* 隐私模式/配额满：忽略，下次再取 */
  }
}

/* ------------------------------------------------------------------ */
/* 解析                                                                */
/* ------------------------------------------------------------------ */

function isWallpaper(value: unknown): value is BingWallpaper {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.title === 'string' &&
    typeof candidate.copyright === 'string' &&
    typeof candidate.url === 'string' &&
    candidate.url.startsWith('http')
  );
}

interface BimgEntry {
  title?: unknown;
  copyright?: unknown;
  copyrightlink?: unknown;
  url?: unknown;
  datetime?: unknown;
}

/** api.bimg.cc / apifox 镜像：`{ code, msg, data: [{ title, url, copyright, ... }] }` */
function parseBimgList(payload: unknown, source: WallpaperSource): BingWallpaper | null {
  const data = (payload as { data?: unknown } | null)?.data;
  if (!Array.isArray(data)) return null;
  for (const item of data as BimgEntry[]) {
    if (typeof item?.url !== 'string' || !item.url.startsWith('http')) continue;
    const title = typeof item.title === 'string' && item.title.trim() ? item.title.trim() : '必应壁纸';
    const copyright = typeof item.copyright === 'string' ? item.copyright.trim() : '';
    return {
      title,
      copyright,
      copyrightlink: typeof item.copyrightlink === 'string' ? item.copyrightlink : '',
      url: item.url,
      datetime: typeof item.datetime === 'string' ? item.datetime : '',
      source,
    };
  }
  return null;
}

/** 必应原生 `HPImageArchive.aspx?format=js`：`{ images: [{ url: '/th?id=...1920x1080.jpg', ... }] }` */
function parseBingArchive(payload: unknown): BingWallpaper | null {
  const images = (payload as { images?: unknown } | null)?.images;
  if (!Array.isArray(images) || images.length === 0) return null;
  const image = images[0] as Record<string, unknown>;
  const rawUrl = image?.url;
  if (typeof rawUrl !== 'string' || !rawUrl) return null;
  const absolute = rawUrl.startsWith('http') ? rawUrl : `https://www.bing.com${rawUrl}`;
  const url = absolute.replace(/_(1920x1080|1920x1200|1366x768|1080x1920)\.jpg/i, '_UHD.jpg');
  const startdate = typeof image.startdate === 'string' ? image.startdate : '';
  const title = typeof image.title === 'string' && image.title.trim() ? image.title.trim() : '必应壁纸';
  return {
    title,
    copyright: typeof image.copyright === 'string' ? image.copyright.trim() : '',
    copyrightlink: typeof image.copyrightlink === 'string' ? image.copyrightlink : '',
    url,
    datetime: startdate
      ? `${startdate.slice(0, 4)}-${startdate.slice(4, 6)}-${startdate.slice(6, 8)}`
      : '',
    source: 'bing',
  };
}

/* ------------------------------------------------------------------ */
/* 取数                                                                */
/* ------------------------------------------------------------------ */

async function fetchJson(url: string): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    if (!response.ok) return null;
    return (await response.json()) as unknown;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const MKT = 'zh-CN';

/** 依次尝试三个来源；全部失败时返回上一次缓存（可能已过期，但比没有强）。 */
export async function fetchBingWallpaper(): Promise<BingWallpaper | null> {
  const sources: Array<{ source: WallpaperSource; url: string; parse: (payload: unknown) => BingWallpaper | null }> = [
    {
      source: 'bimg',
      url: `https://api.bimg.cc/all?page=1&order=desc&limit=8&mkt=${MKT}&uhd=true`,
      parse: (payload) => parseBimgList(payload, 'bimg'),
    },
    {
      source: 'apifox',
      url: `https://api-bimg-cc.apifox.cn/all?page=1&order=desc&limit=8&mkt=${MKT}&uhd=true`,
      parse: (payload) => parseBimgList(payload, 'apifox'),
    },
    {
      source: 'bing',
      url: `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=${MKT}`,
      parse: parseBingArchive,
    },
  ];

  for (const { url, parse } of sources) {
    const payload = await fetchJson(url);
    const wallpaper = payload ? parse(payload) : null;
    if (wallpaper) {
      writeCachedWallpaper(wallpaper);
      return wallpaper;
    }
  }

  // 全部失败：退回上次成功的缓存（忽略 TTL），再不行返回 null 让界面停留在 Fluent 中性底色
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<WallpaperCache> | null;
      if (isWallpaper(parsed?.wallpaper)) return parsed.wallpaper;
    }
  } catch {
    /* 忽略 */
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* 展示用文案（内容设计：FLUENT2 §11，短句、不加句号）                  */
/* ------------------------------------------------------------------ */

export interface WallpaperCredit {
  /** 第一行：图片标题 */
  title: string;
  /** 第二行：地点短句（版权串去掉作者与最后一级区域，最多两段） */
  location: string;
  /** 完整版权（读屏 / title 用） */
  full: string;
}

export function wallpaperCredit(wallpaper: BingWallpaper): WallpaperCredit {
  const withoutAuthor = wallpaper.copyright.split(/\s*[（(]/)[0]?.trim() ?? '';
  const segments = withoutAuthor
    .split(/[，,]/)
    .map((segment) => segment.trim())
    .filter(Boolean);
  const location = segments.slice(0, 2).join('，');
  return {
    title: wallpaper.title,
    location,
    full: wallpaper.copyright,
  };
}

/* ------------------------------------------------------------------ */
/* React hook                                                          */
/* ------------------------------------------------------------------ */

/**
 * 启动时取一次必应壁纸（先用缓存点亮，再异步刷新）。
 * 失败返回 null → WallpaperLayer 停在 `colorNeutralBackground3`，界面照常可用。
 */
export function useBingWallpaper(): BingWallpaper | null {
  const [wallpaper, setWallpaper] = useState<BingWallpaper | null>(() => readCachedWallpaper());

  useEffect(() => {
    let alive = true;
    void fetchBingWallpaper().then((next) => {
      if (alive && next) setWallpaper(next);
    });
    return () => {
      alive = false;
    };
  }, []);

  return wallpaper;
}

