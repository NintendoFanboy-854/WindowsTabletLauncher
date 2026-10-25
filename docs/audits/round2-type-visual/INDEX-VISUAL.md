# 视觉审计截图索引（audit round 2 · visual-auditor 产出）

采集方式：headless Edge + CDP `Page.captureScreenshot`，不使用 shot.ps1（无法注入 CSS/主题）。

- 本审计的报告：同目录 [`REPORT-VISUAL.md`](REPORT-VISUAL.md)、[`REPORT-TYPE.md`](REPORT-TYPE.md)、[`REWRITE-RESULT.md`](REWRITE-RESULT.md)。
- **截图证据不在版本库内**：`host/` 3 张 + `standalone/` 56 张 + 根目录 `type-host-{1024x768,1440x960,960x1440}.png` 3 张（字号审计引用，见 `REPORT-TYPE.md`），全部位于本地证据目录 `shots/audits/round2-type-visual/`（`shots/` 被 `.gitignore` 忽略，见仓库根 `docs/README.md` 的「证据目录」一节）。
- `shots/audits/round2-type-visual/` 根目录的其余 PNG（如 `1024x768-*`、`1440x960-*` 等）属同期并行审计任务，不在 `REPORT-VISUAL.md` / `REPORT-TYPE.md` 引用。

## host/ —— 宿主真实桌面（DSF=1，真实主题/材质/iframe）

| 文件 | 视口 | 内容 |
|---|---|---|
| `host/desktop-1440x960.png` | 1440×960 | 8 列 cell=164；默认 6 卡（clock 2×1、countdown 2×1、sedentary 2×1、pomodoro 2×1、todo 3×3、weather 3×2） |
| `host/desktop-1024x768.png` | 1024×768 | 6 列 cell=154；默认布局 L 形（pomodoro 落到右下） |
| `host/desktop-960x1440.png` | 960×1440 | 6 列 cell=143；默认 6 卡只占上 3 行，下方 55% 空 |

> 注意：DSF=2 时 headless 对 `backdrop-filter` 合成失败（卡片变白底），真实观感一律 DSF=1。

## standalone/ —— 逐插件 × 逐尺寸（DSF=2；iframe 视口 = 宿主卡片内容区，注入卡片材质色 #212121）

命名：`<plugin>-<size>-<resolution>.png`，resolution ∈ {1440x960, 1024x768, 960x1440}。

- 每个尺寸在 1440×960 全量拍摄；1024×768 与 960×1440 拍摄 1×1、3×2 及该插件最大档（todo 3×3/4×2、weather 4×2）。
- 额外：`countdown-1x1-nontoday-1440x960.png` = 去掉“今天”事件后的非今天态（天数 40px 对照）。
- 尺寸对应：1×1 = 152/142/131；2 列 = 328/308/286（宽）× 152/142/131（高）；3 列 = 504/474/441（宽）× 328/308/286（高）；4×2 = 680/640/596 × 328/308/286。

数据与结论见同目录 [`REPORT-VISUAL.md`](REPORT-VISUAL.md)，原始测量见 [`_data/measures/`](_data/measures/)。
