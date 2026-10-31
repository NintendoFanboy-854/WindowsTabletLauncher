/**
 * Apple Music 大面板（`?view=detail`，宿主以 large 浮层加载）。
 *
 * 宿主已经给了 56px 标题栏和关闭按钮，这里不重复画标题栏。数据来自 CDP 数据层
 * （`library.js` 接管已经登录的官方网页），不是 SMTC；卡片仍走宿主的 SMTC（`player.js`），
 * 两边读的是同一个 Edge 页面，但只有一个 CDP 客户端（详情面板）。
 *
 * 富信息来自官方网页 DOM（选择器证据见 `library.js` 的 collectSnapshot 注释）：
 * 播放列表封面 / 副标题（策展或艺人行）/ 歌曲数（打开过才有），曲目的专辑、显示序号、
 * 时长、显式标记，正在播放的大封面（mediaSession，最大 1024）。
 *
 * L1（三块，≤3 个信息区块）：
 *   ① 正在播放：Artwork 240 + 状态行 + 曲名(24)/歌手(16)/专辑(14) + 时间 + HeroProgress
 *      + 上一曲/播放暂停/下一曲（44 触控）；没有正在播放时是同一区块里的空态（不摆假封面）；
 *   ② 播放列表：区块头「播放列表 + 共 N + 刷新(44)」，两列 ListRow（Artwork 48 + 名称 +
 *      副标题或「N 首」+ 行尾计数 + chevron），点行进 L2；
 *   ③ 底部窗口动作（固定页脚，不随内容滚动）：显示/隐藏播放器 + 关闭播放器。
 *
 * L2（同一浮层内的 Subpage，不是第二个 Dialog）：header 56（← 返回 + 播放列表名 + 「N 首」）+
 * 一行策展/描述 + 曲目行（序号或正在播放指示 + 标题 + 歌手 · 专辑 + 显式标记 + 时长），
 * 点行起播；返回时让 Edge 页面也回到列表页。
 *
 * 截断策略（长标题/长播放列表名统一口径）：一律单行尾部省略（`Text truncate wrap={false}` /
 * `ListRow` 内建），不做两行折行——行高恒定 44/48，列表不因文本长度跳动；完整名称的语义由
 * 行本身的可点区域与 `aria-label` 承担，不用原生 title（PLUGIN-CONTRACT §4.4.3）。
 *
 * 状态：连接中 / 登录 / 未运行 / 错误 / 无播放列表，全部用共享原语与 Fluent token，
 * 不摆假数据、不自造颜色字号圆角阴影。滚动条颜色随主题（根节点 `colorScheme`）并显式
 * 取 `colorNeutralStroke1`，深色下不再出现刺眼的白条。
 */

import { useMemo } from 'react';
import {
  Badge,
  MessageBar,
  MessageBarBody,
  Spinner,
  Text,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowClockwise20Regular,
  Dismiss20Regular,
  ErrorCircle24Regular,
  Eye20Regular,
  EyeOff20Regular,
  Key24Regular,
  MusicNote224Regular,
  Next20Regular,
  Open20Regular,
  Pause20Regular,
  Play20Regular,
  Previous20Regular,
  Speaker220Filled,
} from '@fluentui/react-icons';

import { TABULAR_NUMS } from '../../_shared/typography.js';
import {
  ARTWORK_SIZE,
  Artwork,
  CardDisclosure,
  DetailPage,
  DetailScroll,
  EmptyState,
  HeroProgress,
  ListRow,
  ListStack,
  StatusLine,
  Subpage,
  TouchButton,
  TrailingCount,
} from '../../_shared/ui.jsx';
import { formatTime, playbackProgress } from './player.js';
import { library, useLibrary } from './library.js';

/** 深色下滚动条取中性描边色，轨道透明：与 Fluent surface 同族，不再出现系统白条。 */
const SCROLL_STYLE = { scrollbarColor: `${tokens.colorNeutralStroke1} transparent` };

