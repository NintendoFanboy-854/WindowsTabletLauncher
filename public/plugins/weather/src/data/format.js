/** 格式化工具：时间、温度、风速等纯函数，不依赖 React。 */

export const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const pad2 = (n) => String(n).padStart(2, '0');

/** 解析和风返回的 ISO 时间（v7 与 v1 localTime=true 都带时区偏移） */
export function parseTime(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 逐时标签：10:00 */
export function hourLabel(value) {
  const date = parseTime(value);
  if (!date) return '--:--';
  return `${pad2(date.getHours())}:00`;
}

/** 日期标签：今天 / 明天 / 周X / M/D */
export function dayLabel(dateStr, index = -1) {
  const date = parseDateOnly(dateStr);
  if (!date) return dateStr || '--';
  const today = startOfToday();
  const diff = Math.round((startOfDay(date) - today) / 86400000);
  if (diff === 0 || index === 0) return '今天';
  if (diff === 1 || index === 1) return '明天';
  if (diff > 1 && diff < 7) return WEEKDAYS[date.getDay()];
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function monthDayLabel(dateStr) {
  const date = parseDateOnly(dateStr);
  return date ? `${date.getMonth() + 1}月${date.getDate()}日` : dateStr || '';
}

/** 7 天列表的星期：今天 / 明天 / 周X（14 号字） */
export function weekdayLabel(dateStr, index = -1) {
  const date = parseDateOnly(dateStr);
  if (!date) return dateStr || '--';
  const today = startOfToday();
  const diff = Math.round((startOfDay(date) - today) / 86400000);
  if (diff === 0 || index === 0) return '今天';
  if (diff === 1 || index === 1) return '明天';
  return WEEKDAYS[date.getDay()];
}

/** 7 天列表的日期：10/19（12 号字 fg3） */
export function shortDate(dateStr) {
  const date = parseDateOnly(dateStr);
  return date ? `${date.getMonth() + 1}/${date.getDate()}` : '';
}

/** v7 的 fxDate / v1 的 forecastStartTime 取本地日期部分 */
export function dateOnly(value) {
  if (!value) return '';
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  return match ? match[1] : value;
}

function parseDateOnly(dateStr) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr || '');
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function startOfToday() {
  return startOfDay(new Date());
}

/** 摄氏转显示温度；unit 为 'c' | 'f' */
export function convertTemp(celsius, unit) {
  if (celsius == null || Number.isNaN(Number(celsius))) return null;
  const value = Number(celsius);
  return unit === 'f' ? value * 1.8 + 32 : value;
}

export function fmtTemp(celsius, unit, options = {}) {
  const value = convertTemp(celsius, unit);
  if (value == null) return '--°';
  return `${Math.round(value)}°`;
}

export function fmtTempRange(min, max, unit) {
  return `${fmtTemp(min, unit)} / ${fmtTemp(max, unit)}`;
}

/** 逐时是否算夜间（19:00 - 06:00），有日出日落时用真实时间 */
export function isNightTime(value, sunrise, sunset) {
  const date = parseTime(value);
  if (!date) return false;
  if (sunrise && sunset) {
    const rise = parseTime(sunrise);
    const set = parseTime(sunset);
    if (rise && set) return date < rise || date >= set;
  }
  const hour = date.getHours();
  return hour < 6 || hour >= 19;
}

/** 更新于 X 分钟前 */
export function fmtUpdatedAgo(fetchedAt, now = Date.now()) {
  if (!fetchedAt) return '尚未更新';
  const minutes = Math.max(0, Math.round((now - fetchedAt) / 60000));
  if (minutes < 1) return '刚刚更新';
  if (minutes < 60) return `${minutes} 分钟前更新`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} 小时前更新`;
  return `${Math.round(hours / 24)} 天前更新`;
}

export function fetchedMinutesAgo(fetchedAt, now = Date.now()) {
  if (!fetchedAt) return null;
  return Math.max(0, Math.round((now - fetchedAt) / 60000));
}

export const WIND_COMPASS_ZH = {
  n: '北风',
  nne: '东北偏北风',
  ne: '东北风',
  ene: '东北偏东风',
  e: '东风',
  ese: '东南偏东风',
  se: '东南风',
  sse: '东南偏南风',
  s: '南风',
  ssw: '西南偏南风',
  sw: '西南风',
  wsw: '西南偏西风',
  w: '西风',
  wnw: '西北偏西风',
  nw: '西北风',
  nnw: '西北偏北风',
  none: '无持续风向',
  vrb: '风向不定',
};

export function windDirZh(compass) {
  if (!compass) return '';
  return WIND_COMPASS_ZH[String(compass).toLowerCase()] || String(compass);
}

export function fmtWind(dirZh, scale, speed) {
  const dir = dirZh || '';
  if (scale != null && scale !== '') return `${dir}${scale}级`;
  if (speed != null) return `${dir}${Math.round(speed * 3.6)}km/h`;
  return dir || '—';
}

export function fmtHumidity(percent) {
  if (percent == null || Number.isNaN(Number(percent))) return '—';
  return `${Math.round(Number(percent))}%`;
}

export function fmtPop(percent) {
  if (percent == null || Number.isNaN(Number(percent))) return '';
  return `降水 ${Math.round(Number(percent))}%`;
}

export function fmtVisibility(meters) {
  if (meters == null || Number.isNaN(Number(meters))) return '—';
  const value = Number(meters);
  return value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)} km` : `${Math.round(value)} m`;
}

