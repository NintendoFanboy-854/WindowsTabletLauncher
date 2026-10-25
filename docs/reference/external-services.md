# 外部服务与参考文档链接

> 本文件原为仓库根 `Docs.md`（2026-10-25 整理迁入 `docs/reference/`）。内容：开发期用到的外部服务
> 文档入口（Xiaomi MiMo、和风天气）与 Fluent 2 本地离线文档的检索路径。
> 本地第三方副本的说明见 [README.md](README.md)；本文件中的路径均为**仓库根相对路径**。

## Xiaomi MiMo-V2.6 文档

- 模型概览（mimo-v2.6-pro）：https://mimo.mi.com/models/zh-CN/mimo-v2.6-pro
- 模型概览（mimo-v2.6-flash）：https://mimo.mi.com/models/zh-CN/mimo-v2.6-flash
- 模型概览（mimo-v2.6-pro-ultraspeed）：https://mimo.mi.com/models/zh-CN/mimo-v2.6-pro-ultraspeed
- 模型发布记录：https://mimo.mi.com/docs/zh-CN/updates/model
- 首次调用API：https://mimo.mi.com/docs/zh-CN/quick-start/summary/first-api-call
- 模型列表：https://mimo.mi.com/docs/zh-CN/quick-start/summary/model
- Chat Completions API 兼容：https://mimo.mi.com/docs/zh-CN/api/chat/openai-api
- 深度思考：https://mimo.mi.com/docs/zh-CN/quick-start/usage-guide/text-generation/deep-thinking
- 结构化输出：https://mimo.mi.com/docs/zh-CN/quick-start/usage-guide/text-generation/structured-output
- 批量推理（Batch API）：https://mimo.mi.com/docs/zh-CN/quick-start/usage-guide/text-generation/batch-api
- 图片理解：https://mimo.mi.com/docs/zh-CN/quick-start/usage-guide/multimodal-understanding/image-understanding
- 音频理解：https://mimo.mi.com/docs/zh-CN/quick-start/usage-guide/multimodal-understanding/audio-understanding
- 视频理解：https://mimo.mi.com/docs/zh-CN/quick-start/usage-guide/multimodal-understanding/video-understanding
- 联网搜索：https://mimo.mi.com/docs/zh-CN/quick-start/usage-guide/text-generation/tool-calling/web-search
- 语音识别（MiMo-V2.5-ASR）：https://mimo.mi.com/docs/zh-CN/quick-start/usage-guide/audio/Speech-Recognition
- 语音合成（MiMo-V2.5-TTS）：https://mimo.mi.com/docs/zh-CN/quick-start/usage-guide/audio/speech-synthesis-v2.5

### API 参考

- OpenAI Responses API：https://mimo.mi.com/docs/zh-CN/api/chat/responses
- Anthropic API 兼容：https://mimo.mi.com/docs/zh-CN/api/chat/anthropic-api
- List Models API：https://mimo.mi.com/docs/zh-CN/api/model/list-models
- 速率限制：https://mimo.mi.com/docs/zh-CN/api/guidance/rate-limit
- 模型超参数：https://mimo.mi.com/docs/zh-CN/api/guidance/model-hyperparameters
- 错误码：https://mimo.mi.com/docs/zh-CN/api/guidance/error-codes

## 和风天气

- GeoAPI：https://dev.qweather.com/docs/api/geoapi/
- 天气预报：https://dev.qweather.com/docs/api/weather/
- 分钟预报：https://dev.qweather.com/docs/api/minutely/
- 预警：https://dev.qweather.com/docs/api/warning/
- 天气指数：https://dev.qweather.com/docs/api/indices/
- 空气质量：https://dev.qweather.com/docs/api/air-quality/
- 时光机：https://dev.qweather.com/docs/api/time-machine/
- 天文：https://dev.qweather.com/docs/api/astronomy/
- 控制台API：https://dev.qweather.com/docs/api/console/
- 按量计费定价：https://dev.qweather.com/docs/finance/pricing/

## Fluent 2（本地离线文档）

来源：microsoft/fluentui（commit f02cfa8f）抽取的纯文档副本，根目录 `docs/reference/fluent-ui-docs/`，共 722 个 .md/.mdx（另见目录内 `INDEX.md`）。
该目录为**本地副本、不入库**（`.gitignore` 忽略）；检索方式与目录说明见本地副本
`fluent-ui-docs/INDEX.md`（clone 后先按 [README.md](README.md) 的「重新获取」补齐，该文件才存在）。

- 概念（`docs/reference/fluent-ui-docs/apps/public-docsite-v9/src/Concepts/`）
  - Introduction: `docs/reference/fluent-ui-docs/apps/public-docsite-v9/src/Concepts/Introduction.mdx`
  - Quick Start: `docs/reference/fluent-ui-docs/apps/public-docsite-v9/src/Concepts/QuickStart.mdx`
  - Slots: `docs/reference/fluent-ui-docs/apps/public-docsite-v9/src/Concepts/Slots/`
  - Styling Components: `docs/reference/fluent-ui-docs/apps/public-docsite-v9/src/Concepts/StylingComponents.mdx`
  - Positioning: `docs/reference/fluent-ui-docs/apps/public-docsite-v9/src/Concepts/Positioning/`
  - SSR: `docs/reference/fluent-ui-docs/apps/public-docsite-v9/src/Concepts/SSR/`
  - Accessibility: `docs/reference/fluent-ui-docs/apps/public-docsite-v9/src/Concepts/Accessibility/`
  - Migration（v8/v0 → v9，95 篇）: `docs/reference/fluent-ui-docs/apps/public-docsite-v9/src/Concepts/Migration/`
- 主题: `docs/reference/fluent-ui-docs/apps/public-docsite-v9/src/Concepts/Theming.mdx`、`docs/reference/fluent-ui-docs/apps/public-docsite-v9/src/Theming/ThemeDesigner.mdx`
- 焦点管理: `docs/reference/fluent-ui-docs/apps/public-docsite-v9/src/Utilities/FocusManagement/`
- 可访问性场景清单: `docs/reference/fluent-ui-docs/apps/public-docsite-v9/src/AccessibilityScenarios/ListOfScenarios.mdx`
- 组件（89 个包，根目录 `docs/reference/fluent-ui-docs/packages/react-components/`）
  - 最佳实践：`<包>/stories/**/*BestPractices.md`
  - 组件说明：`<包>/stories/**/*Description.md`
  - 可访问性规范：`<包>/stories/**/*Accessibility*.mdx`（文件内含对应 Storybook 的 `<Meta title>`）
  - 设计规格：`<包>/library/docs/SPEC.md`（部分为 `Spec.md`）；迁移：`<包>/library/docs/MIGRATION.md`
  - API 报告（props/类型签名）：`<包>/library/etc/*.api.md`
  - 示例：Button
    - 设计规格: `docs/reference/fluent-ui-docs/packages/react-components/react-button/library/docs/SPEC.md`
    - API: `docs/reference/fluent-ui-docs/packages/react-components/react-button/library/etc/react-button.api.md`
    - 最佳实践: `docs/reference/fluent-ui-docs/packages/react-components/react-button/stories/src/Button/ButtonBestPractices.md`
    - 可访问性: `docs/reference/fluent-ui-docs/packages/react-components/react-button/stories/src/Button/ButtonAccessibilitySpec.mdx`
- 设计语言（design principles / color / elevation / typography / design tokens 等 15 页）另存于本地
  `docs/reference/fluent-design/`（同样不入库），项目落地取舍见 [../FLUENT2.md](../FLUENT2.md)。
