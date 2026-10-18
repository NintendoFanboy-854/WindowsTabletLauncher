/**
 * 复盘页（B3 + F5 信息密度复核）：昨日小结 / 本周 / 本月 / 工作量热力图。
 *
 * 密度约定（docs/DENSITY.md §4/§5）：
 * - 一屏一个主任务：看复盘；页头只有一个主操作（Agent 复盘），刷新是次要操作；
 * - 每张卡片只有一个 Primary：主数值用 fontSizeBase500，单位/说明下沉到 base200 + foreground3；
 * - 分组靠留白，不用边框/分割线；空状态一句话，不写大段说明。
 *
 * 数据来自各插件注册的 `*.stats` Agent 工具（经 A5 桥接层）。没有插件提供
 * 统计工具时显示空状态；单个插件失败只影响它自己那一块。
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  MessageBar,
  MessageBarBody,
  Spinner,
  Text,
  Title3,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';

import { PageScaffold } from '../shared/PageScaffold';
import { EmptyState } from '../shared/EmptyState';
import { Heatmap } from './Heatmap';
import {
  completedUnit,
  formatTime,
  loadReviewSnapshot,
  providerLabel,
  type ProviderRangeStats,
  type ReviewBridge,
  type ReviewSnapshot,
} from './stats';

export interface ReviewPageProps {
  bridge: ReviewBridge;
  onBack: () => void;
  onOpenAgent?: () => void;
  /** 演示/调试时标注数据来源（例如 mock bridge） */
  sourceLabel?: string;
}

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: tokens.spacingHorizontalM,
    alignItems: 'stretch',
  },
  card: {
    display: 'grid',
    alignContent: 'start',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingHorizontalL,
    borderRadius: 'var(--wtsl-card-radius)',
    backgroundColor: tokens.colorNeutralBackground2,
    minHeight: '140px',
  },
  wideCard: {
    gridColumn: '1 / -1',
  },
  cardHead: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  cardHint: {
    color: tokens.colorNeutralForeground3,
  },
  providers: {
    display: 'grid',
    gap: tokens.spacingVerticalM,
  },
  providerBlock: {
    display: 'grid',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  providerLabel: {
    color: tokens.colorNeutralForeground2,
  },
  mainRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalXS,
    flexWrap: 'wrap',
  },
  mainValue: {
    color: tokens.colorNeutralForeground1,
    fontVariantNumeric: 'tabular-nums',
  },
  mainUnit: {
    color: tokens.colorNeutralForeground3,
  },
  tertiary: {
    color: tokens.colorNeutralForeground3,
  },
  errorText: {
    color: tokens.colorStatusDangerForeground1,
  },
  loading: {
    display: 'grid',
    placeItems: 'center',
    padding: tokens.spacingVerticalXXXL,
  },
  footer: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
    paddingTop: tokens.spacingVerticalM,
    color: tokens.colorNeutralForeground3,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
});

interface Metric {
  label: string;
  value: string;
}

function metricsOf(stat: ProviderRangeStats): Metric[] {
  const metrics: Metric[] = [];
  if (typeof stat.created === 'number') metrics.push({ label: '新建', value: `${stat.created} 项` });
  if (typeof stat.focusMinutes === 'number') {
    metrics.push({ label: '专注', value: `${stat.focusMinutes} 分钟` });
  }
  if (typeof stat.streakDays === 'number') {
    metrics.push({ label: '连续', value: `${stat.streakDays} 天` });
  }
  return metrics;
}

/** 一个插件在一个统计区间里的 Primary（主数值）+ 次要说明 */
function ProviderBlock({ stat }: { stat: ProviderRangeStats }) {
  const styles = useStyles();
  const metrics = metricsOf(stat);
  const hasCompleted = typeof stat.completed === 'number';

  return (
    <div className={styles.providerBlock}>
      <Text size={300} className={styles.providerLabel}>
        {stat.label}
      </Text>
      {!stat.ok ? (
        <Text size={200} className={styles.errorText}>
          {stat.error ?? '统计失败'}
        </Text>
      ) : (
        <>
          <div className={styles.mainRow}>
            <Text size={500} weight="semibold" className={styles.mainValue}>
              {hasCompleted ? stat.completed : '—'}
            </Text>
            {hasCompleted && (
              <Text size={200} className={styles.mainUnit}>
                {completedUnit(stat.provider)}
              </Text>
            )}
          </div>
          {metrics.length > 0 && (
            <Text size={200} className={styles.tertiary}>
              {metrics.map((metric) => `${metric.label} ${metric.value}`).join(' · ')}
            </Text>
          )}
        </>
      )}
    </div>
  );
}

