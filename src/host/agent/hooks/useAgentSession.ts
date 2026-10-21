/**
 * Agent 会话状态机：对话、工具循环、停止/重试、语音（原生音频一次发送 + ASR 回填）、单条播报。
 *
 * 语音链路（契约 §7）：
 * 1. `stopRecording()` 结束后先等 ASR 转写（最多 8s）：转写文本决定工具调用，纯音频
 *    的 function calling 不稳定，模型容易“回答了但没记录”；
 * 2. 转写就绪后发一轮带 `input_audio` + 转写文本的 chat 请求（只此一次）；
 *    转写超时/失败才退回纯音频请求，ASR 结果晚到仍会回填并对状态类短语补执行；
 * 3. 音频 Blob / data URL 用完即弃：不写 localStorage、不进 Message；后续轮次（工具循环）、
 *    重试、切会话、重启全部只发文字（转写失败用「（用户发来一段语音）」占位）；
 * 4. 语音提问的回复自动朗读；文字提问按 `tts.readTextReplies`；单条消息可播放/停止；
 *    新发送、开始录音、新会话、切会话、删除会话都先停止播报；TTS 失败写入 `voice.speechError`。
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  isMockRequestedByUrl,
  updateSettings as persistSettings,
  type SettingsPatch,
} from '../settings';
import { MimoTransport, wavToDataUrl } from '../transport/real';
import { MockTransport } from '../transport/mock';
import {
  VOICE_TRANSCRIPT_PLACEHOLDER,
  messagesToHistory,
  toolResultToText,
  trimHistory,
  truncateToolResult,
} from '../transport/history';
import { buildSystemPrompt } from '../transport/prompt';
import {
  buildToolBindings,
  executeTool,
  findBindingByName,
  matchPhraseTool,
  type ToolBinding,
} from '../tools/registry';
import {
  createConversation,
  createMessage,
  deriveConversationTitle,
  loadActiveConversationId,
  loadConversations,
  nowIso,
  saveActiveConversationId,
  saveConversations,
} from '../storage';
import { useSettings } from './useSettings';
import type {
  AgentErrorAction,
  AgentSettings,
  AgentTransport,
  ChatContentPart,
  ChatRequestMessage,
  ChatToolCall,
  Conversation,
  Message,
  SourceRef,
  ToolCallRecord,
  ToolDefinition,
} from '../types';
import { TtsPlayer } from '../voice/ttsPlayer';
import { VoiceRecorder, type RecordedAudio } from '../voice/recorder';

/** 工具调用轮次上限：防止模型在工具之间无限循环；达到后让它直接回答 */
export const MAX_TOOL_ROUNDS = 12;

/** 语音会话标题占位：ASR 回填后替换成首句转写 */
const VOICE_CONVERSATION_TITLE = '语音提问';

/** ASR 超时：网络挂起时 voice.stage 不能永远停在 transcribing */
const ASR_TIMEOUT_MS = 30_000;

/**
 * 语音回合开始前等 ASR 的上限：转写文本决定工具调用，纯音频不稳定。
 * 超时就退回纯音频请求（不卡住语音），ASR 晚到仍会补做状态同步。
 */
const ASR_PRE_TURN_WAIT_MS = 8_000;

/** 本轮语音请求里 text part 的指令：让模型直接回答音频里的问题，不要描述音频 */
const VOICE_AUDIO_INSTRUCTION = '请听上面这段用户语音，直接回答用户的问题；不要描述音频本身。';

/** 转写文本与音频一起发，让模型按文字做工具调用；音频只保留语气信息 */
function voiceTranscriptInstruction(transcript: string): string {
  return `用户语音转写：「${transcript}」。请按转写内容直接回答或执行操作，不要描述音频本身。`;
}

/** 会话错误提示：没配 MiMo Key 时统一话术 */
const CONFIGURATION_ERROR_MESSAGE =
  '还没有配置 MiMo API Key。请到设置 → 模型里填写后再试。';

export type TurnStatus = 'idle' | 'streaming' | 'tools';

/** 契约 §8：声音状态机（没有 active/continuous，只有录音、转写与两类错误） */
export interface AgentVoiceState {
  stage: 'idle' | 'recording' | 'transcribing';
  /** 0..1 实时录音电平 */
  level: number;
  /** 本次录音时长（秒） */
  durationSec: number;
  error: { kind: 'mic' | 'asr'; message: string } | null;
  /** TTS 失败（一次性提示，dismissSpeechError 清除） */
  speechError: string | null;
}

export interface AgentSessionError {
  message: string;
  retryable: boolean;
  /** 可选操作入口（如「去 MiMo 控制台开通 Web Search」） */
  action?: AgentErrorAction;
}

export interface AgentSeed {
  messages?: Message[];
  title?: string;
}

