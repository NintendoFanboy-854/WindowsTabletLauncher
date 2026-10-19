/**
 * 桌面层样式：全部走 Griffel（Fluent 的 makeStyles），颜色/间距/圆角/阴影用 token，
 * 过渡时长和曲线用 motionTokens，不写自定义时长。
 *
 * 材质：Fluent web 端没有 Acrylic token（DESIGN.md §6），卡片用
 * colorNeutralBackground* 的半透明混合 + 项目 token `--wtsl-material-blur`。
 * 圆角：项目 token `--wtsl-card-radius`（12px，修正 Fluent v9 borderRadiusXLarge=8px
 * 与 FLUENT2 §5 规范的偏差，见 AUDIT V-01/V-02）。
 */
import { makeStyles, tokens, motionTokens } from '@fluentui/react-components';

/** 卡片圆角：项目 token（12px），不再用 calc 自造数值 */
export const CARD_RADIUS = 'var(--wtsl-card-radius)';

const MATERIAL_BACKGROUND = `color-mix(in srgb, ${tokens.colorNeutralBackground2} 72%, transparent)`;

/** 卡片材质底色：Fluent 没有 Acrylic token，统一用 colorNeutralBackground2 半透明 + 模糊 */
export const CARD_MATERIAL = {
  backgroundColor: MATERIAL_BACKGROUND,
  backdropFilter: 'blur(var(--wtsl-material-blur))',
} as const;

