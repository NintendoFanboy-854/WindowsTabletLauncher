/**
 * 天气设置视图（宿主整窗 Fluent Dialog 加载 `?view=settings`）。
 *
 * 按 OVERLAY-REWRITE-SPEC 重排：单列 720 居中、section 间距 24、行式设置项行高 48、
 * Field 式输入 40、城市管理行 44；无页面标题/关闭按钮（宿主 Dialog 提供）。
 * 修改即时写入配置，卡片视图通过 storage 事件同步。
 */

import { useCallback, useState } from 'react';
import {
  Badge,
  Button,
  Input,
  MessageBar,
  MessageBarBody,
  Radio,
  RadioGroup,
  Spinner,
  Switch,
  Text,
  Tooltip,
  makeStyles,
  mergeClasses,
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

// 浮层内控件统一 40px：Fluent Input 的内层 input 默认 38px，显式撑到 40
const INPUT_SLOT = { style: { height: '40px', boxSizing: 'border-box' } };

const useStyles = makeStyles({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    color: tokens.colorNeutralForeground1,
  },
  scrollArea: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL} 0`,
    '@media (max-width: 700px)': {
      padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL} 0`,
    },
  },
  page: {
    width: '100%',
    maxWidth: '720px',
    margin: '0 auto',
    paddingBottom: tokens.spacingVerticalXXL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXL,
  },
  section: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM },
  sectionHeader: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXXS },
  hint: { color: tokens.colorNeutralForeground3 },
  rows: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM },
  rowItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalL,
    minHeight: '48px',
    width: '100%',
  },
  rowText: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXXS, minWidth: 0 },
  rowControl: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0 },
  fieldItem: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS },
  fullWidth: { width: '100%' },
  fields: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalL },
  placeList: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS },
  placeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: '44px',
    padding: `0 ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusXLarge,
    backgroundColor: tokens.colorNeutralBackground2,
    minWidth: 0,
  },
  placeName: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 },
  addRow: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS, minHeight: '40px' },
  grow: { flex: 1, minWidth: 0 },
  resultList: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS },
  resultRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: '44px',
    padding: `0 ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusXLarge,
    cursor: 'pointer',
    backgroundColor: tokens.colorNeutralBackground2,
    minWidth: 0,
    ':hover': { backgroundColor: tokens.colorNeutralBackground2Hover },
  },
  resultMeta: { color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap' },
  radioGroup: { display: 'flex', alignItems: 'center', minHeight: '40px' },
  radio40: { minHeight: '40px' },
  control40: { minHeight: '40px' },
});

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    Promise.resolve(promise).catch(() => fallback),
    new Promise((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

function ToggleRow({ label, description, checked, onChange }) {
  const styles = useStyles();
  return (
    <div className={styles.rowItem} data-setting-row>
      <div className={styles.rowText}>
        <Text size={300}>{label}</Text>
        <Text size={200} className={styles.hint}>
          {description}
        </Text>
      </div>
      <div className={styles.rowControl}>
        <Switch className={styles.control40} checked={checked} onChange={(_, detail) => onChange(detail.checked)} />
      </div>
    </div>
  );
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

  // 自动定位：保持既有逻辑不变（DECISIONS D-10）
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
      <div className={styles.scrollArea} data-overlay-scroll>
        <div className={styles.page} data-overlay-page>
          <section className={styles.section} aria-label="显示">
            <div className={styles.sectionHeader} data-section-header>
              <Text size={500} weight="semibold">
                显示
              </Text>
              <Text size={200} className={styles.hint}>
                卡片展示的内容与刷新频率
              </Text>
            </div>
            <div className={styles.rows}>
              <div className={styles.rowItem} data-setting-row>
                <div className={styles.rowText}>
                  <Text size={300}>温度单位</Text>
                  <Text size={200} className={styles.hint}>
                    卡片与详情统一使用
                  </Text>
                </div>
                <div className={styles.rowControl}>
                  <RadioGroup
                    className={styles.radioGroup}
                    layout="horizontal"
                    value={settings.unit}
                    onChange={(_, detail) => update({ unit: detail.value })}
                  >
                    <Radio className={styles.radio40} value="c" label="摄氏 °C" />
                    <Radio className={styles.radio40} value="f" label="华氏 °F" />
                  </RadioGroup>
                </div>
              </div>
              <div className={styles.rowItem} data-setting-row>
                <div className={styles.rowText}>
                  <Text size={300}>刷新间隔</Text>
                  <Text size={200} className={styles.hint}>
                    卡片可见时按此周期更新
                  </Text>
                </div>
                <div className={styles.rowControl}>
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
                </div>
              </div>
              <ToggleRow
                label="显示空气质量"
                description="4×2 显示 AQI 环，详情增加「空气」页"
                checked={settings.showAir}
                onChange={(checked) => update({ showAir: checked })}
              />
              <ToggleRow
                label="显示天气预警"
                description="有预警时卡片顶部显示预警条，详情默认打开预警页"
                checked={settings.showWarnings}
                onChange={(checked) => update({ showWarnings: checked })}
              />
              <ToggleRow
                label="显示分钟级降水"
                description="在详情里显示未来两小时的降水趋势"
                checked={settings.showMinutely}
                onChange={(checked) => update({ showMinutely: checked })}
              />
            </div>
          </section>

          <section className={styles.section} aria-label="行为">
            <div className={styles.sectionHeader} data-section-header>
              <Text size={500} weight="semibold">
                行为
              </Text>
            </div>
            <div className={styles.rows}>
              <ToggleRow
                label="自动定位"
                description="由系统定位确定当前位置，不自动切换城市"
                checked={settings.autoLocate}
                onChange={(checked) => update({ autoLocate: checked })}
              />
              <ToggleRow
                label="演示数据"
                description="不联网预览界面效果，不需要 Key"
                checked={settings.mock}
                onChange={(checked) => update({ mock: checked })}
              />
            </div>
          </section>

          <section className={styles.section} aria-label="天气数据">
            <div className={styles.sectionHeader} data-section-header>
              <Text size={500} weight="semibold">
                天气数据
              </Text>
              <Text size={200} className={styles.hint}>
                在和风天气控制台创建凭据，填入下面两项
              </Text>
            </div>
            <div className={styles.fields}>
              <div className={styles.fieldItem}>
                <Text size={300}>API Key</Text>
                <Input
                  type="password"
                  size="large"
                  className={styles.fullWidth}
                  value={settings.apiKey}
                  placeholder="粘贴 API Key"
                  input={INPUT_SLOT}
                  onChange={(_, detail) => update({ apiKey: detail.value })}
                />
                <Text size={200} className={styles.hint}>
                  在和风天气控制台创建凭据后粘贴到这里。
                </Text>
              </div>
              <div className={styles.fieldItem}>
                <Text size={300}>数据地址（API Host）</Text>
                <Input
                  size="large"
                  className={styles.fullWidth}
                  value={settings.apiHost}
                  placeholder="例如 abcd1234.qweatherapi.com"
                  input={INPUT_SLOT}
                  onChange={(_, detail) => update({ apiHost: detail.value })}
                />
                <Text size={200} className={styles.hint}>
                  在和风天气控制台 → 设置里复制你的专属 API Host。
                </Text>
              </div>
              <div className={styles.rowItem} data-setting-row>
                <div className={styles.rowText}>
                  <Text size={300}>使用系统定位</Text>
                  <Text size={200} className={styles.hint}>
                    由系统定位添加当前位置城市，不改变自动定位设置
                  </Text>
                  {locationError && (
                    <Text size={200} className={styles.hint}>
                      {locationError}
                    </Text>
                  )}
                </div>
                <div className={styles.rowControl}>
                  <Button
                    appearance="secondary"
                    size="large"
                    icon={<Location20Regular />}
                    onClick={locate}
                    disabled={locating}
                  >
                    {locating ? '定位中…' : '定位'}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section} aria-label="城市">
            <div className={styles.sectionHeader} data-section-header>
              <Text size={500} weight="semibold">
                城市
              </Text>
              <Text size={200} className={styles.hint}>
                当前城市显示在卡片上，可添加多个城市随时切换
              </Text>
            </div>
            <div className={styles.placeList}>
              {sorted.length === 0 && (
                <Text size={300} className={styles.hint}>
                  还没有城市，先搜索添加一个。
                </Text>
              )}
              {sorted.map((place) => (
                <div className={styles.placeRow} key={place.id} data-place-row>
                  <div className={styles.rowText}>
                    <Text size={300} className={styles.placeName}>
                      {placeMenuLabel(place)}
                    </Text>
                    <Text size={200} className={styles.hint}>
                      {place.adm1 || place.country || ''}
                    </Text>
                  </div>
                  {place.isCurrent ? (
                    <Badge appearance="filled" color="brand" size="medium">
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
                  <Tooltip content="删除城市" relationship="label">
                    <Button
                      appearance="subtle"
                      size="large"
                      icon={<Delete20Regular />}
                      aria-label={`删除 ${place.name}`}
                      onClick={() => setSettings((previous) => removePlaceFromSettings(previous, place.id))}
                    />
                  </Tooltip>
                </div>
              ))}
            </div>
            <div className={styles.addRow} data-add-row>
              <Input
                size="large"
                className={styles.grow}
                value={cityQuery}
                placeholder="搜索城市，例如 北京 / Tokyo"
                input={INPUT_SLOT}
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
              <div className={styles.addRow}>
                <Spinner size="tiny" />
                <Text size={200} className={styles.hint}>
                  正在搜索…
                </Text>
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
                      <Text size={300}>
                        {place.name} {place.adm1 && place.adm1 !== place.name ? place.adm1 : ''}
                      </Text>
                    </span>
                    <Text size={200} className={styles.resultMeta}>
                      添加
                    </Text>
                    <Add20Regular />
                  </div>
                ))}
              </div>
            )}
            {settings.mock && (
              <Text size={200} className={styles.hint}>
                演示模式只能搜索内置的示例城市。
              </Text>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
