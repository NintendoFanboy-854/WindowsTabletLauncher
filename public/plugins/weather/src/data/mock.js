/**
 * 内置演示数据（没有 API Key 时用来开发/截图）。
 *
 * 数据形状与真实接口归一化后的 CacheData 一致，因此 UI 与 Agent 工具在 mock 下
 * 走的是同一条代码路径，只是不联网。URL 加 ?mock=1 或设置里打开「演示数据」即可。
 */

import { aqiTone, dateOnly } from './format.js';

export const MOCK_PLACES = [
  { id: '101010100', name: '北京', adm1: '北京市', adm2: '北京', lat: 39.92, lon: 116.41, country: '中国', tz: 'Asia/Shanghai' },
  { id: '101020100', name: '上海', adm1: '上海市', adm2: '上海', lat: 31.23, lon: 121.47, country: '中国', tz: 'Asia/Shanghai' },
  { id: '101210101', name: '杭州', adm1: '浙江省', adm2: '杭州', lat: 30.29, lon: 120.16, country: '中国', tz: 'Asia/Shanghai' },
  { id: '101280101', name: '广州', adm1: '广东省', adm2: '广州', lat: 23.13, lon: 113.26, country: '中国', tz: 'Asia/Shanghai' },
  { id: '101280601', name: '深圳', adm1: '广东省', adm2: '深圳', lat: 22.55, lon: 114.06, country: '中国', tz: 'Asia/Shanghai' },
  { id: '101270101', name: '成都', adm1: '四川省', adm2: '成都', lat: 30.67, lon: 104.07, country: '中国', tz: 'Asia/Shanghai' },
];

const BASE_TEMP = {
  101010100: 23,
  101020100: 25,
  101210101: 24,
  101280101: 29,
  101280601: 29,
  101270101: 20,
};

