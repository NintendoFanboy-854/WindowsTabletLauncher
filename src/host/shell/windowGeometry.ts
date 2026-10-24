/**
 * 窗口几何自校正（v0.4.1 · 底部白带修复）
 *
 * ## 现象
 * 全屏声明的窗口（`src-tauri/tauri.conf.json` 的 `fullscreen: true` + `decorations: false`）
 * 在 Windows 上会以「最大化」姿态起来：**窗口矩形 = 显示器矩形，客户区 = 工作区**。
 * 实测（2880×1920 / 200%，任务栏常驻 80 物理 px）：
 *
 * ```
 * GetWindowRect      : 0,0 - 2880,1920   (2880 × 1920)
 * GetClientRect      : 2880 × 1840      ← 少了任务栏那 80 物理 px = 40 逻辑 px
 * DWM extended frame : 0,0 - 2880,1920
 * monitor rcWork     : 0,0 - 2880,1840
 * WRY_WEBVIEW        : 0,0 - 2880,1840  （WebView2 严格铺满客户区）
 * ```
 *
 * WebView2 只铺满客户区，所以窗口底部那 40 逻辑 px 是**非客户区**：它由窗口自身绘制，
 * 既不是页面 DOM，也不消费任何 Fluent token（浅色窗口主题画纯白 255、深色画黑）。
 * 用 `WindowFromPoint` 可以证明这一点——那一条命中的是 `Tauri Window`，
 * 而不是 `Chrome_RenderWidgetHostHWND`：
 *
 * ```
 * (1440, 900)  -> cls=Chrome_RenderWidgetHostHWND (页面内容)
 * (1440, 1900) -> cls=Tauri Window                (非客户区，页面画不到)
 * ```
 *
 * 结论：**这条带子无法用 CSS/JS 修补**（给某个 div 加底色只会盖住视口内的东西，
 * 视口外的 40px 永远碰不到）。唯一的修法是把窗口状态摆正，让 WebView2 重新铺满显示器。
 *
 * ## 处理
 * 挂载后向宿主核对一次「宿主认为自己在全屏 ↔ 页面视口是否铺满显示器」：
 * 只有同时满足「`window_is_fullscreen` 为真」且「视口比显示器矮」时才重新应用一次全屏。
 * 理由：wry 只在**进入**全屏时重设窗口样式（清掉残留的最大化状态）并按显示器矩形摆放
 * WebView2；窗口模式下什么都不动，浏览器 / headless 预览下整段直接跳过。
 *
 * 幂等：判定不成立就立即返回，不会循环触发；重进全屏失败时也不会把窗口留在窗口态
 * （退出全屏与重进全屏两次调用各自 catch，第二次一定会执行）。
 */
import { isTauriRuntime, windowIsFullscreen, windowSetFullscreen } from '../plugins/tauri';

/** 自校正结果，供调试与验收读取（不参与渲染） */
export type WindowGeometryResult =
  /** 不在 Tauri 里（开发服务器 / 浏览器 / 截图），不做任何事 */
  | 'skipped-non-tauri'
  /** 宿主不在全屏（用户或系统主动切成了窗口），尊重现状 */
  | 'skipped-windowed'
  /** 视口已经铺满显示器，无需处理 */
  | 'ok'
  /** 发现缺口并重新应用全屏后已铺满 */
  | 'fixed'
  /** 重新应用后仍有缺口，或调用失败（不重试，交给发布批复验） */
  | 'failed';

/** 允许的取整误差：设备像素比换算与滚动条都会带来 1px 级别的出入 */
const TOLERANCE = 1;

/** 等浏览器把窗口尺寸变化吃进布局（全屏切换后一帧内视口还没更新） */
function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => window.setTimeout(resolve, 0));
  });
}

/** 视口比显示器矮多少逻辑 px（0 表示已铺满；负数一律按 0 处理） */
function viewportGap(): number {
  // screen.width/height 与 CSS px 同域；在 200% DPI 下 2880 物理 = 960 逻辑
  return Math.max(0, window.screen.height - window.innerHeight);
}

/**
 * 让窗口回到「全屏且真实铺满显示器」的状态。
 * 只在 Tauri 运行时执行；任何一步失败都只记日志，不影响界面。
 */
export async function reconcileWindowGeometry(): Promise<WindowGeometryResult> {
  if (!isTauriRuntime()) return 'skipped-non-tauri';

  let result: WindowGeometryResult = 'failed';
  try {
    if (!(await windowIsFullscreen())) return 'skipped-windowed';
    if (viewportGap() <= TOLERANCE) return 'ok';

    // 退出再进入：只有「进入全屏」这一路径会重设样式并重新摆放 WebView2
    await windowSetFullscreen(false).catch(() => undefined);
    await windowSetFullscreen(true).catch(() => undefined);
    await nextFrame();

    result = viewportGap() <= TOLERANCE ? 'fixed' : 'failed';
    if (result === 'failed') {
      console.warn('[wtsl] 全屏重应用后视口仍未铺满显示器，底部可能残留系统窗口背景');
    }
  } catch (error) {
    console.warn('[wtsl] 窗口几何自校正未执行', error);
  }
  return result;
}
