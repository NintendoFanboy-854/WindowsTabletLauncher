/**
 * 复盘页（B3）：昨日小结 / 本周 / 本月 / 工作量热力图。
 *
 * 数据来自各插件注册的 `*.stats` Agent 工具（经 A5 桥接层）。没有插件提供
 * 统计工具时显示空状态；单个插件失败只让它自己那一格显示错误，不影响其它插件。
 * 宽屏四栏卡片网格（DESIGN.md §8），窄屏自动降为单栏。
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Divider,
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
    gap: tokens.spacingHorizontalL,
    alignItems: 'stretch',
  },
  card: {
    display: 'grid',
    alignContent: 'start',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingHorizontalL,
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    minHeight: '160px',
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
  row: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
  },
  metricValue: {
    color: tokens.colorNeutralForeground1,
    fontVariantNumeric: 'tabular-nums',
  },
  muted: {
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
    alignItems: 'center',
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

function Metric({ label, value }: { label: string; value: string }) {
  const styles = useStyles();
  return (
    <span className={styles.row}>
      <Text size={200} className={styles.muted}>
        {label}
      </Text>
      <Text size={400} weight="semibold" className={styles.metricValue}>
        {value}
      </Text>
    </span>
  );
}

function ProviderRangeRow({ stat }: { stat: ProviderRangeStats }) {
  const styles = useStyles();
  const parts: { label: string; value: string }[] = [];
  if (typeof stat.completed === 'number') {
    parts.push({ label: '完成', value: `${stat.completed} ${completedUnit(stat.provider)}` });
  }
  if (typeof stat.created === 'number') {
    parts.push({ label: '新建', value: `${stat.created} 项` });
  }
  if (typeof stat.focusMinutes === 'number') {
    parts.push({ label: '专注', value: `${stat.focusMinutes} 分钟` });
  }
  if (typeof stat.streakDays === 'number') {
    parts.push({ label: '连续', value: `${stat.streakDays} 天` });
  }

  return (
    <div className={styles.row}>
      <Text weight="semibold">{stat.label}</Text>
      <Badge appearance="outline" size="small">
        {stat.tool}
      </Badge>
      {!stat.ok && <Text className={styles.errorText}>{stat.error ?? '统计失败'}</Text>}
      {stat.ok && parts.length === 0 && (
        <Text className={styles.muted} size={200}>
          未返回可聚合字段
        </Text>
      )}
      {parts.map((part) => (
        <Metric key={part.label} label={part.label} value={part.value} />
      ))}
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
      <Divider />
      {stats.length === 0 ? (
        <Text className={styles.muted} size={200}>
          没有可用的统计工具
        </Text>
      ) : (
        stats.map((stat) => <ProviderRangeRow key={`${stat.range}:${stat.tool}`} stat={stat} />)
      )}
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

  const providerStats = snapshot
    ? Array.from(new Set(snapshot.tools)).map((tool) => {
        const provider = tool.split('.')[0] || tool;
        return { provider, label: providerLabel(provider) };
      })
    : [];

  const hasStatsTools = (snapshot?.tools.length ?? 0) > 0;

  return (
    <PageScaffold
      title="复盘"
      subtitle="昨日小结、本周与本月进度、工作量热力图 —— 数据来自插件自己上报的统计"
      onBack={onBack}
      actions={
        <div className={styles.toolbar}>
          {sourceLabel && (
            <Badge appearance="tint" color="warning">
              {sourceLabel}
            </Badge>
          )}
          <Button appearance="secondary" onClick={refresh} disabled={loading}>
            刷新
          </Button>
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

      {!loading && !error && !hasStatsTools && (
        <EmptyState
          title="还没有可复盘的数据"
          description="复盘页汇总各插件的 `.stats` Agent 工具（例如 todo.stats、pomodoro.stats）。等插件注册统计工具并且挂载到桌面上，这里会自动出现昨日 / 本周 / 本月汇总与工作量热力图。"
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
              <Divider />
              {providerStats.map(({ provider, label }) => {
                const count = snapshot.yesterday[provider];
                return (
                  <div key={provider} className={styles.row}>
                    <Text weight="semibold">{label}</Text>
                    {typeof count === 'number' ? (
                      <Metric label="完成" value={`${count} ${completedUnit(provider)}`} />
                    ) : (
                      <Text size={200} className={styles.muted}>
                        该插件未提供按天数据（byDay）
                      </Text>
                    )}
                  </div>
                );
              })}
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
              <Divider />
              {snapshot.daily.length === 0 ? (
                <Text className={styles.muted} size={200}>
                  插件没有返回按天数据（byDay），热力图暂不可用。
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
            <Text size={200}>
              数据来自插件 stats 工具：{snapshot.tools.join(' · ')} · 更新于 {formatTime(snapshot.fetchedAt)}
            </Text>
            <Text size={200}>统计口径由各插件决定，宿主只做汇总</Text>
          </div>
        </>
      )}
    </PageScaffold>
  );
}
