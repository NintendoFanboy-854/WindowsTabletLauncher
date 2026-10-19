/**
 * 天气设置视图（宿主整窗 Fluent Dialog 加载 `?view=settings`）。
 *
 * 不再用 iframe 内的 Dialog：整页排版，Fluent 控件统一 40px 高；
 * 改动即时写入配置（plugin.setConfig('settings')），卡片视图通过 storage 事件同步。
 * 关闭浮层用宿主 Dialog 的 Esc / 点空白处。
 */

import { useCallback, useState } from 'react';
import {
  Badge,
  Button,
  Divider,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Radio,
  RadioGroup,
  Spinner,
  Switch,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Add20Regular,
  Delete20Regular,
  Location20Regular,
  Search20Regular,
} from '@fluentui/react-icons';
import { plugin } from '/plugin-sdk.js';
import { useStoredConfig } from '../../../_shared/host.js';
import {
  DEFAULT_SETTINGS,
  REFRESH_OPTIONS,
  addPlaceToSettings,
  normalizeSettings,
  placeMenuLabel,
  removePlaceFromSettings,
} from '../data/store.js';
import { reverseLookup, searchPlaces } from '../data/service.js';
import { urlMockOverride } from '../utils.js';

const LOCATION_TIMEOUT_MS = 4000;

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXL}`,
    color: tokens.colorNeutralForeground1,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  page: {
    width: '100%',
    maxWidth: '760px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  header: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXXS },
  section: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS },
  row: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS, minHeight: '40px' },
  grow: { flex: 1, minWidth: 0 },
  hint: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    lineHeight: tokens.lineHeightBase200,
  },
  placeList: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS },
  placeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: '40px',
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    minWidth: 0,
  },
  placeName: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 },
  resultList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    maxHeight: '200px',
    overflowY: 'auto',
  },
  resultRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: '40px',
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'pointer',
    backgroundColor: tokens.colorNeutralBackground2,
    minWidth: 0,
    ':hover': { backgroundColor: tokens.colorNeutralBackground2Hover },
  },
  resultMeta: { color: tokens.colorNeutralForeground3, fontSize: tokens.fontSizeBase200, whiteSpace: 'nowrap' },
  radioGroup: { display: 'flex', alignItems: 'center', minHeight: '40px' },
  radio40: { minHeight: '40px' },
  control40: { minHeight: '40px' },
  switchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalL,
    minHeight: '40px',
  },
  switchLabel: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXXS, minWidth: 0 },
});

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    Promise.resolve(promise).catch(() => fallback),
    new Promise((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export default function SettingsView() {
  const styles = useStyles();
  const [storedSettings, setSettings] = useStoredConfig('settings', DEFAULT_SETTINGS, normalizeSettings);
  const forceMock = urlMockOverride();
  const settings = forceMock ? { ...storedSettings, mock: true } : storedSettings;
  const [cityQuery, setCityQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [results, setResults] = useState([]);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const update = useCallback(
    (patchOrUpdater) => {
      setSettings((previous) => {
        const patch = typeof patchOrUpdater === 'function' ? patchOrUpdater(previous) : patchOrUpdater;
        return normalizeSettings({ ...previous, ...patch });
      });
    },
    [setSettings],
  );

  const places = settings.places || [];
  const sorted = [...places].sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));

  const searchCity = async () => {
    const query = cityQuery.trim();
    if (!query || searching) return;
    setSearching(true);
    setSearchError('');
    try {
      const found = await searchPlaces(settings, query);
      setResults(found);
      if (found.length === 0) setSearchError(`没有找到“${query}”`);
    } catch (error) {
      setSearchError(error?.message || '搜索失败');
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addCity = (place) => {
    setSettings((previous) => addPlaceToSettings(previous, place));
    setResults((prev) => prev.filter((item) => item.id !== place.id));
    setCityQuery('');
  };

  const locate = async () => {
    if (locating) return;
    setLocating(true);
    setLocationError('');
    try {
      const location = await withTimeout(plugin.getLocation(), LOCATION_TIMEOUT_MS, null);
      if (!location || location.lat == null || location.lon == null) {
        setLocationError('系统定位不可用，请手动搜索城市');
        return;
      }
      const matched = await reverseLookup(settings, location.lat, location.lon);
      if (!matched) {
        setLocationError('没有找到定位对应的城市');
        return;
      }
      setSettings((previous) => addPlaceToSettings(previous, matched));
    } catch (error) {
      setLocationError(error?.message || '定位失败');
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className={styles.root} data-weather-settings>
      <div className={styles.page}>
        <header className={styles.header}>
          <Text size={600} weight="semibold">
            天气设置
          </Text>
          <Text className={styles.hint} size={200}>
            修改会立即生效并保存；按 Esc 或点浮层外部即可关闭。
          </Text>
        </header>

        <section className={styles.section} aria-label="天气数据源">
          <Text size={400} weight="semibold">
            天气数据
          </Text>
          <Field label="API Key" hint="在和风天气控制台创建凭据后粘贴到这里。">
            <Input
              type="password"
              size="large"
              value={settings.apiKey}
              placeholder="粘贴 API Key"
              onChange={(_, detail) => update({ apiKey: detail.value })}
            />
          </Field>
          <Field label="数据地址（API Host，必填）" hint="在和风天气控制台 → 设置里复制你的专属 API Host。">
            <Input
              size="large"
              value={settings.apiHost}
              placeholder="例如 abcd1234.qweatherapi.com"
              onChange={(_, detail) => update({ apiHost: detail.value })}
            />
          </Field>
          <div className={styles.row}>
            <Button appearance="secondary" size="large" icon={<Location20Regular />} onClick={locate} disabled={locating}>
              {locating ? '定位中…' : '使用系统定位'}
            </Button>
            {locating && <Spinner size="tiny" />}
            {locationError && <Text className={styles.hint}>{locationError}</Text>}
          </div>
        </section>

        <Divider />

        <section className={styles.section} aria-label="城市">
          <Text size={400} weight="semibold">
            城市
          </Text>
          <div className={styles.placeList}>
            {sorted.length === 0 && <Text className={styles.hint}>还没有城市，先搜索添加一个。</Text>}
            {sorted.map((place) => (
              <div className={styles.placeRow} key={place.id}>
                <span className={styles.placeName}>{placeMenuLabel(place)}</span>
                {place.isCurrent ? (
                  <Badge appearance="filled" color="brand" size="small">
                    当前
                  </Badge>
                ) : (
                  <Button
                    appearance="subtle"
                    size="large"
                    onClick={() =>
                      update({
                        places: places.map((item) => ({ ...item, isCurrent: item.id === place.id })),
                      })
                    }
                  >
                    设为当前
                  </Button>
                )}
                <Button
                  appearance="subtle"
                  size="large"
                  icon={<Delete20Regular />}
                  aria-label={`删除 ${place.name}`}
                  onClick={() => setSettings((previous) => removePlaceFromSettings(previous, place.id))}
                />
              </div>
            ))}
          </div>
          <div className={styles.row}>
            <Input
              size="large"
              className={styles.grow}
              value={cityQuery}
              placeholder="搜索城市，例如 北京 / Tokyo"
              onChange={(_, detail) => setCityQuery(detail.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') searchCity();
              }}
            />
            <Button appearance="secondary" size="large" icon={<Search20Regular />} onClick={searchCity} disabled={searching}>
              搜索
            </Button>
          </div>
          {searching && (
            <div className={styles.row}>
              <Spinner size="tiny" />
              <Text className={styles.hint}>正在搜索…</Text>
            </div>
          )}
          {searchError && (
            <MessageBar intent="warning">
              <MessageBarBody>{searchError}</MessageBarBody>
            </MessageBar>
          )}
          {results.length > 0 && (
            <div className={styles.resultList}>
              {results.map((place) => (
                <div
                  className={styles.resultRow}
                  key={place.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => addCity(place)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') addCity(place);
                  }}
                >
                  <Location20Regular />
                  <span className={styles.placeName}>
                    {place.name} {place.adm1 && place.adm1 !== place.name ? place.adm1 : ''}
                  </span>
                  <span className={styles.resultMeta}>添加</span>
                  <Add20Regular />
                </div>
              ))}
            </div>
          )}
          {settings.mock && <Text className={styles.hint}>演示模式只能搜索内置的示例城市。</Text>}
        </section>

        <Divider />

        <section className={styles.section} aria-label="显示">
          <Text size={400} weight="semibold">
            显示
          </Text>
          <Field label="温度单位">
            <RadioGroup
              className={styles.radioGroup}
              layout="horizontal"
              value={settings.unit}
              onChange={(_, detail) => update({ unit: detail.value })}
            >
              <Radio className={styles.radio40} value="c" label="摄氏 °C" />
              <Radio className={styles.radio40} value="f" label="华氏 °F" />
            </RadioGroup>
          </Field>
          <Field label="刷新间隔">
            <RadioGroup
              className={styles.radioGroup}
              layout="horizontal"
              value={String(settings.refreshMin)}
              onChange={(_, detail) => update({ refreshMin: Number(detail.value) })}
            >
              {REFRESH_OPTIONS.map((minutes) => (
                <Radio className={styles.radio40} key={minutes} value={String(minutes)} label={`${minutes} 分钟`} />
              ))}
            </RadioGroup>
          </Field>
          <div className={styles.switchRow}>
            <div className={styles.switchLabel}>
              <Text size={300}>显示空气质量</Text>
              <Text className={styles.hint}>4×2 尺寸显示 AQI 环，详情增加「空气」页</Text>
            </div>
            <Switch
              className={styles.control40}
              checked={settings.showAir}
              onChange={(_, detail) => update({ showAir: detail.checked })}
            />
          </div>
          <div className={styles.switchRow}>
            <div className={styles.switchLabel}>
              <Text size={300}>显示天气预警</Text>
              <Text className={styles.hint}>有预警时卡片顶部显示预警条，详情默认打开预警页</Text>
            </div>
            <Switch
              className={styles.control40}
              checked={settings.showWarnings}
              onChange={(_, detail) => update({ showWarnings: detail.checked })}
            />
          </div>
          <div className={styles.switchRow}>
            <div className={styles.switchLabel}>
              <Text size={300}>显示分钟级降水</Text>
              <Text className={styles.hint}>在详情里显示未来两小时的降水趋势</Text>
            </div>
            <Switch
              className={styles.control40}
              checked={settings.showMinutely}
              onChange={(_, detail) => update({ showMinutely: detail.checked })}
            />
          </div>
          <div className={styles.switchRow}>
            <div className={styles.switchLabel}>
              <Text size={300}>自动定位</Text>
              <Text className={styles.hint}>启动时用系统定位确定「当前位置」，不会自动切换城市</Text>
            </div>
            <Switch
              className={styles.control40}
              checked={settings.autoLocate}
              onChange={(_, detail) => update({ autoLocate: detail.checked })}
            />
          </div>
          <div className={styles.switchRow}>
            <div className={styles.switchLabel}>
              <Text size={300}>演示数据</Text>
              <Text className={styles.hint}>不联网预览界面效果，不需要 Key</Text>
            </div>
            <Switch
              className={styles.control40}
              checked={settings.mock}
              onChange={(_, detail) => update({ mock: detail.checked })}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

