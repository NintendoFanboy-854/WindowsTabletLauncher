# 文档总索引（docs/README.md）

本目录是 Windows Tablet Launcher 的全部项目文档。分两类：

- **现行规范**（`docs/` 根目录 + `components/`）：描述"现在应该怎么做"，改动要跟代码/契约一起评审。
- **历史与证据**（`history/`、`releases/`、`audits/`）：描述"当时做了什么、怎么验证的"，**只读不改写**。
- **外部参考**（`reference/`）：第三方资料的本地副本与来源索引，不是项目规范。

## 阅读路径

| 你想做什么 | 先读 |
|---|---|
| 了解产品定位与边界 | [VISION.md](VISION.md) |
| 改 UI / 新增视觉 | [DESIGN.md](DESIGN.md) → [FLUENT2.md](FLUENT2.md) → [DENSITY.md](DENSITY.md) → [MOTION.md](MOTION.md) |
| 查具体数值对应的 Fluent token | [TOKEN-MAP.md](TOKEN-MAP.md) |
| 写/改插件 | [PLUGIN-CONTRACT.md](PLUGIN-CONTRACT.md) → [PLUGIN-REACT.md](PLUGIN-REACT.md) → [components/](components/) 对应组件 |
| 改 Agent 浮空界面 | [AGENT-SURFACE-CONTRACT.md](AGENT-SURFACE-CONTRACT.md) → [components/agent.md](components/agent.md) |
| 找某个设计决策的依据 | [DECISIONS.md](DECISIONS.md) |
| 了解某版本怎么验证的 | [releases/RELEASE-REPORT.md](releases/RELEASE-REPORT.md)；逐项证据见 [audits/README.md](audits/README.md) |
| 查外部 API / 第三方文档 | [reference/README.md](reference/README.md) |

## 目录布局

```text
docs/
├── README.md                      # 本文件：文档索引 + 维护约定 + 迁移对照
│
├── VISION.md                      # 产品定位与边界
├── DESIGN.md                      # 桌面设计总纲（布局/层级/交互约定）
├── FLUENT2.md                     # Fluent 2 落地规范（本项目版）
├── DENSITY.md                     # 信息密度与层级规范
├── MOTION.md                      # 动效规范
├── TOKEN-MAP.md                   # 文档数值 → Fluent token 对照表
├── PLUGIN-CONTRACT.md             # 宿主 ⇄ 插件契约（postMessage API / manifest / 工具）
├── PLUGIN-REACT.md                # 插件实现规范（React + Fluent UI React）
├── AGENT-SURFACE-CONTRACT.md      # Agent 浮空界面与语音契约
├── DECISIONS.md                   # 设计决策记录（D-xx，含背景/取舍/后果）
│
├── components/                    # 六个内置组件 + Agent 的组件级规格
│   ├── agent.md
│   ├── clock.md
│   ├── countdown.md
│   ├── pomodoro.md
│   ├── sedentary.md
│   ├── todo.md
│   └── weather.md
│
├── reference/                     # 外部参考（来源索引见 reference/README.md）
│   ├── README.md                  # 来源 / 版本 / 许可 / 本地副本说明
│   ├── APPLE-HIG.md               # Apple HIG 原则参照（项目内抽取，入库）
│   ├── external-services.md       # MiMo / 和风天气 等外部服务文档链接
│   ├── fluent-design/             # Fluent 2 设计语言 15 页（本地副本，不入库）
│   └── fluent-ui-docs/            # microsoft/fluentui 文档抽取 722 篇 + INDEX（本地副本，不入库）
│
├── releases/                      # 发布流程与发布验证
│   ├── RELEASE.md                 # 发布前检查清单（v0.3.0 → v0.3.1 版）
│   └── RELEASE-REPORT.md          # 各版本验证报告（§10 v0.2.1 … §20 v0.3.7）
│
├── history/                       # 已完成/已被取代的计划、规格、结果（只读）
│   ├── PLAN.md                    # v0.1–v0.3 开发计划与完成回填（E0–E8）
│   ├── DESIGN-ROUND-SUMMARY.md    # 2026-10 交互与视觉设计定稿汇总
│   ├── UI-REWRITE-SPEC.md         # UI 重写规格 v2（2026-10-19）
│   ├── OVERLAY-REWRITE-SPEC.md    # 浮层重排规格（2026-10-19）
│   ├── OVERLAY-REWRITE-RESULT.md  # 浮层重排结果
│   └── V040-VISUAL-REWORK-SPEC.md # v0.4.0 视觉升级实施规范
│
├── audits/                        # 审计报告与证据索引（见 audits/README.md）
│   ├── README.md
│   ├── round1-fluid-visual/       # 2026-10-18/19 基线 UI 审计：AUDIT.md + 原始扫描 txt/log
│   └── round2-type-visual/        # 第二轮：字号/间距审计 + 视觉审计 + 重写验收 + 量测数据
│
└── images/                        # README/发布用的精选截图，按版本归档（v030 / v037 / v040）
```

