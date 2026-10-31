/**
 * Apple Music 卡片（L0）。
 *
 * 字段按尺寸档递进（`defineSizeFields`，字号不随档位变）：
 * - 2×1：identity 行 + 曲名/歌手 + 播放/暂停（44）+ 进度带；
 * - 3×2：加 160 封面、专辑、播放状态行、上一曲/播放暂停/下一曲（44 一组）——只有曲名与
 *   进度带时整卡下半部是空的（实测单块空带 >22%，DENSITY §1.1-2），传输控制是同一张卡上
 *   最高频、单步、可逆的动作（PLUGIN-CONTRACT §3.4.3），用它把内容带补满；
 * - 4×2：封面升到 240、加时间行（时长/位置），传输与状态行同 3×2。
 * 主操作仍只有一个（播放/暂停 = 唯一 `primary`），上一曲/下一曲是 `secondary` 图标按钮，
 * 与 Agent 工具 `appleMusic.playback` 的 previous/next 对等。
 * 空态只有中性音符 +「未在播放」；3×2 / 4×2 给「打开播放器」（2×1 的信息预算
 * 规定 0 个主操作，点击整卡进详情，DENSITY §2）。paused / playing 都保留曲名与快捷播放键。
 * 点卡打开 large 详情。
 */

import { useCallback } from 'react';
import { Text, Tooltip, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import {
  MusicNote220Regular,
  MusicNote224Regular,
  Next20Regular,
  Open20Regular,
  Pause20Regular,
  Play20Regular,
  Previous20Regular,
} from '@fluentui/react-icons';
import { plugin } from '/plugin-sdk.js';

import { requestOverlay, useHostSize } from '../../_shared/host.js';
import { TABULAR_NUMS } from '../../_shared/typography.js';
import {
  ARTWORK_SIZE,
  ActionButton,
  Artwork,
  CardIdentity,
  CardRoot,
  EmptyState,
  HeroProgress,
  StatusLine,
  defineSizeFields,
  sizeKeyOf,
} from '../../_shared/ui.jsx';
import { formatTime, playbackProgress, useArtwork } from './player.js';

/** 尺寸档字段表：2×1 → 3×2 → 4×2 逐档增加字段（DENSITY §2.1-4）。 */
const CARD_FIELDS = defineSizeFields(
  {
    '2x1': {
      artwork: 0,
      album: false,
      progress: true,
      time: false,
      status: false,
      transport: false,
      emptyAction: false,
    },
    '3x2': {
      artwork: ARTWORK_SIZE.M,
      album: true,
      progress: true,
      time: false,
      status: true,
      transport: true,
      emptyAction: true,
    },
    '4x2': {
      artwork: ARTWORK_SIZE.L,
      album: true,
      progress: true,
      time: true,
      status: true,
      transport: true,
      emptyAction: true,
    },
  },
  { defaultSizeKey: '2x1' },
);

const useStyles = makeStyles({
  root: {
    cursor: 'pointer',
    userSelect: 'none',
  },
  body: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
    minWidth: 0,
    minHeight: 0,
  },
  bodyCompact: {
    gap: tokens.spacingHorizontalS,
  },
  info: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    minWidth: 0,
    justifyContent: 'center',
  },
  /** 曲目信息组（状态行 / 标题 / 歌手 / 专辑 / 进度），与底部传输行分开排 */
  infoMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    minWidth: 0,
  },
  trackRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  trackText: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  title: {
    color: tokens.colorNeutralForeground1,
  },
  secondary: {
    color: tokens.colorNeutralForeground2,
  },
  album: {
    color: tokens.colorNeutralForeground3,
  },
  progress: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    width: '100%',
    minWidth: 0,
  },
  timeRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground3,
  },
  time: {
    ...TABULAR_NUMS,
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  /** 2×1 之外：上一曲 / 播放暂停 / 下一曲（三个 44 触控，只有播放暂停是 primary） */
  transport: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  empty: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: 0,
    minHeight: 0,
  },
});

