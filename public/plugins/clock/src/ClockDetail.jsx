/**
 * 时钟详情浮层（L1）与添加城市子页（L2）。
 *
 * L1（?view=detail）：
 * - header 56：当前时间 Display XL 48 + 日期 14 fg3，右侧「添加城市」「设置…」；
 * - 世界时钟列表：今天/明天/昨天、当地 24px 时间、时差、行内 ⋯ 删除（二次确认）；
 * - 日期信息：本周第 N 周 / 今年第 N 天 / 系统时区；
 * - 设置…只发 requestHostSettings()，关浮层再导航由宿主负责。
 *
 * L2：Subpage push「添加城市」；内置城市即时过滤，内置表外的城市走
 * Nominatim + timeapi.io 联网补（见 world.js），点「添加」提交并 pop；
 * 返回/取消不写数据。删除在 L1 行内二次确认，不弹第二个 Dialog。
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  MessageBar,
  MessageBarBody,
  Text,
  Tooltip,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import {
  Add20Regular,
  ArrowSync20Regular,
  Delete20Regular,
  Globe24Regular,
  MoreHorizontal20Regular,
  Search20Regular,
} from '@fluentui/react-icons';

import { requestHostSettings, useStoredConfig } from '../../_shared/host.js';
import { Collapse, FadeSlide } from '../../_shared/motion.js';
import {
  ActionButton,
  DetailHeader,
  DetailPage,
  DetailScroll,
  EmptyState,
  ListRow,
  Subpage,
  useNow,
  useSubpageClose,
} from '../../_shared/ui.jsx';
import { DISPLAY_WEIGHT, TABULAR_NUMS, displayXl } from '../../_shared/typography.js';
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  formatDate,
  formatTime,
  normalizeSettings,
  readCalendarInfo,
} from './settings.js';
import {
  WORLD_LIMIT,
  describeWorldPlace,
  refreshWorldClocksFromApi,
  searchCitiesOnline,
  timeZoneCandidate,
  useWorldClocks,
} from './world.js';

const TICK_INTERVAL = 1000;

const useStyles = makeStyles({
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXL,
    minWidth: 0,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    minWidth: 0,
  },
  sectionHead: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
  },
  sectionTools: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  hint: {
    color: tokens.colorNeutralForeground3,
  },
  headerClock: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
  },
  numeric: {
    ...TABULAR_NUMS,
    whiteSpace: 'nowrap',
  },
  headerTime: {
    ...displayXl(48),
    fontWeight: DISPLAY_WEIGHT,
    color: tokens.colorNeutralForeground1,
  },
  headerDate: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  seconds: {
    color: tokens.colorNeutralForeground3,
  },
  meridiem: {
    color: tokens.colorNeutralForeground2,
  },
  worldList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  worldRow: {
    minHeight: '48px',
  },
  worldTrailing: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
  },
  worldTime: {
    ...TABULAR_NUMS,
    color: tokens.colorNeutralForeground1,
  },
  dayLabel: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  menuButton: {
    flexShrink: 0,
  },
  confirmRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
    paddingBlock: tokens.spacingVerticalS,
    paddingInline: tokens.spacingHorizontalS,
  },
  confirmActions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  danger: {
    color: tokens.colorStatusDangerForeground1,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: tokens.spacingHorizontalL,
    minWidth: 0,
  },
  infoCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  infoValue: {
    overflowWrap: 'anywhere',
  },
  addStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    minWidth: 0,
  },
  searchInput: {
    width: '100%',
  },
  cityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
});

/* ------------------------------------------------------------------ */
/* L1                                                                  */
/* ------------------------------------------------------------------ */

function InfoCell({ label, value, testId }) {
  const styles = useStyles();
  return (
    <div className={styles.infoCell} data-date-info={testId}>
      <Text size={200} className={styles.hint}>
        {label}
      </Text>
      <Text size={500} weight="semibold" className={styles.infoValue}>
        {value}
      </Text>
    </div>
  );
}