export interface UseAgentSessionOptions {
  /** 注入传输层（测试或截图用）；不传按 URL 参数创建 */
  transport?: AgentTransport;
  /** 测试或截图用的初始会话 */
  seed?: AgentSeed;
}

/** 契约 §8：W1 的 UI 只依赖这个接口 */
export interface AgentSession {
  settings: AgentSettings;
  updateSettings: (patch: SettingsPatch) => void;
  conversations: Conversation[];
  conversation: Conversation | null;
  status: TurnStatus;
  error: AgentSessionError | null;
  voice: AgentVoiceState;
  speakingMessageId: string | null;
  isMock: boolean;
  configured: boolean;
  toolBindings: ToolBinding[];
  /** 打字发送（无音频） */
  send: (text: string) => Promise<void>;
  /** 开始录音；已在录音/转写时忽略 */
  startRecording: () => Promise<void>;
  /** 结束录音：立即发送音频（原生 input_audio）+ 并行 ASR 回填文字 */
  stopRecording: () => Promise<void>;
  /** 取消录音（不发送、不留消息） */
  cancelRecording: () => void;
  stop: () => void;
  retry: () => Promise<void>;
  dismissError: () => void;
  dismissSpeechError: () => void;
  newConversation: () => void;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  /** 单条朗读/停止切换；失败写入 voice.speechError */
  speakMessage: (messageId: string) => void;
  stopSpeaking: () => void;
}

interface ConversationStore {
  conversations: Conversation[];
  activeId: string;
}

/** 本轮语音请求的临时音频上下文：只在首次请求使用，之后清空 */
interface VoiceTurnContext {
  dataUrl: string;
  /** ASR 回填结果；null 表示还没返回或转写失败 */
  transcript: { text: string | null };
}

interface RunTurnParams {
  conversationId: string;
  assistantId: string;
  baseMessages: Message[];
  controller: AbortController;
  /** 有值 = 本轮是语音提问：首次请求带 input_audio */
  voice?: VoiceTurnContext;
  /** 本轮回复是否强制朗读（语音提问 / 重试语音提问） */
  forceRead?: boolean;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function initStore(seed?: AgentSeed): ConversationStore {
  if (seed?.messages?.length) {
    const conversation: Conversation = {
      ...createConversation(seed.title ?? '示例会话'),
      messages: seed.messages,
    };
    return { conversations: [conversation], activeId: conversation.id };
  }
  const saved = loadConversations();
  if (saved.length === 0) {
    const conversation = createConversation();
    return { conversations: [conversation], activeId: conversation.id };
  }
  const savedActive = loadActiveConversationId();
  const activeId = saved.some((conversation) => conversation.id === savedActive)
    ? (savedActive as string)
    : saved[saved.length - 1].id;
  return { conversations: saved, activeId };
}

function mergeSources(
  current: SourceRef[] | undefined,
  incoming: SourceRef[] | undefined,
): SourceRef[] | undefined {
  if (!incoming?.length) return current;
  const merged = [...(current ?? [])];
  for (const source of incoming) {
    if (!merged.some((item) => item.url === source.url)) merged.push(source);
  }
  return merged.slice(0, 12);
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value ?? {});
  } catch {
    return '{}';
  }
}

function abortError(): DOMException {
  return new DOMException('用户已停止生成', 'AbortError');
}

/** 找 history 里最后一条 user 消息的下标（= 本轮用户消息） */
function lastUserIndex(history: ChatRequestMessage[]): number {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index].role === 'user') return index;
  }
  return -1;
}

function initialVoiceState(): AgentVoiceState {
  return { stage: 'idle', level: 0, durationSec: 0, error: null, speechError: null };
}