export function fmtPressure(hpa) {
  if (hpa == null || Number.isNaN(Number(hpa))) return '—';
  return `${Math.round(Number(hpa))} hPa`;
}

export function fmtUv(uv) {
  if (uv == null || Number.isNaN(Number(uv))) return '—';
  return String(Math.round(Number(uv)));
}

export function fmtPrecip(mm) {
  if (mm == null || Number.isNaN(Number(mm))) return null;
  return Number(mm) > 0 ? `${Number(mm).toFixed(1)} mm` : null;
}

/** 风力等级描述 */
export const AQI_CATEGORY_ZH = {
  Excellent: '优',
  Good: '良',
  Fair: '良',
  Moderate: '良',
  'Unhealthy for Sensitive Groups': '轻度污染',
  'Lightly Polluted': '轻度污染',
  Unhealthy: '中度污染',
  Moderately: '中度污染',
  'Very Unhealthy': '重度污染',
  'Heavily Polluted': '重度污染',
  Hazardous: '严重污染',
  Severe: '严重污染',
};

export function aqiCategoryZh(category, level) {
  if (!category) return level ? `${level}级` : '—';
  return AQI_CATEGORY_ZH[category] || category;
}

export const SEVERITY_ZH = {
  unknown: '未知',
  minor: '一般',
  moderate: '较重',
  severe: '严重',
  extreme: '特别严重',
};

export const WARNING_COLOR_ZH = {
  white: '白色',
  gray: '灰色',
  green: '绿色',
  blue: '蓝色',
  yellow: '黄色',
  amber: '琥珀色',
  orange: '橙色',
  red: '红色',
  purple: '紫色',
  black: '黑色',
};

/** rgba 对象转 CSS 颜色 */
export function rgbaToCss(color) {
  if (!color) return null;
  if (typeof color === 'string') return color;
  const { red = 0, green = 0, blue = 0, alpha = 1 } = color;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

/** 根据 AQI 数值给一个 API 没返回颜色时的兜底色 */
export function aqiFallbackColor(aqi) {
  const value = Number(aqi);
  if (!Number.isFinite(value)) return null;
  if (value <= 50) return 'rgb(0, 228, 0)';
  if (value <= 100) return 'rgb(255, 255, 0)';
  if (value <= 150) return 'rgb(255, 126, 0)';
  if (value <= 200) return 'rgb(255, 0, 0)';
  if (value <= 300) return 'rgb(143, 63, 151)';
  return 'rgb(126, 0, 35)';
}

export const POLLUTANT_LABELS = {
  pm2p5: 'PM2.5',
  pm10: 'PM10',
  no2: 'NO₂',
  so2: 'SO₂',
  co: 'CO',
  o3: 'O₃',
  no: 'NO',
  nmhc: 'NMHC',
};

export const POLLUTANT_UNITS = {
  pm2p5: 'μg/m³',
  pm10: 'μg/m³',
  no2: 'μg/m³',
  so2: 'μg/m³',
  co: 'mg/m³',
  o3: 'μg/m³',
  no: 'μg/m³',
  nmhc: 'μg/m³',
};
