/**
 * 设置 → 外观 → 壁纸。
 *
 * 三档模式互斥（自动 / 固定 / 本机）：同一时刻只渲染当前模式的那组控件，页面上不会
 * 同时摆着两组开关让人猜哪个生效。模式本身由 `shell/wallpaper.ts` 的 state 持有，
 * 本文件不存第二份。
 *
 * 视觉纪律（Apple HIG 启发的留白分组 + Fluent 2 token）：
 * - 颜色 / 间距 / 圆角 / 字号全部取自 `tokens.*`，尺寸由 spacing ramp 推算；
 * - 层级靠字阶与间距表达，不画分割线、不加解释性小字；
 * - 文案只出现在控件本身（「自动」「固定」「本机」「自动更新」「刷新」「选择图片」
 *   「说明文字」「移除」「隐藏说明条」）。
 *
 * 数据与动作全部来自 `shell/wallpaper.ts` / `shell/wallpaperUi.ts`：本文件只把点击
 * 翻译成 `pin` / `setAutoUpdate` / `useLocal` / `setLocalCaption` / `clearLocal` 调用。
 */

import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  Button,
  Input,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  Radio,
  RadioGroup,
  SkeletonItem,
  Spinner,
  Switch,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import { CheckmarkCircle20Filled } from '@fluentui/react-icons';

import { TOUCH_TARGET_CSS } from '../../design/metrics';
import { useWallpaper, type WallpaperEntry, type WallpaperMode } from '../../shell/wallpaper';
import { useWallpaperUi } from '../../shell/wallpaperUi';
import { SettingsGroup, SettingsRow } from './SettingsBlocks';

/**
 * `WallpaperMode` 的三个取值（shell/wallpaper.ts: `'auto' | 'pinned' | 'local'`）。
 * 集中成三个常量：比较口只有这一处，取值改了只动这里。
 */
const MODE_AUTO: WallpaperMode = 'auto';
const MODE_PINNED: WallpaperMode = 'pinned';
const MODE_LOCAL: WallpaperMode = 'local';

/** 历史缩略图上限 15 格（≈最近两周＋今天）：3–5 列时不超过两屏 */
const HISTORY_LIMIT = 15;

/**
 * 「刷新」的等待阈值：超过 1s 才出 Spinner（FLUENT2 §12「<1s 不显示任何加载动画」）。
 *
 * 这是**等待阈值，不是动效时长**，所以不进 `motionTokens`（同 `STOP_NOTICE_MS` 的写法）；
 * 刷新在局域网里常常几十毫秒就回来，按下即转圈会让人觉得界面在抽搐。
 */
const SPINNER_DELAY_MS = 1000;

/** 首屏骨架格数：铺满一行（5 列下限时不满一行也没关系，只表示「在取数」） */
const SKELETON_CELLS = 5;

