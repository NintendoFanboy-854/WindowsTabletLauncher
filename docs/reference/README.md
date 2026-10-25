# 外部参考（docs/reference/README.md）

本目录只放**外部资料的本地副本与来源索引**，不是项目自身的规范。规范在 `docs/` 根目录与
`docs/components/`。

## 内容与来源

| 内容 | 路径 | 是否入库 | 来源 / 版本 |
|---|---|---|---|
| Apple HIG 原则参照 | [APPLE-HIG.md](APPLE-HIG.md) | **入库** | Apple《人机界面指南》中文站，按页面数据接口抓取；抓取日 2026-10-19。项目内摘编，用途见文首 |
| 外部服务文档链接 | [external-services.md](external-services.md) | **入库** | Xiaomi MiMo、和风天气官方文档链接清单（原仓库根 `Docs.md`） |
| Fluent 2 设计语言（15 页） | `fluent-design/` | 本地，**不入库** | [fluent2.microsoft.design](https://fluent2.microsoft.design) 页面抓取到本地 |
| Fluent UI React 文档抽取（722 篇） | `fluent-ui-docs/` | 本地，**不入库** | `microsoft/fluentui` @ `f02cfa8f` 抽取的纯 `.md`/`.mdx` 副本；检索方式见 `fluent-ui-docs/INDEX.md` |

> `fluent-design/` 与 `fluent-ui-docs/` 是体量较大的第三方资料副本，按仓库约定**不提交**：
> `.gitignore` 中有对应规则（`docs/reference/fluent-design/`、`docs/reference/fluent-ui-docs/`）。
> 全新 clone 后这两个目录为空是预期行为；需要离线查文档时按下面的"重新获取"补齐。

### fluent-design 覆盖的 15 个页面

`design-principles`、`color`、`typography`、`layout`、`shapes`、`elevation`、`material`、`motion`、
`iconography`、`accessibility`、`content-design`、`design-tokens`、`handoffs`、`onboarding`、`wait-ux`。

项目对 Fluent 2 的落地取舍见 [../FLUENT2.md](../FLUENT2.md)；与项目规范冲突时以项目规范为准。

### fluent-ui-docs 的检索入口

- 总目录与检索方式：`fluent-ui-docs/INDEX.md`
- 概念/迁移：`fluent-ui-docs/apps/public-docsite-v9/src/Concepts/`
- 组件（89 个包）：`fluent-ui-docs/packages/react-components/`
  - 设计规格 `<包>/library/docs/SPEC.md`、迁移 `<包>/library/docs/MIGRATION.md`
  - API 报告 `<包>/library/etc/*.api.md`
  - 最佳实践 / 说明 / 可访问性：`<包>/stories/**/*BestPractices.md`、`*Description.md`、`*Accessibility*.mdx`

具体文件清单与示例路径见 [external-services.md](external-services.md)。

## 重新获取（clone 后补齐本地副本）

1. **fluent-ui-docs**：从 `microsoft/fluentui` 检出对应 commit（记录为 `f02cfa8f`），把
   `apps/public-docsite-v9/**` 与 `packages/react-components/**` 下的 `.md`/`.mdx` 按原相对路径
   抽取到 `docs/reference/fluent-ui-docs/`，并保留 `INDEX.md`。
2. **fluent-design**：从 `https://fluent2.microsoft.design` 抓取上述 15 个设计语言页面正文，
   存为同名的 `<page>.md`。
3. **校验**：`fluent-design/` 应为 15 个 `.md`；`fluent-ui-docs/` 应为 722 个 `.md`/`.mdx` + `INDEX.md`。

## 许可与使用边界

- Fluent UI 文档与代码：Microsoft，MIT 许可（`microsoft/fluentui`）。Fluent 2 站点正文版权归 Microsoft，
  此处仅作个人项目的离线查阅副本，不随仓库分发。
- Apple HIG 正文版权归 Apple；`APPLE-HIG.md` 是项目内用于设计讨论的原则摘编，**不代表**项目改用 Apple 设计语言
  （Liquid Glass、SF 字体、Apple 控件形态与 pt 体系一律不引入）。
- Xiaomi MiMo / 和风天气文档链接仅作索引；接口使用受各自服务条款约束，API Key 不入库（见根 `.gitignore`）。
