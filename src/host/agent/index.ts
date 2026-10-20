/**
 * Agent 模块的公共出口。
 *
 * 宿主接线只需要：
 *   import { AgentSurface } from './agent';
 *   <AgentSurface />
 * 设置页想直接打开 chat 时用受控属性 `open / onOpenChange`；无桌面入口的实例传
 * `hideEntry`。UI 只消费 `useAgentSession` 暴露的状态与动作（契约 §8）。
 */

export { AgentSurface } from './ui/AgentSurface';
export type { AgentSurfaceProps } from './ui/AgentSurface';
export { SettingsDialog } from './ui/SettingsDialog';
export type { SurfaceStage } from './ui/types';

export {
  useAgentSession,
  MAX_TOOL_ROUNDS,
} from './hooks/useAgentSession';
export type {
  AgentSession,
  AgentSeed,
  AgentSessionError,
  AgentVoiceState,
  TurnStatus,
  UseAgentSessionOptions,
} from './hooks/useAgentSession';

export { MimoTransport, parseAnnotations, MimoWebSearchDisabledError } from './transport/real';
export { MockTransport } from './transport/mock';

export {
  readSettings,
  updateSettings,
  subscribeSettings,
  isMockRequestedByUrl,
  normalizeSettings,
  SETTINGS_STORAGE_KEY,
} from './settings';
export type { SettingsPatch } from './settings';

export {
  loadConversations,
  saveConversations,
  createConversation,
  createMessage,
  CONVERSATIONS_STORAGE_KEY,
} from './storage';

export {
  DEFAULT_SETTINGS,
  MIMO_MODELS,
  MIMO_BASE_URL,
  MIMO_PLUGIN_CONSOLE_URL,
  TTS_VOICES,
} from './types';
export type {
  AgentErrorAction,
  AgentSettings,
  AgentTransport,
  AgentToolDecl,
  Conversation,
  Message,
  MessageInput,
  MimoModel,
  SourceRef,
  ToolCallRecord,
  TranscriptStatus,
} from './types';
