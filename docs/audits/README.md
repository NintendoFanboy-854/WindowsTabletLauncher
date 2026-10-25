# 审计与验证证据索引（docs/audits/README.md）

本目录放**审计报告 + 可复现的量测数据/harness**（入库）；对应的**原始截图与运行日志**按"结论入库、
证据本地"约定放在仓库根 `shots/`（不入库）。本文件是两者的对照索引。

## 目录结构

```text
docs/audits/
├── README.md                 # 本文件
├── round1-fluid-visual/      # 第一轮：基线 UI 设计审计（2026-10-18/19）
│   ├── AUDIT.md              # 审计报告（P1/P2 清单、复验记录、处置口径）
│   ├── _scan-*.txt           # 静态扫描原始命中（hex/字号/间距/圆角/阴影/动效）
│   ├── _g2*-scan-*.txt       # G2/G2b/G2c 复扫命中
│   ├── _baseline*.txt        # 审计基线（时间 / git 状态 / 137 个源文件的 SHA256 前 16 位快照）
│   └── _shots-*.log          # 截图批次日志（*.log 被 .gitignore 忽略：本地有、不入库）
└── round2-type-visual/       # 第二轮：字号/间距系统审计 + 视觉审计 + 重写验收（2026-10-19）
    ├── REPORT-TYPE.md        # 字号与间距系统审计
    ├── REPORT-VISUAL.md      # 信息密度 / 可扫读性 / 层级审计
    ├── REWRITE-RESULT.md     # UI 重写验收结果
    ├── INDEX-VISUAL.md       # 视觉审计截图索引（截图在 shots/audits/round2-type-visual/）
    ├── _data/                # 量测 JSON（宿主/逐插件逐尺寸）与汇总
    └── _type-data/           # 字阶矩阵与 harness 脚本/输出
```

对应证据：`shots/audits/round1-fluid-visual/`（151 个文件）、`shots/audits/round2-type-visual/`（87 个文件）。
本目录中 round1 现有 57 个文件，其中 15 个 `*.log` 被 `.gitignore` 忽略（仅本机存在）；round2 的
`_data/`、`_type-data/` 是可复现的量测数据与 harness，随报告入库。

> 两份审计报告写于 v0.2 前后，是**历史文档**：其中的文件路径/行号按当时仓库状态保留，不随
> `docs/` 重排而改写。当前规范请以 `docs/` 根目录与 `docs/components/` 为准。

## 里程碑验证报告（本地证据）

以下报告随对应截图/日志放在 `shots/` 下（`shots/` 被 gitignore，属本地证据）；结论摘要已回填
[../releases/RELEASE-REPORT.md](../releases/RELEASE-REPORT.md) 与根 `README.md`。

| 里程碑 | 证据目录 | 报告 |
|---|---|---|
| E3 六插件重构（串行全量回归） | `shots/milestones/e3-final/` | `REPORT.md`；P1 复验 `p1-fix2/REPORT.md` |
| E5 视觉收口 | `shots/milestones/e5/` | `REPORT.md` |
| E6 测试脚手架清理 | `shots/milestones/e6/` | `REPORT.md` |
| E7 回归与发布（v0.2.0） | `shots/milestones/e7/` | `REPORT.md`（`logs/`、`desktop/`、`cards/`、`overlays/`、`host/`、`pages/`、`plug-and-play/`） |
| 浮层重排（overlay rewrite） | `shots/milestones/overlay-rewrite/` | 12 视图 × 暗/亮截图 + 宿主集成 |
| 第三方插件 plug-and-play | `shots/milestones/pnp/` | 验收截图；结论见 `RELEASE-REPORT.md` §2.4 |
| 久坐验证 | `shots/milestones/sedentary-verify/`、`sedentary-agent-sync/` | 循环/复盘/同步截图 |
| v0.2.2 独立全量回归 | `shots/releases/v0.2.x/v022-final/` | `REPORT.md`；release 复验 `release/RELEASE-VERIFY.md` |
| v0.3.0 Phase 1（dev · Agent 浮空界面） | `shots/releases/v0.3.x/v030-dev/` | `REPORT.md` |
| v0.3.0 Phase 2（release/安装包） | `shots/releases/v0.3.x/v030-final/` | `REPORT.md` |
| v0.3.1 UI 冒烟 | `shots/releases/v0.3.x/v031-dev/` | `README.md`（冒烟清单与截图） |
| v0.3.1 release 真窗口 | `shots/releases/v0.3.x/v031-final/` | `REPORT.md` |
| v0.3.6 release 真窗口 CDP | `shots/releases/v0.3.x/v036-final/` | `REPORT.md` |
| v0.3.7 语音优先 Agent | `shots/releases/v0.3.x/v037-dev/` | `REPORT.md` |

## 精选截图（入库）

给人看的、随 README/发布说明引用的截图在 [`../images/`](../images/)：按版本分目录
（`v030/` 18 张、`v037/` 8 张、`v040/` 6 张），与上面的原始证据目录区分。

## `shots/` 目录约定

```text
shots/
├── releases/            # 按版本：v0.2.x/、v0.3.x/（v0.4+ 的截图入库在 docs/images/）
├── milestones/          # 按工程里程碑：e1…e7、e3-*、pnp、overlay-rewrite、sedentary-*
├── audits/              # 与 docs/audits/ 对应的原始证据
└── archive/             # 早期散落截图按日期归档：2026-10-18/、2026-10-19/、2026-10-22/、legacy-*
```

增删证据时保持"一个验证任务一个目录、报告与截图同目录"的规则；体积较大的原始证据不进版本库。

> **注意（2026-10-25 整理后的已知遗留）**：`scripts/*.mjs` 里验证脚本默认的输出目录仍是旧结构
> （如 `shots/e7/`、`shots/v030-dev/`、`shots/v022-final/`、`shots/pnp/`、`shots/e3/`、`shots/v031-dev/`）。
> 按"代码不动"原则本次未改脚本；重新运行这些脚本会在 `shots/` 根下生成旧目录名。若要和新结构对齐，
> 见 `docs/README.md`「已知陈旧点」一节（按迁移表同步脚本内路径常量，属代码改动）。
