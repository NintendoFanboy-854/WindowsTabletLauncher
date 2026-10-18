/** 天气设置（长按卡片 / 详情里的「设置」打开）。 */

import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Divider,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Radio,
  RadioGroup,
  Spinner,
  Switch,
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
import { placeMenuLabel, REFRESH_OPTIONS } from '../data/store.js';
import { searchPlaces, reverseLookup } from '../data/service.js';

const useStyles = makeStyles({
  surface: { maxWidth: '640px', width: '92vw' },
  content: { display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', maxHeight: '70vh', paddingRight: '4px' },
  section: { display: 'flex', flexDirection: 'column', gap: '8px' },
  sectionTitle: { fontSize: tokens.fontSizeBase400, fontWeight: tokens.fontWeightSemibold },
  hint: { fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3, lineHeight: 1.45 },
  row: { display: 'flex', alignItems: 'center', gap: '8px' },
  grow: { flex: 1, minWidth: 0 },
  placeList: { display: 'flex', flexDirection: 'column', gap: '4px' },
  placeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 8px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    minWidth: 0,
  },
  placeName: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 },
  resultList: { display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' },
  resultRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 8px',
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'pointer',
    backgroundColor: tokens.colorNeutralBackground2,
    minWidth: 0,
    ':hover': { backgroundColor: tokens.colorNeutralBackground2Hover },
  },
  resultMeta: { color: tokens.colorNeutralForeground3, fontSize: tokens.fontSizeBase100, whiteSpace: 'nowrap' },
  switchRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' },
  switchLabel: { display: 'flex', flexDirection: 'column', gap: '1px' },
  switchTitle: { fontSize: tokens.fontSizeBase300 },
  switchDesc: { fontSize: tokens.fontSizeBase100, color: tokens.colorNeutralForeground3 },
  buttons: { display: 'flex', gap: '8px' },
  growButtons: { flex: 1 },
});