export function useAgentSession(options: UseAgentSessionOptions = {}): AgentSession {
  const storedSettings = useSettings();
  const [store, setStore] = useState<ConversationStore>(() => initStore(options.seed));
  const [status, setStatusState] = useState<TurnStatus>('idle');
  const [error, setError] = useState<AgentSessionError | null>(null);
  const [voice, setVoice] = useState<AgentVoiceState>(initialVoiceState);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const settingsRef = useRef<AgentSettings>(storedSettings);
  const storeRef = useRef(store);
  const statusRef = useRef<TurnStatus>('idle');
  const voiceRef = useRef(voice);
  const abortRef = useRef<AbortController | null>(null);
  const speakAbortRef = useRef<AbortController | null>(null);
  const asrAbortRef = useRef<AbortController | null>(null);
  const ttsPlayerRef = useRef<TtsPlayer | null>(null);
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const recordingStartedAtRef = useRef<number | null>(null);
  const recordingStartingRef = useRef(false);
  /** recorder.start() 还在 await 时用户已取消（<300ms 快速点按空格） */
  const recordingCancelRequestedRef = useRef(false);
  const mountedRef = useRef(true);
  /** 每次 voice turn 的序号：旧 ASR 结果不能覆盖新录音/新消息的状态 */
  const voiceTurnTokenRef = useRef(0);
  const lastTurnRef = useRef<{ conversationId: string } | null>(null);

  useEffect(() => {
    settingsRef.current = storedSettings;
  }, [storedSettings]);
  useEffect(() => {
    storeRef.current = store;
  }, [store]);
  useEffect(() => {
    voiceRef.current = voice;
  }, [voice]);

  const transport = useMemo<AgentTransport>(() => {
    if (options.transport) return options.transport;
    if (isMockRequestedByUrl()) return new MockTransport();
    return new MimoTransport(() => settingsRef.current);
  }, [options.transport]);

  const toolBindings = useMemo(() => buildToolBindings(transport.listPluginTools()), [transport]);

  // 会话持久化（流式过程中高频写入没有意义，统一防抖）
  useEffect(() => {
    const timer = setTimeout(() => {
      saveConversations(store.conversations);
      saveActiveConversationId(store.activeId);
    }, 400);
    return () => clearTimeout(timer);
  }, [store]);

  // 卸载时清理：停止生成 / 朗读 / ASR / 录音
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      speakAbortRef.current?.abort();
      asrAbortRef.current?.abort();
      recorderRef.current?.cancel();
      ttsPlayerRef.current?.dispose();
      ttsPlayerRef.current = null;
    };
  }, []);

  // 录音电平 / 时长轮询
  useEffect(() => {
    if (voice.stage !== 'recording') return;
    const timer = setInterval(() => {
      const level = recorderRef.current?.readLevel() ?? 0;
      const startedAt = recordingStartedAtRef.current;
      const durationSec = startedAt ? (Date.now() - startedAt) / 1000 : 0;
      setVoice((previous) =>
        previous.stage === 'recording' ? { ...previous, level, durationSec } : previous,
      );
    }, 120);
    return () => clearInterval(timer);
  }, [voice.stage]);

  const updateStatus = (next: TurnStatus) => {
    statusRef.current = next;
    setStatusState(next);
  };

  const activeConversation = (): Conversation | null => {
    const current = storeRef.current;
    return current.conversations.find((item) => item.id === current.activeId) ?? null;
  };

  const updateMessage = (
    conversationId: string,
    messageId: string,
    updater: (message: Message) => Message,
  ) => {
    setStore((previous) => ({
      ...previous,
      conversations: previous.conversations.map((conversation) =>
        conversation.id !== conversationId
          ? conversation
          : {
              ...conversation,
              updatedAt: nowIso(),
              messages: conversation.messages.map((message) =>
                message.id === messageId ? updater(message) : message,
              ),
            },
      ),
    }));
  };

  const getTtsPlayer = (): TtsPlayer => {
    if (!ttsPlayerRef.current) ttsPlayerRef.current = new TtsPlayer();
    return ttsPlayerRef.current;
  };

  const stopSpeaking = () => {
    speakAbortRef.current?.abort();
    speakAbortRef.current = null;
    ttsPlayerRef.current?.stop();
    setSpeakingMessageId(null);
  };

  /** 朗读一段文本；失败不再静默，写入 voice.speechError */
  const speakText = async (text: string, messageId: string): Promise<void> => {
    if (!text.trim() || !transport.isConfigured()) return;
    speakAbortRef.current?.abort();
    const controller = new AbortController();
    speakAbortRef.current = controller;
    setSpeakingMessageId(messageId);
    try {
      await getTtsPlayer().speak({
        transport,
        text,
        voice: settingsRef.current.tts.voice,
        rate: settingsRef.current.tts.rate,
        signal: controller.signal,
      });
    } catch (speakError) {
      if (!controller.signal.aborted) {
        setVoice((previous) => ({
          ...previous,
          speechError: `语音合成失败：${errorMessage(speakError)}`,
        }));
      }
    } finally {
      if (speakAbortRef.current === controller) {
        speakAbortRef.current = null;
        setSpeakingMessageId(null);
      }
    }
  };

  /**
   * 用户整句命中插件声明的短语（如「我站起来了」）时，宿主先执行工具再让模型确认：
   * - 状态在点发送 / 说完的瞬间就写进插件，卡片与详情靠 storage 事件立即同步，
   *   不依赖模型是否愿意调工具；
   * - 工具结果以 assistant.toolCalls 进对话，模型只负责一句措辞，不会编造“已记录”。
   */
  const runPhraseTool = async (
    binding: ToolBinding,
    signal: AbortSignal,
  ): Promise<ToolCallRecord> => {
    const record: ToolCallRecord = {
      id: `phrase-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: binding.originalName,
      args: {},
      status: 'running',
    };
    try {
      // 插件 iframe 异常时不能让发送流程一直等：5s 内拿不到结果就回落给模型解释
      const result = await Promise.race([
        transport.callPluginTool(binding.originalName, {}, { signal }),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error('工具执行超时')), 5_000);
        }),
      ]);
      return { ...record, status: 'success', result };
    } catch (error) {
      return { ...record, status: 'error', error: errorMessage(error) };
    }
  };

  const runTurn = async (params: RunTurnParams): Promise<void> => {
    const { conversationId, assistantId, baseMessages, controller, voice: voiceTurn } = params;
    const { signal } = controller;
    abortRef.current = controller;
    lastTurnRef.current = { conversationId };
    setError(null);
    updateStatus('streaming');

    let accumulated = '';

    let audioParts: ChatContentPart[] | null = voiceTurn
      ? [
          { type: 'input_audio', input_audio: { data: voiceTurn.dataUrl } },
          {
            type: 'text',
            text: voiceTurn.transcript.text
              ? voiceTranscriptInstruction(voiceTurn.transcript.text)
              : VOICE_AUDIO_INSTRUCTION,
          },
        ]
      : null;

    const buildBindings = (): ToolBinding[] => buildToolBindings(transport.listPluginTools());
    const currentSettings = (): AgentSettings => settingsRef.current;

    const voiceText = (): string =>
      voiceTurn?.transcript.text?.trim() || VOICE_TRANSCRIPT_PLACEHOLDER;

    try {
      const bindings = buildBindings();
      const history: ChatRequestMessage[] = [
        {
          role: 'system',
          content: buildSystemPrompt({
            bindings,
            now: new Date(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || '本地时区',
            webSearchEnabled: currentSettings().search.enabled,
          }),
        },
        ...messagesToHistory(baseMessages, { thinking: currentSettings().thinking }),
      ];
      const voiceUserIndex = voiceTurn ? lastUserIndex(history) : -1;

      for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
        const roundBindings = buildBindings();
        const tools: ToolDefinition[] = roundBindings.map((binding) => ({
          type: 'function',
          function: {
            name: binding.exposedName,
            description: binding.description,
            parameters: binding.parameters,
          },
        }));
        history[0] = {
          role: 'system',
          content: buildSystemPrompt({
            bindings: roundBindings,
            now: new Date(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || '本地时区',
            webSearchEnabled: currentSettings().search.enabled,
          }),
        };

        // 只有“本轮语音”的第一次请求带音频；其余轮次/历史一律文字
        if (voiceUserIndex >= 0) {
          history[voiceUserIndex] =
            round === 0 && audioParts
              ? { role: 'user', content: audioParts }
              : { role: 'user', content: voiceText() };
        }

        const pendingCalls: ChatToolCall[] = [];
        let roundText = '';
        let roundReasoning = '';

        await transport.streamChat(
          {
            model: currentSettings().model,
            messages: trimHistory(history, currentSettings().model),
            tools,
            thinking: currentSettings().thinking,
            signal,
          },
          (event) => {
            if (event.type === 'content') {
              accumulated += event.text;
              roundText += event.text;
              updateMessage(conversationId, assistantId, (message) => ({
                ...message,
                content: message.content + event.text,
              }));
            } else if (event.type === 'reasoning') {
              roundReasoning += event.text;
              updateMessage(conversationId, assistantId, (message) => ({
                ...message,
                reasoning: (message.reasoning ?? '') + event.text,
              }));
            } else if (event.type === 'sources') {
              updateMessage(conversationId, assistantId, (message) => ({
                ...message,
                sources: mergeSources(message.sources, event.sources),
              }));
            } else if (event.type === 'usage') {
              updateMessage(conversationId, assistantId, (message) => ({
                ...message,
                webSearchUsage: event.webSearchUsage,
              }));
            } else if (event.type === 'tool_call') {
              pendingCalls.push(event.call);
            }
          },
        );

        // 音频用完即弃：第一次请求发出去后立刻清空 data URL，历史改回文字
        if (voiceUserIndex >= 0) {
          history[voiceUserIndex] = { role: 'user', content: voiceText() };
        }
        if (audioParts) {
          audioParts = null;
          if (voiceTurn) voiceTurn.dataUrl = '';
        }

        if (signal.aborted) throw abortError();

        if (pendingCalls.length === 0) {
          if (!accumulated.trim()) {
            updateMessage(conversationId, assistantId, (message) => ({
              ...message,
              content: message.content || '（模型没有返回内容，可以重试一次）',
            }));
          }
          break;
        }

        updateMessage(conversationId, assistantId, (message) => ({
          ...message,
          toolCalls: [
            ...(message.toolCalls ?? []),
            ...pendingCalls.map((call) => ({
              id: call.id,
              name: call.name,
              args: call.args,
              status: 'running' as const,
            })),
          ],
        }));

        history.push({
          role: 'assistant',
          content: roundText.trim() ? roundText : null,
          tool_calls: pendingCalls.map((call) => ({
            id: call.id,
            type: 'function',
            function: {
              name: call.name,
              arguments: call.rawArguments ?? safeStringify(call.args),
            },
          })),
          reasoning_content:
            currentSettings().thinking && roundReasoning ? roundReasoning : undefined,
        });

        updateStatus('tools');
        for (const call of pendingCalls) {
          const binding = findBindingByName(roundBindings, call.name);
          let resultText = '';
          try {
            if (call.parseError) throw new Error(call.parseError);
            const outcome = await executeTool(binding, call.name, call.args, {
              transport,
              signal,
            });
            updateMessage(conversationId, assistantId, (message) => ({
              ...message,
              toolCalls: message.toolCalls?.map((record) =>
                record.id === call.id
                  ? { ...record, status: 'success', result: outcome.result }
                  : record,
              ),
            }));
            resultText = toolResultToText(outcome.result);
          } catch (toolError) {
            if (signal.aborted) throw abortError();
            const message = errorMessage(toolError);
            updateMessage(conversationId, assistantId, (previous) => ({
              ...previous,
              toolCalls: previous.toolCalls?.map((record) =>
                record.id === call.id
                  ? { ...record, status: 'error', error: message }
                  : record,
              ),
            }));
            resultText = `错误：${message}`;
          }
          history.push({
            role: 'tool',
            tool_call_id: call.id,
            content: truncateToolResult(resultText, currentSettings().model),
          });
        }

        if (round === MAX_TOOL_ROUNDS - 1) {
          updateMessage(conversationId, assistantId, (message) => ({
            ...message,
            content: `${message.content}${message.content ? '\n\n' : ''}（工具调用轮次已达上限，先直接回答。）`,
          }));
          break;
        }
        updateStatus('streaming');
      }

      updateMessage(conversationId, assistantId, (message) => ({
        ...message,
        status: 'done',
      }));
      updateStatus('idle');

      // 播报：autoRead 总开关关闭时一律不自动读；开启时语音提问必读、文字提问按设置。
      // mock 下 synthesize 为静音，状态机照走。
      if (!signal.aborted && accumulated.trim()) {
        const tts = currentSettings().tts;
        const shouldRead = tts.autoRead && (Boolean(params.forceRead) || tts.readTextReplies);
        if (shouldRead) void speakText(accumulated, assistantId);
      }
    } catch (turnError) {
      if (signal.aborted) {
        updateMessage(conversationId, assistantId, (message) => ({
          ...message,
          status: 'aborted',
        }));
        updateStatus('idle');
        return;
      }
      const message = errorMessage(turnError);
      updateMessage(conversationId, assistantId, (previous) => ({
        ...previous,
        status: 'error',
      }));
      updateStatus('idle');
      const action = (turnError as { action?: AgentErrorAction }).action;
      setError({ message, retryable: true, ...(action ? { action } : {}) });
    } finally {
      // 无论成功/失败/中止，音频 data URL 都不留在内存里
      if (voiceTurn) voiceTurn.dataUrl = '';
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const send = async (rawText: string): Promise<void> => {
    const text = rawText.trim();
    if (!text || statusRef.current !== 'idle') return;
    if (voiceRef.current.stage !== 'idle') return;
    if (!transport.isConfigured()) {
      setError({ message: CONFIGURATION_ERROR_MESSAGE, retryable: false });
      return;
    }
    stopSpeaking();
    const conversation = activeConversation();
    if (!conversation) return;

    const controller = new AbortController();
    const userMessage = createMessage('user', text, { input: 'text' });
    const assistantMessage = createMessage('assistant', '', { status: 'streaming' });
    /** 状态类短语（我站起来了 / 我坐下了）由宿主直接执行，不等模型决定 */
    const phraseTool = matchPhraseTool(
      buildToolBindings(transport.listPluginTools()),
      text,
    );

    setStore((previous) => ({
      ...previous,
      conversations: previous.conversations.map((item) =>
        item.id !== conversation.id
          ? item
          : {
              ...item,
              title:
                item.messages.length === 0 ? deriveConversationTitle(text) : item.title,
              updatedAt: nowIso(),
              messages: [...item.messages, userMessage, assistantMessage],
            },
      ),
    }));

    let baseMessages: Message[] = [...conversation.messages, userMessage];
    if (phraseTool) {
      const record = await runPhraseTool(phraseTool, controller.signal);
      updateMessage(conversation.id, assistantMessage.id, (message) => ({
        ...message,
        toolCalls: [record],
      }));
      baseMessages = [...baseMessages, { ...assistantMessage, toolCalls: [record] }];
    }

    await runTurn({
      conversationId: conversation.id,
      assistantId: assistantMessage.id,
      baseMessages,
      controller,
    });
  };

  const stop = () => {
    abortRef.current?.abort();
    stopSpeaking();
  };

  const retry = async (): Promise<void> => {
    const lastTurn = lastTurnRef.current;
    if (!lastTurn || statusRef.current !== 'idle') return;
    if (voiceRef.current.stage !== 'idle') return;
    const conversation = storeRef.current.conversations.find(
      (item) => item.id === lastTurn.conversationId,
    );
    if (!conversation) return;

    setError(null);
    const messages = conversation.messages;
    let lastAssistantIndex = -1;
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === 'assistant') {
        lastAssistantIndex = index;
        break;
      }
    }
    const lastAssistant = lastAssistantIndex >= 0 ? messages[lastAssistantIndex] : null;
    const failed =
      lastAssistant !== null &&
      (lastAssistant.status === 'error' || lastAssistant.status === 'aborted');
    const baseMessages = failed ? messages.slice(0, lastAssistantIndex) : messages;
    // 重试只发文字：语音消息的历史内容是 ASR 文字（没有时用占位），这里不会重建 audio part
    const lastUserMessage = [...baseMessages].reverse().find((item) => item.role === 'user');
    const assistantMessage = createMessage('assistant', '', { status: 'streaming' });

    stopSpeaking();
    setStore((previous) => ({
      ...previous,
      conversations: previous.conversations.map((item) =>
        item.id !== lastTurn.conversationId
          ? item
          : {
              ...item,
              updatedAt: nowIso(),
              messages: [...baseMessages, assistantMessage],
            },
      ),
    }));

    await runTurn({
      conversationId: lastTurn.conversationId,
      assistantId: assistantMessage.id,
      baseMessages,
      controller: new AbortController(),
      forceRead: lastUserMessage?.input === 'voice',
    });
  };

  const dismissError = () => {
    setError(null);
    setVoice((previous) => (previous.error ? { ...previous, error: null } : previous));
  };

  const dismissSpeechError = () => {
    setVoice((previous) =>
      previous.speechError ? { ...previous, speechError: null } : previous,
    );
  };

  const newConversation = () => {
    stopSpeaking();
    if (statusRef.current !== 'idle') abortRef.current?.abort();
    if (voiceRef.current.stage === 'recording') {
      recorderRef.current?.cancel();
      recorderRef.current = null;
      recordingStartedAtRef.current = null;
      setVoice((previous) => ({ ...previous, stage: 'idle', level: 0, durationSec: 0 }));
    }
    const conversation = createConversation();
    setStore((previous) => ({
      conversations: [
        conversation,
        ...previous.conversations.filter((item) => item.messages.length > 0),
      ],
      activeId: conversation.id,
    }));
  };

  const selectConversation = (id: string) => {
    stopSpeaking();
    if (statusRef.current !== 'idle') abortRef.current?.abort();
    setStore((previous) =>
      previous.conversations.some((conversation) => conversation.id === id)
        ? { ...previous, activeId: id }
        : previous,
    );
  };

  const deleteConversation = (id: string) => {
    stopSpeaking();
    if (statusRef.current !== 'idle') abortRef.current?.abort();
    setStore((previous) => {
      const remaining = previous.conversations.filter(
        (conversation) => conversation.id !== id,
      );
      if (remaining.length === 0) {
        const conversation = createConversation();
        return { conversations: [conversation], activeId: conversation.id };
      }
      return {
        conversations: remaining,
        activeId:
          previous.activeId === id ? remaining[remaining.length - 1].id : previous.activeId,
      };
    });
  };

  const startRecording = async (): Promise<void> => {
    if (voiceRef.current.stage !== 'idle' || recordingStartingRef.current) return;
    // 正在生成回答时不叠新录音（避免两条 turn 并发写同一会话）
    if (statusRef.current !== 'idle') return;
    if (!transport.isConfigured()) {
      setError({ message: CONFIGURATION_ERROR_MESSAGE, retryable: false });
      return;
    }
    // 开始录音前先停止播报（契约 §5）
    stopSpeaking();
    recordingStartingRef.current = true;
    recordingCancelRequestedRef.current = false;
    const recorder = recorderRef.current ?? new VoiceRecorder();
    recorderRef.current = recorder;
    try {
      await recorder.start();
    } catch (recordError) {
      if (recorderRef.current === recorder) recorderRef.current = null;
      recordingStartingRef.current = false;
      const next: AgentVoiceState = {
        ...voiceRef.current,
        stage: 'idle',
        level: 0,
        durationSec: 0,
        error: { kind: 'mic', message: `无法开始录音：${errorMessage(recordError)}` },
      };
      voiceRef.current = next;
      setVoice(next);
      return;
    }
    recordingStartingRef.current = false;
    if (recorderRef.current !== recorder) return;
    // 启动过程中用户已经松开空格（<300ms）：取消，不进入录音态
    if (recordingCancelRequestedRef.current) {
      recordingCancelRequestedRef.current = false;
      recorder.cancel();
      recorderRef.current = null;
      recordingStartedAtRef.current = null;
      const next: AgentVoiceState = {
        ...voiceRef.current,
        stage: 'idle',
        level: 0,
        durationSec: 0,
        error: null,
      };
      voiceRef.current = next;
      setVoice(next);
      return;
    }
    recordingStartedAtRef.current = Date.now();
    // voiceRef 同步更新：空格 keyup/取消逻辑在 React 渲染前就要读到 recording
    const next: AgentVoiceState = {
      ...voiceRef.current,
      stage: 'recording',
      level: 0,
      durationSec: 0,
      error: null,
    };
    voiceRef.current = next;
    setVoice(next);
  };

  const stopRecording = async (): Promise<void> => {
    const recorder = recorderRef.current;
    if (!recorder || voiceRef.current.stage !== 'recording') return;

    setVoice((previous) => ({ ...previous, stage: 'transcribing', level: 0 }));
    let audio: RecordedAudio;
    try {
      audio = await recorder.stop();
    } catch (recordError) {
      if (recorderRef.current === recorder) recorderRef.current = null;
      recordingStartedAtRef.current = null;
      setVoice((previous) => ({
        ...previous,
        stage: 'idle',
        level: 0,
        error: { kind: 'mic', message: `录音失败：${errorMessage(recordError)}` },
      }));
      return;
    }
    if (recorderRef.current === recorder) recorderRef.current = null;
    recordingStartedAtRef.current = null;

    const conversation = activeConversation();
    if (!conversation) {
      setVoice((previous) => ({ ...previous, stage: 'idle', level: 0 }));
      return;
    }
    if (!transport.isConfigured()) {
      setVoice((previous) => ({ ...previous, stage: 'idle', level: 0 }));
      setError({ message: CONFIGURATION_ERROR_MESSAGE, retryable: false });
      return;
    }

    const durationSec = Math.round(audio.durationSec * 10) / 10;
    const userMessage = createMessage('user', '', {
      input: 'voice',
      voicePeaks: audio.peaks,
      voiceDurationSec: durationSec,
      transcriptStatus: 'pending',
    });
    const assistantMessage = createMessage('assistant', '', { status: 'streaming' });
    const isFirstMessage = conversation.messages.length === 0;

    setStore((previous) => ({
      ...previous,
      conversations: previous.conversations.map((item) =>
        item.id !== conversation.id
          ? item
          : {
              ...item,
              title: isFirstMessage ? VOICE_CONVERSATION_TITLE : item.title,
              updatedAt: nowIso(),
              messages: [...item.messages, userMessage, assistantMessage],
            },
      ),
    }));

    // 音频 data URL 只存在于本轮请求；Message / localStorage 里没有它
    let dataUrl: string;
    try {
      dataUrl = await wavToDataUrl(audio.wav);
    } catch (audioError) {
      updateMessage(conversation.id, userMessage.id, (message) => ({
        ...message,
        transcriptStatus: 'failed',
      }));
      setVoice((previous) => ({
        ...previous,
        stage: 'idle',
        level: 0,
        error: { kind: 'asr', message: `无法准备音频：${errorMessage(audioError)}` },
      }));
      return;
    }

    const voiceTurn: VoiceTurnContext = { dataUrl, transcript: { text: null } };
    const controller = new AbortController();
    const asrToken = voiceTurnTokenRef.current + 1;
    voiceTurnTokenRef.current = asrToken;

    // 1) 先等 ASR 转写：模型靠文字判断要不要调工具才可靠（纯音频常出现
    //    “嘴上说已记录、实际没调工具”）。最多等 ASR_PRE_TURN_WAIT_MS，
    //    超时先按纯音频请求，转写晚到仍会补做状态同步。
    const asrController = new AbortController();
    asrAbortRef.current = asrController;
    let asrTimedOut = false;
    const asrTimer = window.setTimeout(() => {
      asrTimedOut = true;
      asrController.abort();
    }, ASR_TIMEOUT_MS);
    const asrTask = (async () => {
      try {
        const transcript = (
          await transport.transcribe(audio.wav, { signal: asrController.signal })
        ).trim();
        if (!transcript) throw new Error('语音识别没有返回文字');
        voiceTurn.transcript.text = transcript;
        updateMessage(conversation.id, userMessage.id, (message) => ({
          ...message,
          content: transcript,
          transcriptStatus: 'ready',
        }));
        setStore((previous) => ({
          ...previous,
          conversations: previous.conversations.map((item) =>
            item.id !== conversation.id || item.title !== VOICE_CONVERSATION_TITLE
              ? item
              : { ...item, title: deriveConversationTitle(transcript) },
          ),
        }));
      } catch (transcribeError) {
        // 超时也要落到 failed/idle 并提示；只有“用户主动取消/卸载”才静默
        if (asrTimedOut || !asrController.signal.aborted) {
          updateMessage(conversation.id, userMessage.id, (message) => ({
            ...message,
            transcriptStatus: 'failed',
          }));
          if (voiceTurnTokenRef.current === asrToken) {
            setVoice((previous) => ({
              ...previous,
              stage: 'idle',
              level: 0,
              error: {
                kind: 'asr',
                message: asrTimedOut
                  ? '语音识别超时，可以再说一次'
                  : `语音识别失败：${errorMessage(transcribeError)}`,
              },
            }));
          }
        }
      } finally {
        window.clearTimeout(asrTimer);
        if (asrAbortRef.current === asrController) asrAbortRef.current = null;
        if (voiceTurnTokenRef.current === asrToken && mountedRef.current) {
          setVoice((previous) =>
            previous.stage === 'transcribing'
              ? { ...previous, stage: 'idle', level: 0 }
              : previous,
          );
        }
      }
    })();
    await Promise.race([
      asrTask,
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, ASR_PRE_TURN_WAIT_MS);
      }),
    ]);

    // 2) 转写已到手：状态类短语（我站起来了 / 我坐下了）由宿主直接执行，
    //    卡片/详情立即同步；模型只负责一句确认，不会“说了却没记录”。
    let baseMessages: Message[] = [...conversation.messages, userMessage];
    const earlyTranscript = voiceTurn.transcript.text;
    if (earlyTranscript) {
      const phraseTool = matchPhraseTool(
        buildToolBindings(transport.listPluginTools()),
        earlyTranscript,
      );
      if (phraseTool) {
        const record = await runPhraseTool(phraseTool, controller.signal);
        updateMessage(conversation.id, assistantMessage.id, (message) => ({
          ...message,
          toolCalls: [record],
        }));
        baseMessages = [...baseMessages, { ...assistantMessage, toolCalls: [record] }];
      }
    }

    // 3) 带音频 + 转写文本的对话请求（转写失败/超时才退回纯音频）
    void runTurn({
      conversationId: conversation.id,
      assistantId: assistantMessage.id,
      baseMessages,
      controller,
      voice: voiceTurn,
      forceRead: true,
    });

    // 4) 转写晚于请求返回（8s 超时场景）：命中状态短语时补执行一次，
    //    保证“说了就记录”；重复执行会返回状态错误，忽略即可。
    if (!earlyTranscript) {
      void asrTask.then(() => {
        const lateTranscript = voiceTurn.transcript.text;
        if (!lateTranscript || controller.signal.aborted) return;
        const lateTool = matchPhraseTool(
          buildToolBindings(transport.listPluginTools()),
          lateTranscript,
        );
        if (!lateTool) return;
        void runPhraseTool(lateTool, controller.signal).then((record) => {
          if (record.status !== 'success') return;
          updateMessage(conversation.id, assistantMessage.id, (message) => ({
            ...message,
            toolCalls: [...(message.toolCalls ?? []), record],
          }));
        });
      });
    }
  };

  const cancelRecording = (): void => {
    // recorder.start() 还在 await：先记下取消意图，start 完成后由 startRecording 自己清理
    if (recordingStartingRef.current) {
      recordingCancelRequestedRef.current = true;
      return;
    }
    if (voiceRef.current.stage !== 'recording') return;
    recorderRef.current?.cancel();
    recorderRef.current = null;
    recordingStartedAtRef.current = null;
    const next: AgentVoiceState = {
      ...voiceRef.current,
      stage: 'idle',
      level: 0,
      durationSec: 0,
    };
    voiceRef.current = next;
    setVoice(next);
  };

  const speakMessage = (messageId: string) => {
    if (speakingMessageId === messageId) {
      stopSpeaking();
      return;
    }
    const conversation = activeConversation();
    const message = conversation?.messages.find((item) => item.id === messageId);
    if (!message || message.role !== 'assistant' || !message.content.trim()) return;
    void speakText(message.content, messageId);
  };

  const updateSettings = (patch: SettingsPatch) => {
    persistSettings(patch);
  };

  const conversation =
    store.conversations.find((item) => item.id === store.activeId) ?? null;

  return {
    settings: storedSettings,
    updateSettings,
    conversations: store.conversations,
    conversation,
    status,
    error,
    voice,
    speakingMessageId,
    isMock: transport.kind === 'mock',
    configured: transport.isConfigured(),
    toolBindings,
    send,
    startRecording,
    stopRecording,
    cancelRecording,
    stop,
    retry,
    dismissError,
    dismissSpeechError,
    newConversation,
    selectConversation,
    deleteConversation,
    speakMessage,
    stopSpeaking,
  };
}