function RangeCard({
  title,
  hint,
  stats,
}: {
  title: string;
  hint: string;
  stats: ProviderRangeStats[];
}) {
  const styles = useStyles();
  return (
    <section className={styles.card} aria-label={title}>
      <div className={styles.cardHead}>
        <Title3>{title}</Title3>
        <Text size={200} className={styles.cardHint}>
          {hint}
        </Text>
      </div>
      <div className={styles.providers}>
        {stats.length === 0 ? (
          <Text size={200} className={styles.tertiary}>
            没有可用的统计工具
          </Text>
        ) : (
          stats.map((stat) => <ProviderBlock key={`${stat.range}:${stat.tool}`} stat={stat} />)
        )}
      </div>
    </section>
  );
}

export function ReviewPage({ bridge, onBack, onOpenAgent, sourceLabel }: ReviewPageProps) {
  const styles = useStyles();
  const [snapshot, setSnapshot] = useState<ReviewSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError(null);
    loadReviewSnapshot(bridge, { signal: controller.signal })
      .then((next) => {
        if (active) setSnapshot(next);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason : new Error(String(reason)));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [bridge, reloadToken]);

  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  const providers = snapshot
    ? Array.from(new Set(snapshot.tools)).map((tool) => {
        const provider = tool.split('.')[0] || tool;
        return { provider, label: providerLabel(provider) };
      })
    : [];

  const yesterdayProviders = providers.filter(
    ({ provider }) => typeof snapshot?.yesterday[provider] === 'number',
  );
  const hasStatsTools = (snapshot?.tools.length ?? 0) > 0;
  // V-21：空态只保留空态里的「重新读取」一个入口，页头刷新在空态时隐藏
  const emptyState = !loading && !error && !hasStatsTools;

  return (
    <PageScaffold
      title="复盘"
      subtitle="昨日、本周、本月与工作量热力图"
      onBack={onBack}
      actions={
        <div className={styles.toolbar}>
          {sourceLabel && (
            <Badge appearance="tint" color="warning">
              {sourceLabel}
            </Badge>
          )}
          {!emptyState && (
            <Button appearance="secondary" onClick={refresh} disabled={loading}>
              刷新
            </Button>
          )}
          <Button appearance="primary" onClick={onOpenAgent} disabled={!onOpenAgent}>
            Agent 复盘
          </Button>
        </div>
      }
      maxContentWidth="1180px"
    >
      {loading && (
        <div className={styles.loading}>
          <Spinner label="正在向插件读取统计数据…" />
        </div>
      )}

      {!loading && error && (
        <MessageBar intent="error">
          <MessageBarBody>
            读取复盘数据失败：{error.message}
            <Button appearance="transparent" onClick={refresh}>
              重试
            </Button>
          </MessageBarBody>
        </MessageBar>
      )}

      {emptyState && (
        <EmptyState
          title="还没有可复盘的数据"
          description="插件提供 stats 工具后，这里会自动汇总。"
          action={
            <Button appearance="secondary" onClick={refresh}>
              重新读取
            </Button>
          }
        />
      )}

      {!loading && !error && hasStatsTools && snapshot && (
        <>
          <div className={styles.grid}>
            <section className={styles.card} aria-label="昨日小结">
              <div className={styles.cardHead}>
                <Title3>昨日小结</Title3>
                <Text size={200} className={styles.cardHint}>
                  按插件
                </Text>
              </div>
              <div className={styles.providers}>
                {yesterdayProviders.length === 0 ? (
                  <Text size={200} className={styles.tertiary}>
                    暂无按天数据
                  </Text>
                ) : (
                  yesterdayProviders.map(({ provider, label }) => (
                    <div key={provider} className={styles.providerBlock}>
                      <Text size={300} className={styles.providerLabel}>
                        {label}
                      </Text>
                      <div className={styles.mainRow}>
                        <Text size={500} weight="semibold" className={styles.mainValue}>
                          {snapshot.yesterday[provider]}
                        </Text>
                        <Text size={200} className={styles.mainUnit}>
                          {completedUnit(provider)}
                        </Text>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <RangeCard title="本周" hint="周一到现在" stats={snapshot.ranges.week} />
            <RangeCard title="本月" hint="本月 1 号到现在" stats={snapshot.ranges.month} />

            <section className={mergeClasses(styles.card, styles.wideCard)} aria-label="工作量热力图">
              <div className={styles.cardHead}>
                <Title3>工作量热力图</Title3>
                <Text size={200} className={styles.cardHint}>
                  近 16 周 · 共 {snapshot.heatmap.total} 条
                </Text>
              </div>
              {snapshot.daily.length === 0 ? (
                <Text size={200} className={styles.tertiary}>
                  插件没有返回按天数据（byDay）。
                </Text>
              ) : (
                <Heatmap
                  days={snapshot.heatmap.days}
                  max={snapshot.heatmap.max}
                  total={snapshot.heatmap.total}
                />
              )}
            </section>
          </div>

          <div className={styles.footer}>
            <Text size={200}>来源：{snapshot.tools.join(' · ')}</Text>
            <Text size={200}>更新于 {formatTime(snapshot.fetchedAt)} · 统计口径由插件决定</Text>
          </div>
        </>
      )}
    </PageScaffold>
  );
}
