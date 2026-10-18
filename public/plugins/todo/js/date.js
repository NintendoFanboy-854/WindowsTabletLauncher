/** 日期/时间工具：全部按本地时区处理，存储统一用 ISO 字符串。 */

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/** ISO → Date；无效返回 null */
export function toDate(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string' && value.trim()) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return new Date(value);
  return null;
}

export function pad2(n) {
  return String(n).padStart(2, '0');
}

/** 'YYYY-MM-DD'（本地时区） */
export function dayKey(value) {
  const date = toDate(value);
  if (!date) return '';
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** 'YYYY-MM-DD' → 当天 00:00 的本地 Date */
export function parseDayKey(key) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key || ''));
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 0, 0, 0, 0);
}

export function startOfDay(value) {
  const date = toDate(value) || new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function endOfDay(value) {
  const date = toDate(value) || new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 0, 0);
}

export function addDays(value, days) {
  const date = toDate(value) || new Date();
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(value, months) {
  const date = toDate(value) || new Date();
  const day = date.getDate();
  const next = new Date(date);
  next.setDate(1);
  next.setMonth(next.getMonth() + months);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, lastDay));
  return next;
}

export function addYears(value, years) {
  const date = toDate(value) || new Date();
  const day = date.getDate();
  const next = new Date(date);
  next.setDate(1);
  next.setFullYear(next.getFullYear() + years);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, lastDay));
  return next;
}

/** 周一=1 … 周日=0（与 JS getDay 的周日=0 对齐） */
export function startOfWeek(value, weekStart = 1) {
  const date = startOfDay(value);
  const diff = (date.getDay() - weekStart + 7) % 7;
  return addDays(date, -diff);
}

export function startOfMonth(value) {
  const date = toDate(value) || new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

export function isSameDay(a, b) {
  const da = toDate(a);
  const db = toDate(b);
  if (!da || !db) return false;
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

/** 相差的自然日（b - a），带符号 */
export function diffDays(a, b) {
  const da = startOfDay(a);
  const db = startOfDay(b);
  return Math.round((db.getTime() - da.getTime()) / DAY);
}

export function dayIndex(value, weekStart = 1) {
  const date = toDate(value) || new Date();
  return (date.getDay() - weekStart + 7) % 7;
}

/** ISO → 'HH:mm' */
export function fmtTime(value) {
  const date = toDate(value);
  if (!date) return '';
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** 两个 datetime-local 值 → ISO（本地时区） */
export function fromLocalInput(value) {
  if (!value) return null;
  // datetime-local 的 `YYYY-MM-DDTHH:mm` 被所有现代浏览器按本地时区解析
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** ISO → datetime-local 输入框 value（本地时区） */
export function toLocalInput(value) {
  const date = toDate(value);
  if (!date) return '';
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** ISO → date input value */
export function toLocalDateInput(value) {
  return dayKey(value);
}

/** date input + time input → ISO；未给时间按 23:59（文档：只有日期时当天 23:59 视为到期） */
export function combineDateTime(dateValue, timeValue) {
  if (!dateValue) return null;
  const [year, month, day] = dateValue.split('-').map(Number);
  let hours = 23;
  let minutes = 59;
  if (timeValue) {
    const [h, m] = timeValue.split(':').map(Number);
    if (Number.isFinite(h) && Number.isFinite(m)) {
      hours = h;
      minutes = m;
    }
  }
  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
}

/** 相对今天的友好日期：今天 / 明天 / 昨天 / 9月12日 / 2027年1月1日 */
export function fmtDate(value, now = new Date()) {
  const date = toDate(value);
  if (!date) return '';
  const delta = diffDays(now, date);
  if (delta === 0) return '今天';
  if (delta === 1) return '明天';
  if (delta === 2) return '后天';
  if (delta === -1) return '昨天';
  if (date.getFullYear() === now.getFullYear()) return `${date.getMonth() + 1}月${date.getDate()}日`;
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

/** 截止时间展示：今天 18:00 / 明天 / 逾期 2 天 / 9月12日 */
export function fmtDue(value, now = new Date()) {
  const date = toDate(value);
  if (!date) return '';
  const dated = dayKey(date);
  const today = dayKey(now);
  const tomorrow = dayKey(addDays(now, 1));
  const hasTime = !(date.getHours() === 23 && date.getMinutes() === 59);
  if (dated < today) {
    const late = diffDays(date, now);
    return late <= 1 ? '已逾期' : `逾期 ${late} 天`;
  }
  if (dated === today) return hasTime ? `今天 ${fmtTime(date)}` : '今天';
  if (dated === tomorrow) return hasTime ? `明天 ${fmtTime(date)}` : '明天';
  const base = fmtDate(date, now);
  return hasTime ? `${base} ${fmtTime(date)}` : base;
}

/** 提醒时间展示 */
export function fmtRemind(value, now = new Date()) {
  const date = toDate(value);
  if (!date) return '';
  return `${fmtDate(date, now)} ${fmtTime(date)}`;
}

/** 周几短名 */
export const WEEKDAY_SHORT = ['日', '一', '二', '三', '四', '五', '六'];

/** 按 weekStart 排序后的周几标签 */
export function weekdayLabels(weekStart = 1) {
  return Array.from({ length: 7 }, (_, i) => WEEKDAY_SHORT[(weekStart + i) % 7]);
}

/** 解析用户/Agent 传入的日期：ISO、日期串（按当天 23:59 到期）、null（清空） */
export function parseDateInput(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    // 文档：dueAt 可只有日期，按当天 23:59 视为到期
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split('-').map(Number);
      return new Date(year, month - 1, day, 23, 59, 0, 0).toISOString();
    }
  }
  const date = toDate(value);
  return date ? date.toISOString() : null;
}

export const RECURRENCES = [
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
  { value: 'yearly', label: '每年' },
];

export function recurrenceLabel(value) {
  return RECURRENCES.find((item) => item.value === value)?.label || '';
}

/** 重复规则 → 下一次的时间（从 base 起算） */
export function nextOccurrence(base, recurrence) {
  const date = toDate(base) || new Date();
  switch (recurrence) {
    case 'daily':
      return addDays(date, 1);
    case 'weekly':
      return addDays(date, 7);
    case 'monthly':
      return addMonths(date, 1);
    case 'yearly':
      return addYears(date, 1);
    default:
      return null;
  }
}

export const PRIORITIES = [
  { value: 0, label: '无', short: '无', color: 'var(--colorNeutralForeground3)' },
  { value: 1, label: '低', short: '低', color: 'var(--colorPaletteBlueForeground2)' },
  { value: 2, label: '中', short: '中', color: 'var(--colorPaletteMarigoldForeground2)' },
  { value: 3, label: '高', short: '高', color: 'var(--colorPaletteRedForeground2)' },
];

export function priorityMeta(value) {
  return PRIORITIES.find((item) => item.value === value) || PRIORITIES[0];
}
