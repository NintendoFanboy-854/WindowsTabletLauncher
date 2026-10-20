/**
 * Agent 浮空界面 UI 侧类型。
 *
 * `SurfaceStage` 是契约 §8 里“仅 UI 持有”的三段形态，不进入 session / 持久化；
 * 单独放一个文件是为了 Composer / AgentSurface 之间只共享类型、不产生运行时循环依赖。
 */
export type SurfaceStage = 'collapsed' | 'composer' | 'chat';
