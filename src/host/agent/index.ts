/**
 * Agent 模块的公共出口。
 *
 * 宿主接线只需要：
 *   import { AgentSurface } from './agent';
 *   <AgentSurface />
 * 需要自己控制入口时使用受控属性 `open / onOpenChange / mode / onModeChange`，
 * 或者直接用 `useAgentSession` + `AgentPanel` 组装。
 */

export { AgentSurface, type AgentSurfaceProps } from './ui/AgentSurface';
export { AgentPanel, type AgentPanelProps } from './ui/AgentPanel';
export { ConversationPane, type ConversationPaneProps } from './ui/ConversationPane';
export { VoiceStage } from './ui/VoiceStage';
export { SettingsDialog } from './ui/SettingsDialog';

export {
  useAgentSession,
  MAX_TOOL_ROUNDS,
  type AgentSession,
  type AgentSeed,
  type UseAgentSessionOptions,
  type TurnStatus,
  type VoiceInteractionState,
  type VoiceStage as VoiceStageName,
  type AgentSessionError,
} from './hooks/useAgentSession';
export { useSettings } from './hooks/useSettings';
export { useViewportWidth } from './hooks/useViewportWidth';
export { useFaceState } from './hooks/useFaceState';

export { MimoTransport, parseAnnotations, MimoWebSearchDisabledError } from './transport/real';
export { MockTransport } from './transport/mock';

export {
  readSettings,
  updateSettings,
  subscribeSettings,
  isMockMode,
  isMockRequestedByUrl,
  normalizeSettings,
  SETTINGS_STORAGE_KEY,
  type SettingsPatch,
} from './settings';
export {
  loadConversations,
  saveConversations,
  createConversation,
  createMessage,
  CONVERSATIONS_STORAGE_KEY,
} from './storage';

export { faceService, type FaceServiceState, type FaceStatus } from './face/faceService';

export {
  AGENT_PANEL_WIDTH,
  SIDEBAR_MIN_WIDTH,
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
  MimoModel,
  PanelMode,
  SourceRef,
  ToolCallRecord,
} from './types';