function hashString(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** 可复现的伪随机数（同一城市同一天相同） */
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function isoLocal(date) {
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

function localDateString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const DAY_CONDITIONS = [
  { code: '100', text: '晴' },
  { code: '101', text: '多云' },
  { code: '103', text: '晴间多云' },
  { code: '102', text: '少云' },
  { code: '104', text: '阴' },
  { code: '305', text: '小雨' },
  { code: '300', text: '阵雨' },
  { code: '302', text: '雷阵雨' },
];

const NIGHT_CONDITIONS = [
  { code: '150', text: '晴' },
  { code: '151', text: '多云' },
  { code: '153', text: '晴间多云' },
  { code: '152', text: '少云' },
];

/** 根据城市返回 mock 的城市搜索结果，形状同 GeoAPI 归一化结果 */
export function mockGeoLookup(query) {
  const text = String(query || '').trim().toLowerCase();
  const list = MOCK_PLACES.filter((place) => {
    if (!text) return true;
    return (
      place.name.includes(text) ||
      text.includes(place.name.toLowerCase()) ||
      place.adm1.includes(text) ||
      `${place.lat},${place.lon}`.includes(text)
    );
  });
  return list.map((place) => ({ ...place }));
}

function mockWarnings(place) {
  if (place.id !== '101010100') return [];
  const now = Date.now();
  return [
    {
      id: 'mock-warning-wind',
      title: '北京市气象台发布大风蓝色预警信号',
      typeName: '大风',
      severity: 'minor',
      severityText: '一般',
      colorCode: 'blue',
      tone: 'info',
      startTime: isoLocal(new Date(now - 40 * 60000)),
      endTime: isoLocal(new Date(now + 12 * 3600000)),
      text: '预计未来 12 小时内北京大部分地区将出现 6 级左右偏北风，阵风可达 7 到 8 级，请注意防范。',
      guide: '1. 关好门窗，加固围板、棚架、广告牌等易被风吹动的搭建物。\n2. 行人尽量少骑自行车，刮风时不要在广告牌、临时搭建物下面逗留。\n3. 相关水域水上作业和过往船舶采取积极的应对措施。',
    },
    {
      id: 'mock-warning-heat',
      title: '北京市气象台发布高温黄色预警信号',
      typeName: '高温',
      severity: 'moderate',
      severityText: '较重',
      colorCode: 'yellow',
      tone: 'warning',
      startTime: isoLocal(new Date(now - 5 * 3600000)),
      endTime: isoLocal(new Date(now + 30 * 3600000)),
      text: '预计未来 3 天北京市最高气温将持续在 35℃ 以上，请注意防暑降温。',
      guide: '1. 尽量避免午后高温时段的户外活动。\n2. 注意补水，户外作业人员做好防晒措施。\n3. 注意防范用电高峰引发的火灾。',
    },
  ];
}

function mockAir(random) {
  const aqi = 42 + Math.round(random() * 70);
  const category = aqi <= 50 ? '优' : aqi <= 100 ? '良' : aqi <= 150 ? '轻度污染' : '中度污染';
  const pm2p5 = Math.round(aqi * 0.55);
  const pm10 = Math.round(aqi * 0.8);
  const no2 = 18 + Math.round(random() * 20);
  const so2 = 3 + Math.round(random() * 5);
  const co = 0.4;
  const o3 = 40 + Math.round(random() * 60);
  return {
    aqi,
    aqiDisplay: String(aqi),
    level: aqi <= 50 ? '1' : aqi <= 100 ? '2' : aqi <= 150 ? '3' : '4',
    category,
    tone: aqiTone(aqi),
    primary: 'PM2.5',
    pollutants: {
      pm2p5: { value: pm2p5, unit: 'μg/m³', name: 'PM2.5' },
      pm10: { value: pm10, unit: 'μg/m³', name: 'PM10' },
      no2: { value: no2, unit: 'μg/m³', name: 'NO₂' },
      so2: { value: so2, unit: 'μg/m³', name: 'SO₂' },
      co: { value: co, unit: 'mg/m³', name: 'CO' },
      o3: { value: o3, unit: 'μg/m³', name: 'O₃' },
    },
    pm2p5,
    pm10,
    no2,
    so2,
    co,
    o3,
    health: {
      effect: aqi <= 100 ? '空气质量可接受，极少数敏感人群应减少户外活动。' : '易感人群症状有轻度加剧，健康人群出现刺激症状。',
      general: '可以正常进行户外活动。',
      sensitive: aqi <= 100 ? '极少数异常敏感人群应减少户外活动。' : '儿童、老年人及心脏病、呼吸系统疾病患者应减少长时间、高强度的户外锻炼。',
    },
    indexes: [
      { code: 'cn-mee', name: 'AQI (中国)', aqi, aqiDisplay: String(aqi), level: aqi <= 50 ? '1' : aqi <= 100 ? '2' : '3', category, tone: aqiTone(aqi), primary: 'PM2.5' },
      { code: 'us-epa', name: 'AQI (US)', aqi: Math.round(aqi * 0.7), aqiDisplay: String(Math.round(aqi * 0.7)), level: aqi <= 50 ? '1' : '2', category: aqi <= 50 ? 'Good' : 'Moderate', tone: aqiTone(Math.round(aqi * 0.7)), primary: 'PM2.5' },
    ],
  };
}

function mockIndices(place) {
  const list = [
    { type: '1', name: '运动指数', level: '2', category: '较适宜', text: '天气较好，但早晚温差较大，推荐进行室内运动，若户外运动请注意保暖。' },
    { type: '2', name: '洗车指数', level: '2', category: '较适宜', text: '未来一天无雨，风力较小，适合擦洗汽车。' },
    { type: '3', name: '穿衣指数', level: '4', category: '较舒适', text: '建议着薄外套、开衫牛仔衫裤等服装，年老体弱者应适当添加衣物。' },
    { type: '5', name: '紫外线指数', level: '3', category: '中等', text: '属中等强度紫外线辐射天气，外出时建议涂擦 SPF 高于 15、PA+ 的防晒护肤品。' },
    { type: '7', name: '花粉过敏指数', level: '2', category: '不易发', text: '天气条件较不易诱发过敏，可放心外出。' },
    { type: '8', name: '舒适度指数', level: '2', category: '较舒适', text: '白天天气晴好，早晚会感觉偏凉，午后舒适。' },
    { type: '9', name: '感冒指数', level: '2', category: '较易发', text: '昼夜温差较大，较易发生感冒，请适当增减衣物。' },
    { type: '14', name: '晾晒指数', level: '2', category: '适宜', text: '天气不错，适宜晾晒衣物。' },
  ];
  return list.map((item) => ({ ...item, date: localDateString(new Date()) }));
}

function mockMinutely() {
  const now = new Date();
  const items = [];
  const start = Math.floor(now.getTime() / 300000) * 300000;
  for (let i = 0; i < 24; i++) {
    const time = new Date(start + i * 300000);
    const wave = Math.max(0, Math.sin(((i - 3) / 24) * Math.PI * 2) * 0.6 + Math.sin(i / 3) * 0.15);
    items.push({ time: isoLocal(time), precip: Number(wave.toFixed(2)), type: 'rain' });
  }
  return { summary: '预计 18 分钟后开始下小雨，降雨将持续约 40 分钟', items };
}

/** 生成一整套 mock 天气数据（形状 = 归一化后的缓存数据） */
export function mockWeatherData(place) {
  const random = seededRandom(hashString(`${place.id}:${localDateString(new Date())}`));
  const now = new Date();
  const base = BASE_TEMP[place.id] ?? 24;
  const dayIndex = Math.floor(random() * DAY_CONDITIONS.length);
  const currentCondition = DAY_CONDITIONS[dayIndex];
  const night = now.getHours() < 6 || now.getHours() >= 19;

  const current = {
    obsTime: isoLocal(now),
    temp: base + Math.round((random() - 0.5) * 3),
    feelsLike: base + 1 + Math.round((random() - 0.5) * 3),
    icon: night ? NIGHT_CONDITIONS[dayIndex % NIGHT_CONDITIONS.length].code : currentCondition.code,
    text: currentCondition.text,
    humidity: 42 + Math.round(random() * 40),
    windDir: random() > 0.5 ? '东南风' : '北风',
    windScale: 1 + Math.round(random() * 3),
    windSpeed: 2 + Math.round(random() * 4),
    precip: 0,
    pressure: 1002 + Math.round(random() * 15),
    vis: 9000 + Math.round(random() * 15000),
    cloud: 10 + Math.round(random() * 60),
    dew: 10 + Math.round(random() * 10),
    uvIndex: night ? 0 : 1 + Math.round(random() * 5),
  };

  const hourly = [];
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() + i * 3600000);
    const hour = time.getHours();
    const isNight = hour < 6 || hour >= 19;
    const condition = isNight
      ? NIGHT_CONDITIONS[(Math.floor(random() * NIGHT_CONDITIONS.length) + i) % NIGHT_CONDITIONS.length]
      : DAY_CONDITIONS[(i * 3 + Math.floor(random() * 3)) % DAY_CONDITIONS.length];
    const diurnal = Math.sin(((hour - 9) / 24) * Math.PI * 2) * 4;
    hourly.push({
      fxTime: isoLocal(time),
      temp: Math.round(base + diurnal + (random() - 0.5) * 2),
      icon: condition.code,
      text: condition.text,
      pop: Math.round(random() * 30),
      precip: 0,
      humidity: 40 + Math.round(random() * 45),
      windDir: current.windDir,
      windScale: current.windScale,
      windSpeed: current.windSpeed,
      pressure: current.pressure,
      uvIndex: isNight ? 0 : 1 + Math.round(random() * 6),
      isNight,
    });
  }

  const daily = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getTime() + i * 86400000);
    const condition = DAY_CONDITIONS[(dayIndex + i * 2) % DAY_CONDITIONS.length];
    const nightCondition = NIGHT_CONDITIONS[(dayIndex + i) % NIGHT_CONDITIONS.length];
    const max = base + 3 + Math.round(random() * 4);
    const min = base - 8 + Math.round(random() * 3);
    daily.push({
      fxDate: localDateString(date),
      icon: condition.code,
      text: condition.text,
      iconNight: nightCondition.code,
      textNight: nightCondition.text,
      tempMax: max,
      tempMin: min,
      sunrise: `${localDateString(date)}T05:${pad(20 + Math.round(random() * 15))}`,
      sunset: `${localDateString(date)}T18:${pad(10 + Math.round(random() * 20))}`,
      windDir: current.windDir,
      windScale: current.windScale,
      pop: Math.round(random() * 40),
      uvIndex: 2 + Math.round(random() * 5),
      humidity: 40 + Math.round(random() * 30),
      precip: 0,
      pressure: current.pressure,
    });
  }

  return {
    fetchedAt: Date.now(),
    current,
    hourly,
    daily,
    air: mockAir(seededRandom(hashString(`${place.id}:air`))),
    warnings: mockWarnings(place),
    indices: mockIndices(place),
    minutely: mockMinutely(),
  };
}

/** mock 模式下的 GeoAPI 反查（根据经纬度找最近城市） */
export function mockReverseLookup(lon, lat) {
  let best = null;
  let bestDistance = Infinity;
  for (const place of MOCK_PLACES) {
    const distance = (place.lon - Number(lon)) ** 2 + (place.lat - Number(lat)) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = place;
    }
  }
  return best ? { ...best } : null;
}

export function mockPlaceById(id) {
  return MOCK_PLACES.find((place) => place.id === id) || null;
}

export function getMockWeather(place) {
  const key = `${place.id}:${Math.floor(Date.now() / 300000)}`;
  if (!mockCache.has(key)) mockCache.set(key, mockWeatherData(place));
  return mockCache.get(key);
}

const mockCache = new Map();

export { dateOnly };