## 现行规范（根目录文件）为什么不再分子目录

根目录这 10 个文件是**被源码注释直接引用的现行规范**。例如 `src/host/layout/breakpoints.ts` 注释里写
`docs/DESIGN.md §1.1`，`public/plugins/todo/js/config.js` 注释里写 `PLUGIN-CONTRACT §2.1`，
`docs/components/*.md` 被六个插件源码逐文件引用。

本仓库的整理原则是**代码不动**，因此这些路径必须保持稳定；历史文档、发布记录、审计与外部参考则按
语义进入子目录。所以"根目录平铺"是刻意的：**根目录 = 现行规范的稳定入口，子目录 = 归档与参考**。

> 以后如果要移动根目录的规范文件，必须同步修改引用它的源码注释（或者先接受注释里的路径失效）。
> 新增规范文档请先确认是否会被代码引用；会被引用的一律放 `docs/` 根目录并保持文件名稳定。

## 证据与本地目录（仓库根，均不入库）

本仓库的约定是 **结论入库、证据本地**：

| 目录 | 内容 | 版本库 |
|---|---|---|
| `shots/` | 验证/审计截图与日志，按 `releases/`、`milestones/`、`audits/`、`archive/` 归档 | 忽略 |
| `.tmp/` | 临时调试输出：`logs/`、`scripts/`、`screenshots/`、`media/`、`data/`、`backups/`、`experiments/`、`archive/` | 忽略 |
| `release/` | 各版本安装包（NSIS/MSI/app.exe + README/SHA256SUMS） | 忽略 |
| `dist/` | Vite 构建产物 | 忽略 |

`shots/` 的结构与每个目录对应的里程碑见 [audits/README.md](audits/README.md)。`docs/reference/` 下的
第三方文档副本同样本地保存、不入库（见 [reference/README.md](reference/README.md)）。

## 维护约定

1. **现行规范**（根目录 + `components/`）变更时，与代码改动同一次提交；不要只改文档不改实现。
2. **历史文档只读**：`history/`、`releases/RELEASE-REPORT.md`、`audits/*` 记录的是当时的仓库状态，
   其中的文件路径/行号按当时版本保留，不追着现在的目录改（若引用已迁移的路径，以本文档的迁移表为准）。
3. **新文档放哪**：
   - 现行规范/契约 → `docs/` 根目录（会被代码引用）或 `docs/components/`（组件级）；
   - 一次性计划、已完成规格/结果 → `docs/history/`；
   - 发布流程与发布报告 → `docs/releases/`；
   - 审计报告与量测数据 → `docs/audits/<轮次>/`，原始截图放 `shots/audits/<轮次>/`；
   - 外部资料与来源说明 → `docs/reference/`，大体积第三方副本不入库；
   - 验证脚本留在 `scripts/`，其输出（截图/日志/JSON）进 `shots/`，不要把产物提交进 `docs/`。
4. **文件名**：现行规范用全大写 + `-`（如 `PLUGIN-CONTRACT.md`）或 `components/<id>.md`；
   索引/说明文件用 `README.md`、小写短横线（如 `external-services.md`）。
