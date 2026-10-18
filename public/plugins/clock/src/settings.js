/** 时钟插件的设置模型与时间格式化（纯 JS，不依赖 React）。 */

export const SETTINGS_KEY = 'clock.settings';

export const DEFAULT_SETTINGS = {
  hour12: false,
  showSeconds: true,
  dateFormat: 'zh', // 'zh' | 'iso' | 'en'
};

const WEEKDAYS_ZH = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad2 = (n) => String(n).padStart(2, '0');

/** 宿主配置可能是旧数据 / 部分字段，统一收敛成完整设置（非法字段回落默认值）。 */
export function normalizeSettings(raw) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  return {
    hour12: typeof source.hour12 === 'boolean' ? source.hour12 : DEFAULT_SETTINGS.hour12,
    showSeconds:
      typeof source.showSeconds === 'boolean' ? source.showSeconds : DEFAULT_SETTINGS.showSeconds,
    dateFormat: ['zh', 'iso', 'en'].includes(source.dateFormat)
      ? source.dateFormat
      : DEFAULT_SETTINGS.dateFormat,
  };
}

/** 时间 → { main, seconds, meridiem }（秒在 1×1 由调用方省略） */
export function formatTime(date, settings) {
  let hours = date.getHours();
  let meridiem = '';
  if (settings.hour12) {
    meridiem = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
  }
  return {
    main: `${settings.hour12 ? hours : pad2(hours)}:${pad2(date.getMinutes())}`,
    seconds: pad2(date.getSeconds()),
    meridiem,
  };
}

/** 日期 → { date, weekday, inline }，inline 是 2×1 里合并显示的文本 */
export function formatDate(date, settings) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdayZh = WEEKDAYS_ZH[date.getDay()];
  const weekdayEn = WEEKDAYS_EN[date.getDay()];
  switch (settings.dateFormat) {
    case 'iso':
      return { date: `${year}-${pad2(month)}-${pad2(day)}`, weekday: weekdayZh, inline: `${year}-${pad2(month)}-${pad2(day)}` };
    case 'en':
      return { date: `${month}/${day}`, weekday: weekdayEn, inline: `${month}/${day} ${weekdayEn}` };
    case 'zh':
    default:
      return { date: `${month}月${day}日`, weekday: weekdayZh, inline: `${month}月${day}日 ${weekdayZh}` };
  }
}

/** 播报给读屏 / Agent 工具用的完整描述 */
export function describeTime(date, settings, sizeKey) {
  const time = formatTime(date, settings);
  const dateParts = formatDate(date, settings);
  const showSeconds = settings.showSeconds && sizeKey !== '1x1';
  return {
    iso: date.toISOString(),
    time: `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`,
    hour12: settings.hour12,
    display: `${time.main}${showSeconds ? `:${time.seconds}` : ''}${settings.hour12 ? ` ${time.meridiem}` : ''}`,
    date: dateParts.date,
    weekday: dateParts.weekday,
    dateFormat: settings.dateFormat,
    showSeconds,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}