const useStyles = makeStyles({
  /** 模式选择：三个 Radio 横排，每格点击行高抬到 44（Fluent 默认 32） */
  modes: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalL,
  },
  mode: {
    minHeight: TOUCH_TARGET_CSS,
  },
  /** 自动档：开关与刷新按钮同一行，按 spacingVerticalM 与后续行留白 */
  autoRow: {
    display: 'grid',
    gap: tokens.spacingVerticalM,
  },
  /** 历史缩略图网格：列宽下限 5×spacingHorizontalXXXL，容器变宽时均分 */
  grid: {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(calc(${tokens.spacingHorizontalXXXL} * 5), 1fr))`,
    gap: tokens.spacingHorizontalM,
  },
  /** 每格固定 16:9：缩略图未到时占位高度不变，网格不跳动 */
  thumb: {
    appearance: 'none',
    position: 'relative',
    padding: 0,
    border: 'none',
    margin: 0,
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
    aspectRatio: '16 / 9',
    backgroundColor: tokens.colorNeutralBackground3,
    cursor: 'pointer',
    outline: `${tokens.strokeWidthThick} solid transparent`,
    outlineOffset: tokens.strokeWidthThin,
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
    },
    /*
     * 自绘按钮必须有按压状态（HIG §6）：图片铺满按钮，底色看不见，所以反馈落在
     * **描边**上——hover 中性描边、按下品牌描边，全程不做 scale（触控目标不抖）。
     */
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorNeutralStroke1}`,
    },
    ':active': {
      backgroundColor: tokens.colorNeutralBackground1Pressed,
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorBrandStroke1}`,
    },
  },
  /** 选中态：品牌色外描边（走 outline，选中时图片本体尺寸不抖） */
  thumbSelected: {
    outline: `${tokens.strokeWidthThick} solid ${tokens.colorBrandStroke1}`,
  },
  /** 选中的形状编码（不只靠颜色）：右上角对勾，与描边同时存在 */
  thumbBadge: {
    position: 'absolute',
    top: tokens.spacingVerticalXS,
    right: tokens.spacingHorizontalXS,
    display: 'flex',
    borderRadius: tokens.borderRadiusCircular,
    color: tokens.colorBrandForeground1,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  /** 首次取数时的骨架格：与缩略图同比例，避免网格跳动 */
  thumbSkeleton: {
    aspectRatio: '16 / 9',
    borderRadius: tokens.borderRadiusMedium,
  },
  thumbImage: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  /** 本机档：动作 / 说明 / 预览纵向排列，行结构沿用设置页（标签左、控件右） */
  local: {
    display: 'grid',
    gap: tokens.spacingVerticalM,
  },
  localActions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  preview: {
    display: 'block',
    justifySelf: 'end',
    width: `calc(${tokens.spacingHorizontalXXXL} * 6)`,
    aspectRatio: '16 / 9',
    objectFit: 'cover',
    borderRadius: tokens.borderRadiusMedium,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  /** 说明文字输入框：命中区 44 = XXXL(32) + M(12)，宽度与页面下拉同口径 */
  caption: {
    minHeight: `calc(${tokens.spacingVerticalXXXL} + ${tokens.spacingVerticalM})`,
    minWidth: `calc(${tokens.spacingHorizontalXXXL} * 5)`,
  },
  filePicker: {
    display: 'none',
  },
});

export function WallpaperSettings() {
  const styles = useStyles();
  const {
    state,
    history,
    status,
    refresh,
    pin,
    setAutoUpdate,
    useLocal,
    setLocalCaption,
    clearLocal,
  } = useWallpaper();
  const { captionHidden, setCaptionHidden } = useWallpaperUi();

  const filePicker = useRef<HTMLInputElement | null>(null);
  /** 受控 RadioGroup 的兜底重渲染：打开选择器后模式没变，得让 DOM 回到真实模式 */
  const [, rerender] = useReducer((tick: number) => tick + 1, 0);
  /** 上一次已提交的说明文字：Enter 提交后紧跟的 blur 不再重复写一次 */
  const submittedCaption = useRef<string | null>(null);
  /** 「刷新」自身的一次性 loading 态：直接读控制器状态，不另存一份 */
  const refreshing = status === 'loading';
  /**
   * 加载动画延迟出现：`refreshing` 立刻为真（按钮要禁用），但 Spinner 要等 1s。
   * 阈值是「等太久才给反馈」的分档，不是动效（FLUENT2 §12）。
   */
  const [showSpinner, setShowSpinner] = useState(false);
  useEffect(() => {
    if (!refreshing) {
      setShowSpinner(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setShowSpinner(true), SPINNER_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [refreshing]);

  /** 历史由 wallpaper.ts 按日期倒序给出；这里只兜住数量上限 */
  const entries = useMemo(() => history.slice(0, HISTORY_LIMIT), [history]);

  const onModeChange = (value: string) => {
    if (value === MODE_AUTO) {
      // 回到自动 = 取消固定：pin(null) 由 wallpaper.ts 解释为「跟随每日壁纸」
      pin(null);
      return;
    }
    if (value === MODE_PINNED) {
      // 固定档要有具体一张图：固定当前这张，没有当前图就取最近一天
      pin(state.current ?? entries[0] ?? null);
      return;
    }
    // 本机档必须有一张本机图才算切成功（useLocal 需要 File），所以直接开选择器
    filePicker.current?.click();
    rerender();
  };

  const onPickLocal = (file: File | undefined) => {
    if (!file) return;
    // 已有说明文字时保留，避免重选图片丢掉已写好的说明
    void useLocal(file, state.local?.caption ?? '');
  };

  const commitCaption = (value: string) => {
    if (submittedCaption.current === value) return;
    submittedCaption.current = value;
    setLocalCaption(value);
  };

  const mode = state.mode;

  return (
    <SettingsGroup title="壁纸">
      <SettingsRow label="模式">
        <RadioGroup
          className={styles.modes}
          layout="horizontal"
          value={mode}
          aria-label="模式"
          onChange={(_event, data) => onModeChange(data.value)}
        >
          <Radio className={styles.mode} value={MODE_AUTO} label="自动" />
          <Radio className={styles.mode} value={MODE_PINNED} label="固定" />
          <Radio className={styles.mode} value={MODE_LOCAL} label="本机" />
        </RadioGroup>
      </SettingsRow>

      {/* 失败要说出来（HIG §3），正文只写事实，不给解释段落 */}
      {status === 'error' && (
        <MessageBar intent="warning">
          <MessageBarBody>壁纸更新失败</MessageBarBody>
          <MessageBarActions>
            <Button
              appearance="secondary"
              size="large"
              disabled={refreshing}
              onClick={() => void refresh()}
            >
              重试
            </Button>
          </MessageBarActions>
        </MessageBar>
      )}

      {mode === MODE_AUTO && (
        <div className={styles.autoRow}>
          <SettingsRow label="自动更新">
            <Switch
              checked={state.autoUpdate}
              aria-label="自动更新"
              onChange={(_event, data) => setAutoUpdate(data.checked)}
            />
            <Button
              appearance="secondary"
              size="large"
              disabled={refreshing}
              aria-busy={refreshing}
              icon={showSpinner ? <Spinner size="extra-tiny" /> : undefined}
              onClick={() => void refresh()}
            >
              刷新
            </Button>
          </SettingsRow>
        </div>
      )}

      {mode === MODE_PINNED &&
        (entries.length > 0 ? (
          <div className={styles.grid}>
            {entries.map((entry: WallpaperEntry) => {
              const selected = state.current?.key === entry.key;
              return (
                <button
                  key={entry.key}
                  type="button"
                  aria-pressed={selected}
                  aria-label={entry.title}
                  className={mergeClasses(styles.thumb, selected && styles.thumbSelected)}
                  onClick={() => pin(entry)}
                >
                  <img
                    className={styles.thumbImage}
                    src={entry.thumbUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  {selected && (
                    <span className={styles.thumbBadge} aria-hidden="true">
                      <CheckmarkCircle20Filled />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : status === 'loading' ? (
          /* 首次取数：骨架铺满首行（HIG §11「先出内容再替换占位符」），不整页转圈 */
          <div className={styles.grid}>
            {Array.from({ length: SKELETON_CELLS }, (_unused, index) => (
              <SkeletonItem key={index} shape="rectangle" className={styles.thumbSkeleton} />
            ))}
          </div>
        ) : (
          /* 空态只给一个动作，不写说明段落（FLUENT2 §13） */
          <Button
            appearance="primary"
            size="large"
            disabled={refreshing}
            onClick={() => void refresh()}
          >
            刷新
          </Button>
        ))}

      {mode === MODE_LOCAL && (
        <div className={styles.local}>
          <div className={styles.localActions}>
            <Button
              appearance="secondary"
              size="large"
              onClick={() => filePicker.current?.click()}
            >
              选择图片
            </Button>
            <Button
              appearance="secondary"
              size="large"
              disabled={!state.local}
              onClick={() => clearLocal()}
            >
              移除
            </Button>
          </div>
          <SettingsRow label="说明文字">
            <Input
              className={styles.caption}
              aria-label="说明文字"
              key={state.local?.key ?? 'empty'}
              defaultValue={state.local?.caption ?? ''}
              onBlur={(event) => commitCaption(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commitCaption(event.currentTarget.value);
              }}
            />
          </SettingsRow>
          {state.local && <img className={styles.preview} src={state.local.url} alt="" />}
        </div>
      )}

      <input
        ref={filePicker}
        className={styles.filePicker}
        type="file"
        accept="image/*"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(event) => {
          onPickLocal(event.target.files?.[0]);
          // 清空 value：同一张图再选一次也要触发 change
          event.target.value = '';
        }}
      />

      <SettingsRow label="隐藏说明条">
        <Switch
          checked={captionHidden}
          aria-label="隐藏说明条"
          onChange={(_event, data) => setCaptionHidden(data.checked)}
        />
      </SettingsRow>
    </SettingsGroup>
  );
}