/** 播放列表两列：1040 内容宽里每列 ≈500，比整行铺满更省滚动距离；列间距 24 让行尾计数
 *  （`25 首` + chevron）与右列封面明确分开，不读成同一行。 */
const PLAYLIST_GRID_STYLE = {
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  columnGap: tokens.spacingHorizontalXXL,
};

/** 归一化后比较两首歌（标题必须相等；歌手任一侧为空时只看标题）。 */
function sameTrack(left, right) {
  if (!left || !right) return false;
  const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const title = normalize(left.title);
  if (!title || title !== normalize(right.title)) return false;
  const leftArtist = normalize(left.artist);
  const rightArtist = normalize(right.artist);
  return !leftArtist || !rightArtist || leftArtist === rightArtist;
}

const useStyles = makeStyles({
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXL,
    minWidth: 0,
  },
  /** ① 正在播放：封面 + 元信息 + 传输（与卡片 4×2 同一套「封面左 / 文本中 / 控制右」结构，
   *  160 封面比 240 少占 80 高，首屏能多出约两行播放列表——面板首先是资料库） */
  hero: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXXL,
    minWidth: 0,
  },
  heroMeta: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    minWidth: 0,
  },
  title: {
    color: tokens.colorNeutralForeground1,
  },
  artist: {
    color: tokens.colorNeutralForeground2,
  },
  album: {
    color: tokens.colorNeutralForeground3,
  },
  progress: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
    paddingTop: tokens.spacingVerticalS,
  },
  timeRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground3,
  },
  /** 时间/计数/序号：tabular 等宽，进度与列表数字不抖 */
  numeric: {
    ...TABULAR_NUMS,
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  transport: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    paddingTop: tokens.spacingVerticalXS,
  },
  /** ② 播放列表 */
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    minWidth: 0,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  sectionActions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  /** 曲目行的序号/播放指示槽：24 宽，保证标题左缘逐行对齐（同 CardIdentity 空占位槽做法） */
  trackLead: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: tokens.spacingHorizontalXXL,
    color: tokens.colorNeutralForeground3,
  },
  /** L2 顶部一行策展/描述（12px fg3，单行省略） */
  subpageMeta: {
    color: tokens.colorNeutralForeground3,
  },
  subpageBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    minWidth: 0,
  },
  /** ③ 底部窗口动作：固定页脚，不随内容滚动；右对齐（Fluent 浮层动作惯例） */
  footer: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalS,
    paddingTop: tokens.spacingVerticalL,
    boxSizing: 'border-box',
  },
  error: {
    maxWidth: '100%',
  },
  /** 连接中 / 登录 / 未运行 / 错误：单块居中，不做多栏骨架（避免假数据占位） */
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXXL,
    minHeight: '100%',
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  /** 面板根：`DetailPage` 只做骨架（没有 `...rest`），状态标记放在这一层，供验收脚本读 phase */
  root: {
    position: 'relative',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
  },
});

/** 错误只陈述事实（PLUGIN-CONTRACT §4.4.3），动作由按钮承担。 */
function ErrorBar({ message }) {
  const styles = useStyles();
  if (!message) return null;
  return (
    <MessageBar intent="error" className={styles.error} data-apple-music-error="true">
      <MessageBarBody>{message}</MessageBarBody>
    </MessageBar>
  );
}

