/**
 * 一次性壁纸说明的对外契型。
 *
 * 这里刻意只放类型：`oneshot/**` 不引用会话层的 `Message` / `Conversation`，
 * 也不写 `agent.conversations`，调用结果只活在 IndexedDB 的独立库里。
 */

/** 输入：来自必应每日壁纸的元数据（`src/host/shell/wallpaper.ts` 的 `BingWallpaper`） */
export interface WallpaperNoteInput {
  /** 内容地址（hsh 优先），缓存主键的一部分 */
  key: string;
  /** 市场，如 'zh-CN' */
  market: string;
  title: string;
  copyright: string;
  /** YYYY-MM-DD */
  date: string;
  /** 壁纸图片 URL（UHD）：随请求一起发给模型看（MiMo pro 图片理解） */
  imageUrl: string;
}

/** 一张图的说明：`key` 是缓存键（`cacheKeyFor()` 的产物，含市场与提示词版本） */
export interface WallpaperNote {
  key: string;
  text: string;
  model: string;
  createdAt: number;
}

/** UI 只消费这三态；失败与「24 小时内不再尝试」都折叠成 `failed` */
export type NoteStatus = 'idle' | 'loading' | 'ready' | 'failed';