5. **截图引用**：README/发布说明引用 `docs/images/<版本>/`；细节证据引用 `shots/` 路径并说明"本地证据，不入库"。
6. **不新增设计 token**：任何视觉值都要能落到 [TOKEN-MAP.md](TOKEN-MAP.md) 或 Fluent token 上。

## 2026-10-25 整理：迁移对照表

本次整理只移动文档/证据/临时文件，**未改动任何源码、配置或构建脚本**。旧路径 → 新路径：

| 旧路径 | 新路径 |
|---|---|
| `Docs.md`（仓库根） | `docs/reference/external-services.md` |
| `docs/PLAN.md` | `docs/history/PLAN.md` |
| `docs/RELEASE.md` | `docs/releases/RELEASE.md` |
| `docs/RELEASE-REPORT.md` | `docs/releases/RELEASE-REPORT.md` |
| `docs/DESIGN-ROUND-SUMMARY.md` | `docs/history/DESIGN-ROUND-SUMMARY.md` |
| `docs/UI-REWRITE-SPEC.md` | `docs/history/UI-REWRITE-SPEC.md` |
| `docs/OVERLAY-REWRITE-SPEC.md` | `docs/history/OVERLAY-REWRITE-SPEC.md` |
| `docs/OVERLAY-REWRITE-RESULT.md` | `docs/history/OVERLAY-REWRITE-RESULT.md` |
| `docs/audit/` | `docs/audits/round1-fluid-visual/`；截图证据 `shots/audit/` → `shots/audits/round1-fluid-visual/` |
| `docs/audit2/` | `docs/audits/round2-type-visual/`；截图证据 `shots/audit2/` → `shots/audits/round2-type-visual/` |
| `references/fluentui-design/` | `docs/reference/fluent-design/`（本地，不入库） |
| `references/fluentui-docs/` | `docs/reference/fluent-ui-docs/`（本地，不入库） |
| `references/` 其余内容 | 日志 → `.tmp/logs/references/`；早期截图 → `shots/archive/legacy-*/`；图标源包/临时图标 → `.tmp/archive/`；`references/` 目录已删除 |
| `shots/e1…e7/`、`shots/e3-*/`、`shots/pnp/`、`shots/rewrite/`、`shots/sedentary-*/` | `shots/milestones/<同名或语义名>/`（`rewrite` → `overlay-rewrite`） |
| `shots/v022/`、`shots/v022-final/` | `shots/releases/v0.2.x/` 下对应目录 |
| `shots/v030-*/`、`v031-*/`、`v032-dev/`、`v036-final/`、`v037-dev/` | `shots/releases/v0.3.x/` 下对应目录 |
| `shots/` 根目录散落的早期截图 | `shots/archive/<截图日期>/`（如 `2026-10-18/`） |
| `.tmp/` 根目录散落的日志/脚本/截图/录音 | `.tmp/logs/`、`.tmp/scripts/`、`.tmp/screenshots/`、`.tmp/media/` |
| `.tmp/` 下的试验目录 | `.tmp/experiments/`；LevelDB/localStorage 副本 → `.tmp/data/`；安装备份 → `.tmp/backups/` |
| `.tmp/v040-spec.md` | `docs/history/V040-VISUAL-REWORK-SPEC.md` |

## 已知陈旧点（整理时发现，未擅自改写）

- 根 `README.md` 的"验证状态"与版本号停在 **v0.4.0**，而 `package.json` / `src-tauri/Cargo.toml` /
  `tauri.conf.json` 已是 **0.6.0**；v0.5.0、v0.6.0 的验证结论目前只在 git 提交信息里，未回填 README/RELEASE-REPORT。
- `docs/releases/RELEASE-REPORT.md` 覆盖到 **v0.3.7 §20**；v0.4.0 之后的验证结论散见 README 与提交信息。
- 历史文档（`history/`、`releases/`、`audits/`）中的路径是按当时仓库状态写的；遇到旧路径请对照上面的迁移表。
