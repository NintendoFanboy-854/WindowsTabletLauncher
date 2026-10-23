/**
 * Agent 浮空界面 UI 侧类型。
 *
 * `SurfaceStage` 是“仅 UI 持有”的三段形态，不进入 session / 持久化；
 * 单独放一个文件是为了 Composer / AgentSurface 之间只共享类型、不产生运行时循环依赖。
 *
 * v0.3.7 起 `composer` 更名为 `voice`：半高形态是纯语音窗（无文字输入），
 * 文字输入只存在于全高 `chat` 形态（兜底）。
 */
export type SurfaceStage = 'collapsed' | 'voice' | 'chat';