/** 曲目行：序号 / 正在播放指示 + 标题 + 歌手 · 专辑 + 显式标记 + 时长。 */
function TrackRow({ track, playing, starting, onPlay }) {
  const styles = useStyles();
  const duration = track.durationMs ? formatTime(track.durationMs) : track.duration || '--:--';
  const subtitle = [track.artist, track.album].filter(Boolean).join(' · ');
  const lead = starting ? (
    <Spinner size="tiny" aria-label="正在起播" />
  ) : playing ? (
    <Speaker220Filled aria-label="正在播放" />
  ) : (
    <Text size={200} className={styles.numeric} data-apple-music-track-index="true">
      {track.position}
    </Text>
  );
  return (
    <ListRow
      title={track.title}
      subtitle={subtitle || undefined}
      leading={<span className={styles.trackLead}>{lead}</span>}
      trailing={
        <>
          {track.explicit ? (
            <Badge
              appearance="outline"
              color="subtle"
              size="small"
              aria-label="儿童不宜"
              data-apple-music-explicit="true"
            >
              E
            </Badge>
          ) : null}
          <Text size={200} className={styles.numeric} data-apple-music-track-duration="true">
            {duration}
          </Text>
        </>
      }
      selected={playing}
      onClick={() => onPlay(track.index)}
      data-apple-music-track-row="true"
      data-apple-music-track-playing={playing ? 'true' : 'false'}
    />
  );
}

