/**
 * L2 子页：管理城市（同一浮层内 push，不是第二个 Dialog）。
 *
 * - 搜索 Input 40（和风 GeoAPI；mock 模式走内置城市）；
 * - 结果行 44：城市 14 + 行政区 12 fg3 +「添加」40；
 * - 已添加城市行 44：城市 14 + 当前 Badge +「设为当前」40 +「删除」40（行内确认）；
 * - 顶部「当前位置 · X」来自 D-16 的自动定位，可一键加入/切换；
 * - 添加 / 删除 / 设为当前后 pop 回 L1，卡片数据随配置变化刷新。
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Input,
  Spinner,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Delete20Regular, Location20Regular, Search20Regular } from '@fluentui/react-icons';
import { ActionButton, ListRow, useSubpageClose } from '../../../_shared/ui.jsx';
import { searchPlaces } from '../data/service.js';
import { placeMenuLabel } from '../data/store.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXL,
    minWidth: 0,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    minWidth: 0,
  },
  sectionHead: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    minWidth: 0,
  },
  hint: {
    color: tokens.colorNeutralForeground3,
  },
  error: {
    color: tokens.colorStatusDangerForeground1,
  },
  empty: {
    color: tokens.colorNeutralForeground3,
    paddingBlock: tokens.spacingVerticalS,
  },
  locatedSource: {
    color: tokens.colorNeutralForeground3,
  },
  rowActions: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
  },
  confirmText: {
    color: tokens.colorStatusDangerForeground1,
    whiteSpace: 'nowrap',
  },
});

const SOURCE_LABEL = {
  system: '系统定位',
  ip: '网络定位（ip.cn）',
  mock: '演示定位',
};

function sourceLabel(source) {
  return SOURCE_LABEL[source] || '定位结果';
}

export function ManageCities({
  settings,
  places,
  currentPlace,
  located,
  locatedSource,
  configured,
  onAdd,
  onRemove,
  onSelect,
}) {
  const styles = useStyles();
  const close = useSubpageClose();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const savedIds = useMemo(() => new Set(places.map((place) => place.id)), [places]);

  useEffect(() => {
    const text = query.trim();
    if (!text) {
      setResults([]);
      setError('');
      setSearching(false);
      return undefined;
    }
    let alive = true;
    setSearching(true);
    setError('');
    const timer = window.setTimeout(() => {
      searchPlaces(settings, text)
        .then((list) => {
          if (!alive) return;
          setResults(list.slice(0, 6));
        })
        .catch((searchError) => {
          if (!alive) return;
          setResults([]);
          setError(searchError?.message || '搜索失败，请稍后再试');
        })
        .finally(() => {
          if (alive) setSearching(false);
        });
    }, 300);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
    // 只在搜索条件变化时重跑；单位/显示项变化不触发搜索
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, settings.apiKey, settings.apiHost, settings.mock]);

  const finish = () => close?.();
  const addAndClose = (place) => {
    onAdd(place);
    finish();
  };
  const selectAndClose = (id) => {
    onSelect(id);
    finish();
  };
  const removeAndClose = (id) => {
    onRemove(id);
    finish();
  };

  const locatedInList = Boolean(located && savedIds.has(located.id));
  const locatedCurrent = Boolean(located && currentPlace && located.id === currentPlace.id);

  return (
    <div className={styles.root}>
      {located ? (
        <section className={styles.section} aria-label="当前位置">
          <div className={styles.sectionHead}>
            <Text size={400} weight="semibold">
              当前位置
            </Text>
            <Text size={200} className={styles.hint}>
              {sourceLabel(locatedSource)}
            </Text>
          </div>
          <ListRow
            leading={<Location20Regular />}
            title={`当前位置 · ${placeMenuLabel(located)}`}
            subtitle={located.adm1 || located.country || ''}
            trailing={
              locatedCurrent ? (
                <Badge appearance="tint" color="brand" size="medium">
                  当前
                </Badge>
              ) : (
                <ActionButton
                  onClick={() => (locatedInList ? selectAndClose(located.id) : addAndClose(located))}
                >
                  {locatedInList ? '设为当前' : '添加'}
                </ActionButton>
              )
            }
          />
        </section>
      ) : null}

      <section className={styles.section} aria-label="搜索城市">
        <div className={styles.sectionHead}>
          <Text size={400} weight="semibold">
            搜索城市
          </Text>
          {searching ? <Spinner size="tiny" /> : null}
        </div>
        <Input
          size="large"
          value={query}
          placeholder={configured ? '输入城市名，例如 杭州' : '配置 API Key 后才能搜索城市'}
          aria-label="搜索城市"
          disabled={!configured}
          contentBefore={<Search20Regular />}
          onChange={(_event, data) => setQuery(data.value)}
        />
        {!configured ? (
          <Text size={200} className={styles.hint}>
            当前没有和风天气 API Key：仍可切换或删除已保存的城市
          </Text>
        ) : (
          <Text size={200} className={styles.hint}>
            搜索使用和风 GeoAPI；添加后自动设为当前城市
          </Text>
        )}
        {error ? (
          <Text size={200} className={styles.error}>
            {error}
          </Text>
        ) : null}
        {query.trim() && !searching && !error && results.length === 0 ? (
          <Text size={300} className={styles.empty}>
            没有找到城市，换个写法试试
          </Text>
        ) : null}
        {results.map((place) => {
          const added = savedIds.has(place.id);
          return (
            <ListRow
              key={place.id}
              leading={<Location20Regular />}
              title={place.name}
              subtitle={[place.adm2, place.adm1, place.country].filter(Boolean).join(' · ')}
              trailing={
                added ? (
                  <Text size={200} className={styles.hint}>
                    已添加
                  </Text>
                ) : (
                  <ActionButton appearance="primary" onClick={() => addAndClose(place)}>
                    添加
                  </ActionButton>
                )
              }
            />
          );
        })}
      </section>

      <section className={styles.section} aria-label="已添加城市">
        <div className={styles.sectionHead}>
          <Text size={400} weight="semibold">
            已添加城市
          </Text>
          <Text size={200} className={styles.hint}>
            {places.length} 个
          </Text>
        </div>
        {places.length === 0 ? (
          <Text size={300} className={styles.empty}>
            还没有城市。搜索并添加一个，或使用上方「当前位置」
          </Text>
        ) : null}
        {places.map((place) => {
          const confirming = pendingDelete === place.id;
          return (
            <ListRow
              key={place.id}
              leading={<Location20Regular />}
              title={place.name}
              subtitle={placeMenuLabel(place)}
              trailing={
                confirming ? (
                  <span className={styles.rowActions}>
                    <Text size={200} className={styles.confirmText}>
                      删除这个城市？
                    </Text>
                    <ActionButton icon={<Delete20Regular />} onClick={() => removeAndClose(place.id)}>
                      删除
                    </ActionButton>
                    <ActionButton onClick={() => setPendingDelete(null)}>取消</ActionButton>
                  </span>
                ) : (
                  <span className={styles.rowActions}>
                    {place.isCurrent ? (
                      <Badge appearance="tint" color="brand" size="medium">
                        当前
                      </Badge>
                    ) : (
                      <ActionButton onClick={() => selectAndClose(place.id)}>设为当前</ActionButton>
                    )}
                    <ActionButton onClick={() => setPendingDelete(place.id)}>删除</ActionButton>
                  </span>
                )
              }
            />
          );
        })}
      </section>
    </div>
  );
}