function WorldRow({
  info,
  settings,
  animate,
  confirming,
  onRequestConfirm,
  onCancelConfirm,
  onRemove,
}) {
  const styles = useStyles();
  const [leaving, setLeaving] = useState(false);

  const finishExit = (_, data) => {
    if (data?.direction !== 'exit') return;
    if (onRemove(info) === false) setLeaving(false);
  };

  const confirmRemove = () => {
    onCancelConfirm();
    setLeaving(true);
  };

  return (
    <div data-world-row={info.id} data-world-confirming={confirming ? 'true' : undefined}>
      <FadeSlide
        visible={!leaving}
        appear={animate}
        unmountOnExit
        onMotionFinish={finishExit}
      >
        <ListRow
          className={styles.worldRow}
          data-world-city={info.id}
          title={info.name}
          subtitle={
            <span data-world-tz={info.tz} data-world-offset={info.offsetLabel}>
              {info.tz} · {info.offsetLabel}
            </span>
          }
          trailing={
            <div className={styles.worldTrailing}>
              <Text
                data-world-time="true"
                size={600}
                weight="semibold"
                className={styles.worldTime}
              >
                {info.localTime}
              </Text>
              {settings.showSeconds ? (
                <Text data-world-seconds="true" size={200} className={styles.seconds}>
                  {info.localSeconds}
                </Text>
              ) : null}
              {info.meridiem ? (
                <Text size={200} className={styles.seconds}>
                  {info.meridiem}
                </Text>
              ) : null}
              {info.dayLabel ? (
                <Text size={200} className={styles.dayLabel}>
                  {info.dayLabel}
                </Text>
              ) : null}
              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <Tooltip content="城市操作" relationship="label">
                    <ActionButton
                      appearance="subtle"
                      className={styles.menuButton}
                      icon={<MoreHorizontal20Regular />}
                      aria-label={`${info.name} 的城市操作`}
                      data-world-menu="true"
                    />
                  </Tooltip>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem
                      icon={<Delete20Regular />}
                      onClick={onRequestConfirm}
                    >
                      删除城市
                    </MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            </div>
          }
        />
      </FadeSlide>
      <Collapse visible={confirming && !leaving} unmountOnExit>
        <div className={styles.confirmRow} role="group" aria-label={`删除 ${info.name}`}>
          <Text size={300}>删除 {info.name}？</Text>
          <div className={styles.confirmActions}>
            <ActionButton onClick={onCancelConfirm}>取消</ActionButton>
            <ActionButton
              appearance="secondary"
              icon={<Delete20Regular />}
              className={styles.danger}
              onClick={confirmRemove}
            >
              确认删除
            </ActionButton>
          </div>
        </div>
      </Collapse>
    </div>
  );
}