export default function SettingsDialog({ open, settings, onOpenChange, onSave, onLocate, locating, locationError, mock }) {
  const styles = useStyles();
  const [draft, setDraft] = useState(settings);
  const [cityQuery, setCityQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (open) {
      setDraft(settings);
      setCityQuery('');
      setResults([]);
      setSearchError('');
    }
  }, [open, settings]);

  const patch = (changes) => setDraft((prev) => ({ ...prev, ...changes }));

  const places = draft.places || [];
  const currentId = places.find((place) => place.isCurrent)?.id;
  const sorted = useMemo(() => {
    if (!currentId) return places;
    return [...places].sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));
  }, [places, currentId]);

  const searchCity = async () => {
    const query = cityQuery.trim();
    if (!query || searching) return;
    setSearching(true);
    setSearchError('');
    try {
      const found = await searchPlaces(draft, query);
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
    const exists = places.some((item) => item.id === place.id);
    if (exists) {
      patch({ places: places.map((item) => ({ ...item, isCurrent: item.id === place.id })) });
    } else {
      patch({
        places: [...places.map((item) => ({ ...item, isCurrent: false })), { ...place, country: place.country || '中国', tz: place.tz || 'Asia/Shanghai', isCurrent: true }],
      });
    }
    setResults((prev) => prev.filter((item) => item.id !== place.id));
    setCityQuery('');
  };

  const removeCity = (id) => {
    const remaining = places.filter((item) => item.id !== id);
    if (remaining.length > 0 && !remaining.some((item) => item.isCurrent)) remaining[0] = { ...remaining[0], isCurrent: true };
    patch({ places: remaining });
  };

  const setCurrent = (id) => patch({ places: places.map((item) => ({ ...item, isCurrent: item.id === id })) });

  const save = () => {
    onSave({ ...draft, apiKey: draft.apiKey.trim(), apiHost: draft.apiHost.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(_, detail) => onOpenChange(detail.open)} modalType="modal">
      <DialogSurface className={styles.surface} aria-label="天气设置">
        <DialogBody>
          <DialogTitle>天气设置</DialogTitle>
          <DialogContent className={styles.content}>
            <div className={styles.section}>
              <span className={styles.sectionTitle}>和风天气 API</span>
              <Field
                label="API Key"
                hint="和风控制台创建。支持 API KEY 或 JWT Token（以 eyJ 开头时按 Bearer 发送）。"
              >
                <Input
                  type="password"
                  value={draft.apiKey}
                  placeholder="粘贴 API Key 或 JWT"
                  onChange={(_, detail) => patch({ apiKey: detail.value })}
                />
              </Field>
              <Field
                label="API Host（必填）"
                hint="控制台 → 设置里查看，形如 abcd1234.qweatherapi.com。旧的公共域名 devapi/api.qweather.com 已停用，不填会提示去控制台获取。"
              >
                <Input
                  value={draft.apiHost}
                  placeholder="abcd1234.qweatherapi.com"
                  onChange={(_, detail) => patch({ apiHost: detail.value })}
                />
              </Field>
              <div className={styles.row}>
                <Button
                  appearance="secondary"
                  size="small"
                  icon={<Location20Regular />}
                  onClick={onLocate}
                  disabled={locating}
                >
                  {locating ? '定位中…' : '使用系统定位'}
                </Button>
                {locating && <Spinner size="tiny" />}
                {locationError && <span className={styles.hint}>{locationError}</span>}
              </div>
            </div>

            <Divider />

            <div className={styles.section}>
              <span className={styles.sectionTitle}>城市</span>
              <div className={styles.placeList}>
                {sorted.length === 0 && <span className={styles.hint}>还没有城市，先搜索添加一个。</span>}
                {sorted.map((place) => (
                  <div className={styles.placeRow} key={place.id}>
                    <span className={styles.placeName}>{placeMenuLabel(place)}</span>
                    {place.isCurrent ? (
                      <Badge appearance="filled" color="brand" size="small">
                        当前
                      </Badge>
                    ) : (
                      <Button appearance="subtle" size="small" onClick={() => setCurrent(place.id)}>
                        设为当前
                      </Button>
                    )}
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<Delete20Regular />}
                      aria-label={`删除 ${place.name}`}
                      onClick={() => removeCity(place.id)}
                    />
                  </div>
                ))}
              </div>
              <div className={styles.row}>
                <Input
                  className={styles.grow}
                  value={cityQuery}
                  placeholder="搜索城市，例如 北京 / Tokyo"
                  onChange={(_, detail) => setCityQuery(detail.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') searchCity();
                  }}
                />
                <Button appearance="secondary" icon={<Search20Regular />} onClick={searchCity} disabled={searching}>
                  搜索
                </Button>
              </div>
              {searching && (
                <div className={styles.row}>
                  <Spinner size="tiny" />
                  <span className={styles.hint}>正在搜索…</span>
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
              {mock && <span className={styles.hint}>演示数据模式下搜索的是内置城市列表（北京/上海/杭州/广州/深圳/成都）。</span>}
            </div>

            <Divider />

            <div className={styles.section}>
              <span className={styles.sectionTitle}>显示</span>
              <Field label="温度单位">
                <RadioGroup
                  layout="horizontal"
                  value={draft.unit}
                  onChange={(_, detail) => patch({ unit: detail.value })}
                >
                  <Radio value="c" label="摄氏 °C" />
                  <Radio value="f" label="华氏 °F" />
                </RadioGroup>
              </Field>
              <Field label="刷新间隔">
                <RadioGroup
                  layout="horizontal"
                  value={String(draft.refreshMin)}
                  onChange={(_, detail) => patch({ refreshMin: Number(detail.value) })}
                >
                  {REFRESH_OPTIONS.map((minutes) => (
                    <Radio key={minutes} value={String(minutes)} label={`${minutes} 分钟`} />
                  ))}
                </RadioGroup>
              </Field>
              <div className={styles.switchRow}>
                <div className={styles.switchLabel}>
                  <span className={styles.switchTitle}>显示空气质量</span>
                  <span className={styles.switchDesc}>4×2 尺寸显示 AQI 环，详情增加「空气」页</span>
                </div>
                <Switch checked={draft.showAir} onChange={(_, detail) => patch({ showAir: detail.checked })} />
              </div>
              <div className={styles.switchRow}>
                <div className={styles.switchLabel}>
                  <span className={styles.switchTitle}>显示天气预警</span>
                  <span className={styles.switchDesc}>有预警时卡片顶部显示预警条，详情默认打开预警页</span>
                </div>
                <Switch checked={draft.showWarnings} onChange={(_, detail) => patch({ showWarnings: detail.checked })} />
              </div>
              <div className={styles.switchRow}>
                <div className={styles.switchLabel}>
                  <span className={styles.switchTitle}>显示分钟级降水</span>
                  <span className={styles.switchDesc}>需要和风分钟级降水接口权限</span>
                </div>
                <Switch checked={draft.showMinutely} onChange={(_, detail) => patch({ showMinutely: detail.checked })} />
              </div>
              <div className={styles.switchRow}>
                <div className={styles.switchLabel}>
                  <span className={styles.switchTitle}>自动定位</span>
                  <span className={styles.switchDesc}>启动时用系统定位确定「当前位置」，不会自动切换城市</span>
                </div>
                <Switch checked={draft.autoLocate} onChange={(_, detail) => patch({ autoLocate: detail.checked })} />
              </div>
              <div className={styles.switchRow}>
                <div className={styles.switchLabel}>
                  <span className={styles.switchTitle}>演示数据</span>
                  <span className={styles.switchDesc}>不联网、不需要 Key，使用内置数据预览界面（开发/截图用）</span>
                </div>
                <Switch checked={draft.mock} onChange={(_, detail) => patch({ mock: detail.checked })} />
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <div className={mergeClasses(styles.buttons, styles.growButtons)}>
              <Button appearance="secondary" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button appearance="primary" onClick={save}>
                保存
              </Button>
            </div>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