export const useStyles = makeStyles({
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    touchAction: 'none',
    userSelect: 'none',
    color: tokens.colorNeutralForeground1,
  },
  pagesViewport: {
    position: 'absolute',
    inset: '0',
    overflow: 'hidden',
  },
  track: {
    display: 'flex',
    height: '100%',
    willChange: 'transform',
    transitionProperty: 'transform',
    transitionDuration: `${motionTokens.durationSlow}ms`,
    transitionTimingFunction: motionTokens.curveDecelerateMid,
  },
  trackDragging: {
    transitionDuration: '0ms',
  },
  /**
   * 编辑模式的桌面衬底压暗（MOTION §3「桌面衬底轻微压暗 200ms」）。
   * 不拦指针，绘制在卡片层下方：压暗壁纸但不影响卡片本身的材质与描边。
   */
  editBackdrop: {
    position: 'absolute',
    inset: '0',
    zIndex: 0,
    backgroundColor: tokens.colorBackgroundOverlay,
    opacity: 0,
    pointerEvents: 'none',
    transitionProperty: 'opacity',
    transitionDuration: `${motionTokens.durationFast}ms`,
    transitionTimingFunction: motionTokens.curveAccelerateMid,
  },
  editBackdropVisible: {
    opacity: 0.5,
    transitionDuration: `${motionTokens.durationNormal}ms`,
    transitionTimingFunction: motionTokens.curveDecelerateMid,
  },
  page: {
    position: 'relative',
    flex: '0 0 auto',
    height: '100%',
  },
  card: {
    willChange: 'transform',
    transformOrigin: 'center center',
    transitionProperty: 'transform, width, height, opacity',
    transitionDuration: `${motionTokens.durationNormal}ms`,
    transitionTimingFunction: motionTokens.curveDecelerateMid,
    overflow: 'hidden',
    padding: '0',
    gap: '0',
  },
  cardDragging: {
    opacity: 0.25,
    transitionProperty: 'opacity',
    transitionDuration: `${motionTokens.durationFast}ms`,
  },
  cardEditing: {
    boxShadow: tokens.shadow8,
  },
  /**
   * 卡片内容区：承载 iframe，并接住宿主边缘（6px 内衬）的 hover。
   * 缩放放在内部的 contentLayer 上，让 hover 的 1.015 倍只长进内衬，不裁到 Card 外。
   */
  gestureArea: {
    position: 'absolute',
    inset: '0',
    padding: tokens.spacingHorizontalSNudge,
  },
  contentLayer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    transformOrigin: 'center center',
    willChange: 'transform',
  },
  /** 1px 描边 overlay：hover 用中性色、长按用品牌色，绘制在 iframe 之上且不拦点击 */
  interactionStroke: {
    position: 'absolute',
    inset: '0',
    zIndex: 1,
    border: `${tokens.strokeWidthThin} solid transparent`,
    borderRadius: CARD_RADIUS,
    pointerEvents: 'none',
    opacity: 0,
    transitionProperty: 'opacity, border-color',
  },
  frame: {
    display: 'block',
    width: '100%',
    height: '100%',
    border: '0',
    padding: '0',
    background: 'transparent',
  },
  editOverlay: {
    position: 'absolute',
    inset: '0',
    zIndex: 2,
    cursor: 'grab',
    touchAction: 'none',
    opacity: 0,
    transform: 'translateY(-4px) scale(0.985)',
    transformOrigin: 'center center',
    pointerEvents: 'none',
    // 退出走退出类 token（MOTION §1/§3：150ms curveAccelerateMid），
    // 进入在 editOverlayVisible 里用 200ms decelerateMid
    transitionProperty: 'opacity, transform',
    transitionDuration: `${motionTokens.durationFast}ms`,
    transitionTimingFunction: motionTokens.curveAccelerateMid,
  },
  editOverlayVisible: {
    opacity: 1,
    transform: 'none',
    pointerEvents: 'auto',
    transitionDuration: `${motionTokens.durationNormal}ms`,
    transitionTimingFunction: motionTokens.curveDecelerateMid,
  },
  /**
   * AUDIT V-13：编辑 chrome 直接压在插件首行上（todo 工具栏 / 天气城市名）。
   * 用一层不占布局的顶部渐变压暗遮罩给标题和按钮当底，高度 =
   * 40px 触控目标 + 上下 spacingS，下方渐隐到透明，不遮插件主体。
   */
  editScrim: {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    zIndex: 1,
    height: `calc(${tokens.spacingHorizontalXXL} * 2 + ${tokens.spacingHorizontalS})`,
    background: `linear-gradient(to bottom, color-mix(in srgb, ${tokens.colorNeutralBackground1} 84%, transparent) 0%, color-mix(in srgb, ${tokens.colorNeutralBackground1} 52%, transparent) 62%, transparent 100%)`,
    backdropFilter: 'blur(var(--wtsl-material-blur))',
    pointerEvents: 'none',
  },
  editTitle: {
    position: 'absolute',
    top: tokens.spacingHorizontalXS,
    left: tokens.spacingHorizontalXS,
    zIndex: 3,
    // 3 个 40px 触控按钮 + 间距，留出标题空间（小卡片上由 truncate 省略）
    maxWidth: `max(0px, calc(100% - ${tokens.spacingHorizontalXXXL} * 4.5))`,
    paddingTop: tokens.spacingHorizontalXXS,
    paddingBottom: tokens.spacingHorizontalXXS,
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: MATERIAL_BACKGROUND,
    backdropFilter: 'blur(var(--wtsl-material-blur))',
    boxShadow: tokens.shadow2,
    color: tokens.colorNeutralForeground2,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  editControls: {
    position: 'absolute',
    top: tokens.spacingHorizontalXS,
    right: tokens.spacingHorizontalXS,
    zIndex: 3,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    padding: tokens.spacingHorizontalXXS,
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: MATERIAL_BACKGROUND,
    backdropFilter: 'blur(var(--wtsl-material-blur))',
    boxShadow: tokens.shadow4,
  },
  /** AUDIT V-06：编辑模式图标按钮的触控目标 ≥40×40（DESIGN §1.2，按钮上用内联 min 尺寸保证不被 Fluent 类覆盖） */
  /** 正常模式的拖拽提示：只在悬停时出现，overlay 不占布局 */
  dragHint: {
    position: 'absolute',
    top: tokens.spacingHorizontalXS,
    left: '50%',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: tokens.spacingHorizontalXXS,
    paddingBottom: tokens.spacingHorizontalXXS,
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: MATERIAL_BACKGROUND,
    backdropFilter: 'blur(var(--wtsl-material-blur))',
    boxShadow: tokens.shadow2,
    color: tokens.colorNeutralForeground3,
    opacity: 0,
    transform: 'translateX(-50%) translateY(-2px)',
    pointerEvents: 'none',
    transitionProperty: 'opacity, transform',
    transitionDuration: `${motionTokens.durationFast}ms`,
    transitionTimingFunction: motionTokens.curveDecelerateMid,
  },
  dragHintVisible: {
    opacity: 0.92,
    transform: 'translateX(-50%) translateY(0)',
  },
  toolbar: {
    position: 'absolute',
    top: tokens.spacingHorizontalM,
    left: '50%',
    transform: 'translateX(-50%) translateY(-6px)',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    padding: tokens.spacingHorizontalXXS,
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: MATERIAL_BACKGROUND,
    backdropFilter: 'blur(var(--wtsl-material-blur))',
    boxShadow: tokens.shadow8,
    opacity: 0,
    pointerEvents: 'none',
    // 工具栏属于编辑 chrome：退出 150ms 加速（MOTION §1 退出类），进入 200ms 减速
    transitionProperty: 'opacity, transform',
    transitionDuration: `${motionTokens.durationFast}ms`,
    transitionTimingFunction: motionTokens.curveAccelerateMid,
  },
  toolbarVisible: {
    opacity: 1,
    transform: 'translateX(-50%) translateY(0)',
    pointerEvents: 'auto',
    transitionDuration: `${motionTokens.durationNormal}ms`,
    transitionTimingFunction: motionTokens.curveDecelerateMid,
  },
  toolbarText: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    paddingLeft: tokens.spacingHorizontalXS,
    paddingRight: tokens.spacingHorizontalXS,
    whiteSpace: 'nowrap',
  },
  indicator: {
    position: 'absolute',
    bottom: tokens.spacingHorizontalM,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 6,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    padding: `${tokens.spacingHorizontalXS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: MATERIAL_BACKGROUND,
    backdropFilter: 'blur(var(--wtsl-material-blur))',
    boxShadow: tokens.shadow4,
  },
  indicatorDot: {
    width: tokens.spacingHorizontalS,
    height: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralStroke1,
    transitionProperty: 'background-color, width',
    transitionDuration: `${motionTokens.durationNormal}ms`,
    transitionTimingFunction: motionTokens.curveDecelerateMid,
  },
  indicatorDotActive: {
    backgroundColor: tokens.colorBrandBackground,
  },
  indicatorCapsule: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  placeholder: {
    position: 'absolute',
    top: '0',
    left: '0',
    zIndex: 1,
    borderRadius: CARD_RADIUS,
    border: `calc(${tokens.strokeWidthThick}) dashed ${tokens.colorBrandStroke1}`,
    backgroundColor: `color-mix(in srgb, ${tokens.colorBrandBackground} 14%, transparent)`,
    pointerEvents: 'none',
    transitionProperty: 'transform, width, height',
    transitionDuration: `${motionTokens.durationFast}ms`,
    transitionTimingFunction: motionTokens.curveDecelerateMid,
  },
  dragGhost: {
    position: 'absolute',
    top: '0',
    left: '0',
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: CARD_RADIUS,
    backgroundColor: MATERIAL_BACKGROUND,
    backdropFilter: 'blur(var(--wtsl-material-blur))',
    boxShadow: tokens.shadow16,
    pointerEvents: 'none',
    color: tokens.colorNeutralForeground2,
  },
  centerHint: {
    position: 'absolute',
    inset: '0',
    zIndex: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingHorizontalXXL,
    pointerEvents: 'none',
  },
  centerHintCard: {
    pointerEvents: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingHorizontalXXL,
    borderRadius: tokens.borderRadiusXLarge,
    backgroundColor: MATERIAL_BACKGROUND,
    backdropFilter: 'blur(var(--wtsl-material-blur))',
    boxShadow: tokens.shadow8,
  },
  dialogText: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground2,
  },
});