export default function ClockDetail() {
  const styles = useStyles();
  const now = useNow(TICK_INTERVAL);
  const [settings] = useStoredConfig(SETTINGS_KEY, DEFAULT_SETTINGS, normalizeSettings);
  const world = useWorldClocks();
  const [adding, setAdding] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [animateAdds, setAnimateAdds] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 首次进入 L1 时不要给已有行加入场动画；之后新挂载的行才淡入。
  useEffect(() => {
    setAnimateAdds(true);
  }, []);

  const dateNow = new Date(now);
  const time = formatTime(dateNow, settings);
  const date = formatDate(dateNow, settings);
  const calendar = readCalendarInfo(dateNow);
  const rows = useMemo(() => {
    const current = new Date(now);
    return world.places.map((place) => describeWorldPlace(place, current, settings));
  }, [now, settings, world.places]);

  const openAdd = () => setAdding(true);

  const forceRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await refreshWorldClocksFromApi();
    } catch {
      /* 解析失败保留原值 */
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <DetailPage>
      <DetailHeader
        trailing={
          <>
            <ActionButton appearance="primary" icon={<Add20Regular />} onClick={openAdd}>
              添加城市
            </ActionButton>
            <ActionButton onClick={requestHostSettings}>设置…</ActionButton>
          </>
        }
      >
        <div className={styles.headerClock}>
          <span data-detail-time="true" className={mergeClasses(styles.numeric, styles.headerTime)}>
            {time.main}
          </span>
          {settings.showSeconds ? (
            <Text data-detail-seconds="true" size={400} className={styles.seconds}>
              {time.seconds}
            </Text>
          ) : null}
          {settings.hour12 ? (
            <Text size={300} className={styles.meridiem}>
              {time.meridiem}
            </Text>
          ) : null}
        </div>
        <Text data-detail-date="true" size={300} className={styles.headerDate}>
          {date.inline}
        </Text>
      </DetailHeader>

      <DetailScroll>
        <div className={styles.stack}>
          <section className={styles.section} aria-label="世界时钟">
            <div className={styles.sectionHead}>
              <Text size={400} weight="semibold">
                世界时钟
              </Text>
              <div className={styles.sectionTools}>
                <Text size={200} className={styles.hint} data-world-limit={WORLD_LIMIT}>
                  最多 {WORLD_LIMIT} 个 · 已添加 {rows.length} 个
                </Text>
                <ActionButton
                  data-world-refresh="true"
                  icon={<ArrowSync20Regular />}
                  disabled={refreshing || rows.length === 0}
                  onClick={forceRefresh}
                >
                  {refreshing ? '刷新中…' : '刷新'}
                </ActionButton>              </div>
            </div>

            {rows.length === 0 ? (
              <EmptyState
                icon={<Globe24Regular />}
                title="还没有添加城市"
                description="添加城市后可以同时查看当地时间与时差"
                action={
                  <ActionButton appearance="primary" icon={<Add20Regular />} onClick={openAdd}>
                    添加城市
                  </ActionButton>
                }
              />
            ) : (
              <div className={styles.worldList} data-world-list="true">
                {rows.map((place) => (
                  <WorldRow
                    key={place.id}
                    info={place}
                    settings={settings}
                    animate={animateAdds}
                    confirming={confirmingId === place.id}
                    onRequestConfirm={() => setConfirmingId(place.id)}
                    onCancelConfirm={() => setConfirmingId(null)}
                    onRemove={(target) => {
                      setConfirmingId(null);
                      return world.remove(target.id).ok;
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          <section className={styles.section} aria-label="日期信息">
            <Text size={400} weight="semibold">
              日期信息
            </Text>
            <div className={styles.infoGrid}>
              <InfoCell label="本周" value={`第 ${calendar.weekNumber} 周`} testId="week" />
              <InfoCell label="今年" value={`第 ${calendar.dayOfYear} 天`} testId="day-of-year" />
              <InfoCell label="系统时区" value={calendar.timeZone} testId="time-zone" />
            </div>
          </section>
        </div>
      </DetailScroll>

      {adding ? (
        <Subpage
          title="添加城市"
          onClosed={() => setAdding(false)}
          trailing={<CancelAddButton />}
        >
          <AddCityContent existing={world.places} onAdd={world.add} />
        </Subpage>
      ) : null}
    </DetailPage>
  );
}

/* ------------------------------------------------------------------ */
/* L2                                                                  */
/* ------------------------------------------------------------------ */

function CancelAddButton() {
  const close = useSubpageClose();
  return <ActionButton onClick={() => close?.()}>取消</ActionButton>;
}

function AddCityContent({ existing, onAdd }) {
  const styles = useStyles();
  const close = useSubpageClose();
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // 搜索全部走 API（没有内置表）：输入停顿 400ms 再请求（Nominatim 限 ≤1 次/秒）；
  // 合法 IANA 时区名直接给候选，不当地名搜。
  useEffect(() => {
    const text = query.trim();
    const manual = timeZoneCandidate(text);
    if (manual) {
      setResults([manual]);
      setSearching(false);
      return undefined;
    }
    if (text.length < 2) {
      setResults([]);
      setSearching(false);
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        setResults(await searchCitiesOnline(text, { signal: controller.signal }));
      } catch (reason) {
        if (reason?.name !== 'AbortError') setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const existingIds = useMemo(() => new Set(existing.map((place) => place.id)), [existing]);
  const existingNames = useMemo(() => new Set(existing.map((place) => place.name)), [existing]);
  const isAdded = (city) => existingIds.has(city.id) || existingNames.has(city.name);
  const atLimit = existing.length >= WORLD_LIMIT;

  const handleAdd = (city) => {
    const result = onAdd(city);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
    close?.();
  };

  return (
    <div className={styles.addStack}>
      {atLimit ? (
        <MessageBar intent="warning">
          <MessageBarBody>
            已达上限 {WORLD_LIMIT} 个城市；删除一个后可以继续添加。
          </MessageBarBody>
        </MessageBar>
      ) : null}
      {error ? (
        <MessageBar intent="error">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      ) : null}

      <Input
        className={styles.searchInput}
        size="large"
        type="search"
        value={query}
        placeholder="搜索城市或 IANA 时区"
        aria-label="搜索城市"
        data-city-search="true"
        contentBefore={<Search20Regular />}
        onChange={(_event, data) => setQuery(data.value)}
      />
      <Text size={200} className={styles.hint}>
        已添加 {existing.length} / {WORLD_LIMIT} 个城市
        {searching ? ' · 搜索中…' : ''}
      </Text>

      {results.length === 0 ? (
        searching ? null : (
          <EmptyState
            icon={<Search20Regular />}
            title="没有找到城市"
            description="试试中文名、英文名或时区，例如“大阪”“Tokyo”“Asia/Tokyo”"
          />
        )
      ) : (
        <div className={styles.cityList} data-city-list="true">
          {results.map((city) => {
            const added = isAdded(city);
            const disabled = added || atLimit;
            return (
              <ListRow
                key={city.id}
                data-city-option={city.id}
                title={city.name}
                subtitle={[city.country, city.tz].filter(Boolean).join(' · ')}
                trailing={
                  <ActionButton
                    data-city-add={city.id}
                    aria-label={added ? `${city.name} 已添加` : `添加 ${city.name}`}
                    appearance="secondary"
                    disabled={disabled}
                    onClick={() => handleAdd(city)}
                  >
                    {added ? '已添加' : '添加'}
                  </ActionButton>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