export default function Detail() {
  const styles = useStyles();
  const state = useLibrary();
  const {
    phase,
    browser,
    playlists,
    tracks,
    activePlaylist,
    currentPlaylist,
    tracksLoading,
    nowPlaying,
    playingIndex,
    transportBusy,
    error,
  } = state;

  const playing = Boolean(nowPlaying) && nowPlaying.paused === false;
  const canTransport = Boolean(nowPlaying) && !transportBusy;
  const progressActive = playing && Boolean(nowPlaying?.durationMs);

  /** 与当前播放元数据匹配的曲目行（标题+歌手）；找不到就是 -1。 */
  const playingTrackIndex = useMemo(
    () => tracks.findIndex((track) => sameTrack(track, nowPlaying)),
    [tracks, nowPlaying],
  );

  /** L2 头部数量：优先当前播放列表页的页脚计数，退回已缓存的列表计数。 */
  const playlistSongCount =
    (currentPlaylist && currentPlaylist.songCount) ||
    (activePlaylist
      ? playlists.find((playlist) => playlist.href === activePlaylist.href)?.songCount || 0
      : 0);

  /** L2 顶部一行：策展行 + 描述（都是官方页面里的真实字段，缺一个就少一个）。 */
  const playlistMeta = [currentPlaylist?.curator, currentPlaylist?.description]
    .filter(Boolean)
    .join(' · ');

  const content = (() => {
    if (phase === 'connecting') {
      return (
        <div className={styles.placeholder} data-apple-music-connecting="true">
          <Spinner size="small" label="正在连接播放器" />
        </div>
      );
    }

    if (phase === 'login') {
      return (
        <div className={styles.placeholder} data-apple-music-login="true">
          <EmptyState
            icon={<Key24Regular />}
            title="需要登录"
            action={
              <TouchButton
                appearance="secondary"
                icon={<Open20Regular />}
                onClick={() => void library.showPlayer()}
              >
                显示播放器
              </TouchButton>
            }
          />
          <ErrorBar message={error} />
        </div>
      );
    }

    if (phase === 'error') {
      return (
        <div className={styles.placeholder} data-apple-music-error-state="true">
          <EmptyState
            icon={<ErrorCircle24Regular />}
            title="连接中断"
            action={
              <TouchButton
                appearance="secondary"
                icon={<ArrowClockwise20Regular />}
                onClick={() => void library.refresh()}
              >
                刷新
              </TouchButton>
            }
          />
          <ErrorBar message={error} />
        </div>
      );
    }

    if (!browser.running) {
      return (
        <div className={styles.placeholder} data-apple-music-empty="true">
          <EmptyState
            icon={<MusicNote224Regular />}
            title="播放器未打开"
            action={
              <TouchButton
                appearance="secondary"
                icon={<Open20Regular />}
                onClick={() => void library.openPlayer()}
              >
                打开播放器
              </TouchButton>
            }
          />
          <ErrorBar message={error} />
        </div>
      );
    }

    return (
      <div className={styles.content} data-content-band="true">
        {/* ① 正在播放 */}
        <section
          className={styles.hero}
          aria-label="正在播放"
          data-apple-music-detail-now="true"
          data-apple-music-playing={playing ? 'true' : 'false'}
        >
          {nowPlaying ? (
            <>
              <Artwork
                src={nowPlaying.artworkUrl || ''}
                alt={`${nowPlaying.title}封面`}
                size={ARTWORK_SIZE.M}
                data-apple-music-detail-artwork="true"
              />
              <div className={styles.heroMeta}>
                <StatusLine
                  tone={playing ? 'success' : 'neutral'}
                  data-apple-music-detail-state="true"
                >
                  {playing ? '正在播放' : '已暂停'}
                </StatusLine>
                <Text
                  size={600}
                  weight="semibold"
                  block
                  truncate
                  wrap={false}
                  className={styles.title}
                  data-apple-music-detail-title="true"
                >
                  {nowPlaying.title}
                </Text>
                <Text
                  size={400}
                  block
                  truncate
                  wrap={false}
                  className={styles.artist}
                  data-apple-music-detail-artist="true"
                >
                  {nowPlaying.artist || '未知歌手'}
                </Text>
                {nowPlaying.album ? (
                  <Text
                    size={300}
                    block
                    truncate
                    wrap={false}
                    className={styles.album}
                    data-apple-music-detail-album="true"
                  >
                    {nowPlaying.album}
                  </Text>
                ) : null}
                <div className={styles.progress} data-apple-music-progress="true">
                  <div className={styles.timeRow}>
                    <Text size={200} className={styles.numeric} data-apple-music-position="true">
                      {formatTime(nowPlaying.positionMs)}
                    </Text>
                    <Text size={200} className={styles.numeric} data-apple-music-duration="true">
                      {formatTime(nowPlaying.durationMs)}
                    </Text>
                  </div>
                  <HeroProgress
                    value={playbackProgress(nowPlaying)}
                    active={progressActive}
                    label="播放进度"
                  />
                </div>
              </div>
              <div className={styles.transport} data-apple-music-transport="true">
                <Tooltip content="上一曲" relationship="description">
                  <TouchButton
                    appearance="secondary"
                    icon={<Previous20Regular />}
                    aria-label="上一曲"
                    disabled={!canTransport}
                    onClick={() => void library.transport('previous')}
                    data-apple-music-previous="true"
                  />
                </Tooltip>
                <Tooltip content={playing ? '暂停' : '播放'} relationship="description">
                  <TouchButton
                    appearance="primary"
                    icon={playing ? <Pause20Regular /> : <Play20Regular />}
                    aria-label={playing ? '暂停' : '播放'}
                    disabled={!canTransport}
                    onClick={() => void library.transport('toggle')}
                    data-apple-music-toggle="true"
                  />
                </Tooltip>
                <Tooltip content="下一曲" relationship="description">
                  <TouchButton
                    appearance="secondary"
                    icon={<Next20Regular />}
                    aria-label="下一曲"
                    disabled={!canTransport}
                    onClick={() => void library.transport('next')}
                    data-apple-music-next="true"
                  />
                </Tooltip>
              </div>
            </>
          ) : (
            <EmptyState
              align="start"
              icon={<MusicNote224Regular />}
              title="未在播放"
              data-apple-music-hero-empty="true"
            />
          )}
        </section>

        {/* ② 播放列表：封面 48 + 名称 + 副标题/歌曲数 + chevron，两列 */}
        <section className={styles.section} aria-label="播放列表" data-apple-music-playlists="true">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <Text size={400} weight="semibold">
                播放列表
              </Text>
              {playlists.length > 0 ? (
                <span data-apple-music-playlist-count="true">
                  <TrailingCount total={playlists.length} />
                </span>
              ) : null}
            </div>
            <div className={styles.sectionActions}>
              <Tooltip content="刷新" relationship="description">
                <TouchButton
                  appearance="subtle"
                  icon={<ArrowClockwise20Regular />}
                  aria-label="刷新"
                  onClick={() => void library.refresh()}
                  data-apple-music-refresh="true"
                />
              </Tooltip>
            </div>
          </div>
          {playlists.length > 0 ? (
            <ListStack data-apple-music-playlist-list="true" style={PLAYLIST_GRID_STYLE}>
              {playlists.map((playlist) => (
                <ListRow
                  key={playlist.href}
                  leading={
                    <Artwork
                      src={playlist.artworkUrl}
                      alt={`${playlist.name}封面`}
                      size={ARTWORK_SIZE.XS}
                      data-apple-music-playlist-artwork="true"
                    />
                  }
                  title={playlist.name}
                  titleSize={400}
                  subtitle={
                    playlist.description ||
                    (playlist.songCount ? `${playlist.songCount} 首` : undefined)
                  }
                  trailing={
                    <>
                      {playlist.description && playlist.songCount ? (
                        <Text
                          size={200}
                          className={styles.numeric}
                          data-apple-music-playlist-songs="true"
                        >
                          {playlist.songCount} 首
                        </Text>
                      ) : null}
                      <CardDisclosure />
                    </>
                  }
                  onClick={() => void library.openPlaylist(playlist.href, playlist.name)}
                  data-apple-music-playlist-row="true"
                />
              ))}
            </ListStack>
          ) : (
            <EmptyState align="start" icon={<MusicNote224Regular />} title="没有播放列表" />
          )}
        </section>

        <ErrorBar message={error} />
      </div>
    );
  })();

  return (
    <DetailPage>
      <div className={styles.root} data-apple-music-detail="true" data-apple-music-phase={phase}>
        <DetailScroll style={SCROLL_STYLE}>{content}</DetailScroll>

        {/* ③ 底部窗口动作：固定页脚（不随内容滚动），未运行时不出现（空态里给「打开播放器」） */}
        {browser.running ? (
          <div className={styles.footer} data-apple-music-window-actions="true">
            <TouchButton
              appearance="secondary"
              icon={browser.visible ? <EyeOff20Regular /> : <Eye20Regular />}
              onClick={() => void (browser.visible ? library.hidePlayer() : library.showPlayer())}
              data-apple-music-window-toggle="true"
            >
              {browser.visible ? '隐藏播放器' : '显示播放器'}
            </TouchButton>
            <TouchButton
              appearance="secondary"
              icon={<Dismiss20Regular />}
              onClick={() => void library.closePlayer()}
              data-apple-music-window-close="true"
            >
              关闭播放器
            </TouchButton>
          </div>
        ) : null}

        {activePlaylist ? (
          <Subpage
            title={activePlaylist.name || '播放列表'}
            backLabel="返回"
            trailing={
              playlistSongCount ? (
                <Text size={200} className={styles.numeric} data-apple-music-playlist-songs="true">
                  {playlistSongCount} 首
                </Text>
              ) : null
            }
            onClosed={() => library.closePlaylist()}
          >
            <div className={styles.subpageBody} data-apple-music-track-pane="true">
              <ErrorBar message={error} />
              {playlistMeta ? (
                <Text
                  size={200}
                  block
                  truncate
                  wrap={false}
                  className={styles.subpageMeta}
                  data-apple-music-playlist-meta="true"
                >
                  {playlistMeta}
                </Text>
              ) : null}
              {tracksLoading ? (
                <div className={styles.placeholder} data-apple-music-tracks-loading="true">
                  <Spinner size="small" label="正在加载曲目" />
                </div>
              ) : tracks.length > 0 ? (
                <ListStack data-apple-music-track-list="true">
                  {tracks.map((track) => (
                    <TrackRow
                      key={`${track.index}:${track.title}`}
                      track={track}
                      playing={track.index === playingTrackIndex}
                      starting={playingIndex === track.index}
                      onPlay={(index) => void library.playTrack(index)}
                    />
                  ))}
                </ListStack>
              ) : (
                <EmptyState icon={<MusicNote224Regular />} title="没有曲目" />
              )}
            </div>
          </Subpage>
        ) : null}
      </div>
    </DetailPage>
  );
}
