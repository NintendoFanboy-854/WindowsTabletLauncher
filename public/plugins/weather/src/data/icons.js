/**
 * 和风天气图标映射。
 *
 * 图标目录：icons/dark/**（深色主题，白色图形）、icons/light/**（浅色主题，深色图形），
 * 文件名就是和风的天气 icon code。图标只从本地取，不联网。
 */

const NIGHT_MAP = {
  100: '150',
  101: '151',
  102: '152',
  103: '153',
};

/** 当前 API 文档里可能出现的 code（本地图标集覆盖了整套） */
const KNOWN_CODES = new Set(
  [
    100, 101, 102, 103, 104, 150, 151, 152, 153,
    300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318,
    350, 351, 399,
    400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 456, 457, 499,
    500, 501, 502, 503, 504, 507, 508, 509, 510, 511, 512, 513, 514, 515,
    801, 802, 803, 804, 805, 806, 807,
    900, 901, 999,
  ].map(String),
);

/** 文档里已删除但仍在旧数据里出现的 code 的兜底映射 */
const LEGACY_FALLBACK = {
  200: '302',
  201: '302',
  202: '303',
  203: '304',
  204: '305',
  205: '307',
  206: '308',
  207: '302',
  208: '302',
  209: '302',
  210: '304',
  211: '304',
  212: '303',
  213: '303',
  800: '999',
};

/** 天气现象文字兜底（API 正常都会返回 text，这里只给旧缓存/异常数据用） */
const CODE_TEXT = {
  100: '晴', 101: '多云', 102: '少云', 103: '晴间多云', 104: '阴',
  150: '晴', 151: '多云', 152: '少云', 153: '晴间多云',
  300: '阵雨', 301: '强阵雨', 302: '雷阵雨', 303: '强雷阵雨', 304: '雷阵雨伴有冰雹',
  305: '小雨', 306: '中雨', 307: '大雨', 308: '极端降雨', 309: '毛毛雨', 310: '暴雨',
  311: '大暴雨', 312: '特大暴雨', 313: '冻雨', 314: '小到中雨', 315: '中到大雨', 316: '大到暴雨',
  317: '暴雨到大暴雨', 318: '大暴雨到特大暴雨', 399: '雨',
  400: '小雪', 401: '中雪', 402: '大雪', 403: '暴雪', 404: '雨夹雪', 405: '雨雪天气',
  406: '阵雨夹雪', 407: '阵雪', 408: '小到中雪', 409: '中到大雪', 410: '大到暴雪', 499: '雪',
  500: '薄雾', 501: '雾', 502: '霾', 503: '扬沙', 504: '浮尘', 507: '沙尘暴', 508: '强沙尘暴',
  509: '浓雾', 510: '强浓雾', 511: '中度霾', 512: '重度霾', 513: '严重霾', 514: '大雾', 515: '特强浓雾',
  900: '热', 901: '冷', 999: '未知',
};

function normalizeCode(code, night) {
  let value = String(code ?? '').trim();
  if (!value) return '999';
  if (night && NIGHT_MAP[value]) value = NIGHT_MAP[value];
  if (KNOWN_CODES.has(value)) return value;
  if (LEGACY_FALLBACK[value]) return LEGACY_FALLBACK[value];
  // 300-399 雨、400-499 雪、500-599 雾霾沙尘，按大类兜底
  const bucket = value.slice(0, 1);
  if (bucket === '2') return '302';
  if (bucket === '3') return '399';
  if (bucket === '4') return '499';
  if (bucket === '5') return '502';
  return '999';
}

/** 天气图标 URL；scheme = 'dark' | 'light'，相对插件页面根路径 */
export function weatherIconUrl(code, { night = false, scheme = 'dark' } = {}) {
  const file = normalizeCode(code, night);
  return `icons/${scheme === 'light' ? 'light' : 'dark'}/${file}.svg`;
}

export function conditionText(code, text) {
  if (text) return text;
  return CODE_TEXT[String(code)] || '未知';
}

/** 逐时/逐日需要夜间图标的条件 */
export function hourlyIconUrl(code, { isNight, scheme }) {
  return weatherIconUrl(code, { night: Boolean(isNight), scheme });
}