export default function Card({ player }) {
  const styles = useStyles();
  const sizeKey = useHostSize(sizeKeyOf, CARD_FIELDS.defaultSizeKey);
  const fields = CARD_FIELDS.fieldsFor(sizeKey);
  const { session } = player;
  // 2×1 不显示封面：不要为不可见的封面多打一次 mediaArtwork。
  const artwork = useArtwork(session, fields.artwork > 0);

  const openDetail = useCallback(() => {
    requestOverlay('detail', '音乐详情', { size: 'large' });
  }, []);

  /** 空态下一步：直接打开受管播放器窗口；失败只说事实（面板里由 player.error 承担） */
  const handleOpenPlayer = useCallback(async () => {
    const ok = await player.open();
    if (!ok) void plugin.notify?.('打不开播放器');
  }, [player]);

  const title = session?.title?.trim() || '未命名曲目';
  const artist = session?.artist?.trim() || '未知歌手';
  const album = session?.album?.trim() || '';
  const playing = Boolean(session?.playing);
  /** 窗口已在跑时「打开」是唤起：空态 CTA 的文案随状态改（与 Detail 一致） */
  const openPlayerLabel = player.browser.running ? '显示播放器' : '打开播放器';
  const toggleDisabled = !session || session.canPlayPause === false;
  /** 进度带只在真正播放时出画：暂停态不保留 brand 像素（PLUGIN-CONTRACT §4.4 HeroProgress） */
  const progressActive =
    playing && Boolean(session?.durationMs) && Number(session.durationMs) > 0;

  const handleToggle = useCallback(
    async (event) => {
      event.stopPropagation();
      if (!session || toggleDisabled) return;
      const ok = await player.command(session.id, playing ? 'pause' : 'play');
      if (!ok) void plugin.notify?.(playing ? '暂停失败' : '播放失败');
    },
    [player, playing, session, toggleDisabled],
  );

  /** 上一曲 / 下一曲：与详情、Agent 工具走同一个 `player.command`。 */
  const handleSkip = useCallback(
    async (event, direction) => {
      event.stopPropagation();
      if (!session) return;
      const ok = await player.command(session.id, direction);
      if (!ok) void plugin.notify?.(direction === 'next' ? '切歌失败' : '切歌失败');
    },
    [player, session],
  );

  const previousDisabled = !session || session.canPrevious === false;
  const nextDisabled = !session || session.canNext === false;

  const ariaLabel = session
    ? `${playing ? '正在播放' : '已暂停'} ${title}${artist ? `，${artist}` : ''}，点击查看播放详情`
    : '未在播放，点击查看播放详情';

  return (
    <CardRoot
      ariaLabel={ariaLabel}
      onActivate={openDetail}
      className={styles.root}
      data-apple-music-card="true"
      data-apple-music-size={sizeKey}
      data-apple-music-ready={player.ready ? 'true' : 'false'}
    >
      <CardIdentity icon={<MusicNote220Regular />} label="音乐" disclosure />
      {session ? (
        <div
          className={mergeClasses(styles.body, !fields.artwork && styles.bodyCompact)}
          data-apple-music-card-body="true"
        >
          {fields.artwork ? (
            <Artwork
              src={artwork}
              alt={`${title}封面`}
              size={fields.artwork}
              data-apple-music-card-artwork="true"
            />
          ) : null}
          <div className={styles.info}>
            <div className={styles.infoMain}>
              {fields.status ? (
              <StatusLine
                tone={playing ? 'success' : 'neutral'}
                data-apple-music-card-state="true"
              >
                {playing ? '正在播放' : '已暂停'}
              </StatusLine>
            ) : null}
            <div className={styles.trackRow}>
              <div className={styles.trackText}>
                <Text
                  size={400}
                  weight="semibold"
                  block
                  truncate
                  wrap={false}
                  className={styles.title}
                  data-apple-music-title="true"
                >
                  {title}
                </Text>
                <Text
                  size={200}
                  block
                  truncate
                  wrap={false}
                  className={styles.secondary}
                  data-apple-music-artist="true"
                >
                  {artist}
                </Text>
                {fields.album && album ? (
                  <Text
                    size={200}
                    block
                    truncate
                    wrap={false}
                    className={styles.album}
                    data-apple-music-album="true"
                  >
                    {album}
                  </Text>
                ) : null}
              </div>
              {/* 2×1：播放键跟在曲目行尾；3×2 / 4×2 挪进底部传输行，避免与整组按钮重复 */}
              {fields.transport ? null : (
                <Tooltip content={playing ? '暂停' : '播放'} relationship="description">
                  <ActionButton
                    appearance="primary"
                    icon={playing ? <Pause20Regular /> : <Play20Regular />}
                    aria-label={playing ? '暂停' : '播放'}
                    disabled={toggleDisabled}
                    onClick={handleToggle}
                    data-apple-music-toggle="true"
                  />
                </Tooltip>
              )}
            </div>
            {fields.progress ? (
              <div className={styles.progress} data-apple-music-card-progress="true">
                <HeroProgress
                  value={playbackProgress(session)}
                  active={progressActive}
                  label="播放进度"
                />
                {fields.time ? (
                  <div className={styles.timeRow}>
                    <Text size={200} className={styles.time}>
                      {formatTime(session.positionMs)}
                    </Text>
                    <Text size={200} className={styles.time}>
                      {formatTime(session.durationMs)}
                    </Text>
                  </div>
                ) : null}
              </div>
            ) : null}
            </div>
            {fields.transport ? (
              <div className={styles.transport} data-apple-music-card-transport="true">
                <Tooltip content="上一曲" relationship="description">
                  <ActionButton
                    appearance="secondary"
                    icon={<Previous20Regular />}
                    aria-label="上一曲"
                    disabled={previousDisabled}
                    onClick={(event) => void handleSkip(event, 'previous')}
                    data-apple-music-previous="true"
                  />
                </Tooltip>
                <Tooltip content={playing ? '暂停' : '播放'} relationship="description">
                  <ActionButton
                    appearance="primary"
                    icon={playing ? <Pause20Regular /> : <Play20Regular />}
                    aria-label={playing ? '暂停' : '播放'}
                    disabled={toggleDisabled}
                    onClick={handleToggle}
                    data-apple-music-toggle="true"
                  />
                </Tooltip>
                <Tooltip content="下一曲" relationship="description">
                  <ActionButton
                    appearance="secondary"
                    icon={<Next20Regular />}
                    aria-label="下一曲"
                    disabled={nextDisabled}
                    onClick={(event) => void handleSkip(event, 'next')}
                    data-apple-music-next="true"
                  />
                </Tooltip>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className={styles.empty} data-apple-music-card-empty="true">
          <EmptyState
            compact={sizeKey === '2x1'}
            align="start"
            icon={<MusicNote224Regular />}
            title="未在播放"
            action={
              fields.emptyAction ? (
                <ActionButton
                  appearance="secondary"
                  icon={<Open20Regular />}
                  onClick={handleOpenPlayer}
                >
                  {openPlayerLabel}
                </ActionButton>
              ) : undefined
            }
          />
        </div>
      )}
    </CardRoot>
  );
}
