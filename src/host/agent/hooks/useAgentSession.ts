/**
 * 会话状态机：对话、工具循环、停止/重试、连续朗读、语音交互都收在这里，
 * UI（浮层 / 侧栏 / 全屏语音）只消费同一份状态，因此切换形态不断话。
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { isMockMode, readSettings, updateSettings as persistSettings, type SettingsPatch } from '../settings';
import { MimoTransport } from '../transport/real';
import { MockTransport } from '../transport/mock';
import {
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
  AgentSettings,
  AgentTransport,
  ChatRequestMessage,
  ChatToolCall,
  Conversation,
  Message,
  SourceRef,
  ToolDefinition,
} from '../types';
import { TtsPlayer } from '../voice/ttsPlayer';
import { VoiceRecorder } from '../voice/recorder';

/** 工具调用轮次上限：防止模型在工具之间无限循环；达到后让它直接回答 */
export const MAX_TOOL_ROUNDS = 12;

export type TurnStatus = 'idle' | 'streaming' | 'tools';
export type VoiceStage = 'idle' | 'recording' | 'transcribing' | 'speaking';

export interface VoiceInteractionState {
  /** 是否处于全屏语音交互 */
  active: boolean;
  stage: VoiceStage;
  /** 录音电平 0–1 */
  level: number;
  error: string | null;
}

export interface AgentSessionError {
  message: string;
  retryable: boolean;
}

export interface AgentSeed {
  messages?: Message[];
  title?: string;
  voice?: { active?: boolean; stage?: VoiceStage };
}

export interface UseAgentSessionOptions {
  /** 注入传输层（Mock/测试用）；不传按设置创建 */
  transport?: AgentTransport;
  /** 演示/测试用的初始会话 */
  seed?: AgentSeed;
}

export interface AgentSession {
  settings: AgentSettings;
  updateSettings: (patch: SettingsPatch) => void;
  conversations: Conversation[];
  conversation: Conversation | null;
  status: TurnStatus;
  error: AgentSessionError | null;
  voice: VoiceInteractionState;
  speakingMessageId: string | null;
  isMock: boolean;
  configured: boolean;
  toolBindings: ToolBinding[];
  send: (text: string) => Promise<void>;
  stop: () => void;
  retry: () => Promise<void>;
  dismissError: () => void;
  newConversation: () => void;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  enterVoice: () => void;
  exitVoice: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  speakMessage: (messageId: string) => void;
  toggleContinuousReading: () => void;
  stopSpeaking: () => void;
  dismissVoiceError: () => void;
}

interface ConversationStore {
  conversations: Conversation[];
  activeId: string;
}

function initStore(seed?: AgentSeed): ConversationStore {
  if (seed?.messages?.length) {
    const conversation: Conversation = {
      ...createConversation(seed.title ?? '演示会话'),
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

function mergeSources(current: SourceRef[] | undefined, incoming: SourceRef[] | undefined): SourceRef[] | undefined {
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

export function useAgentSession(options: UseAgentSessionOptions = {}): AgentSession {
  const storedSettings = useSettings();
  const [store, setStore] = useState<ConversationStore>(() => initStore(options.seed));
  const [status, setStatusState] = useState<TurnStatus>('idle');
  const [error, setError] = useState<AgentSessionError | null>(null);
  const [voice, setVoice] = useState<VoiceInteractionState>(() => ({
    active: options.seed?.voice?.active ?? false,
    stage: options.seed?.voice?.stage ?? 'idle',
    level: 0,
    error: null,
  }));
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const settingsRef = useRef<AgentSettings>(storedSettings);
  const storeRef = useRef(store);
  const statusRef = useRef<TurnStatus>('idle');
  const voiceRef = useRef(voice);
  const abortRef = useRef<AbortController | null>(null);
  const speakAbortRef = useRef<AbortController | null>(null);
  const ttsPlayerRef = useRef<TtsPlayer | null>(null);
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const lastTurnRef = useRef<{ conversationId: string; text: string } | null>(null);

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
    if (isMockMode(readSettings())) return new MockTransport();
    return new MimoTransport(() => settingsRef.current);
  }, [options.transport, storedSettings.mock]);

  const toolBindings = useMemo(() => buildToolBindings(transport.listPluginTools()), [transport]);

  // 会话持久化（流式过程中高频写入没有意义，统一防抖）
  useEffect(() => {
    const timer = setTimeout(() => {
      saveConversations(store.conversations);
      saveActiveConversationId(store.activeId);
    }, 400);
    return () => clearTimeout(timer);
  }, [store]);

  // 卸载时清理：停止生成 / 朗读 / 录音
  useEffect(
    () => () => {
      abortRef.current?.abort();
      speakAbortRef.current?.abort();
      recorderRef.current?.cancel();
      ttsPlayerRef.current?.dispose();
      ttsPlayerRef.current = null;
    },
    [],
  );

  // 录音电平轮询
  useEffect(() => {
    if (voice.stage !== 'recording') return;
    const timer = setInterval(() => {
      const level = recorderRef.current?.readLevel() ?? 0;
      setVoice((previous) =>
        previous.stage === 'recording' ? { ...previous, level } : previous,
      );
    }, 120);
    return () => clearInterval(timer);
  }, [voice.stage]);

  const updateStatus = (next: TurnStatus) => {
    statusRef.current = next;
    setStatusState(next);
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
    setVoice((previous) =>
      previous.stage === 'speaking' ? { ...previous, stage: 'idle' } : previous,
    );
  };

  const speakText = async (text: string, messageId: string): Promise<void> => {
    if (!text.trim() || !transport.isConfigured()) return;
    speakAbortRef.current?.abort();
    const controller = new AbortController();
    speakAbortRef.current = controller;
    setSpeakingMessageId(messageId);
    setVoice((previous) => ({ ...previous, stage: 'speaking', error: null }));
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
          stage: 'idle',
          error: '语音合成失败，本条回答保留为文字',
        }));
      }
    } finally {
      if (speakAbortRef.current === controller) {
        speakAbortRef.current = null;
        setSpeakingMessageId(null);
        setVoice((previous) =>
          previous.stage === 'speaking' ? { ...previous, stage: 'idle' } : previous,
        );
      }
    }
  };

  const runTurn = async (params: {
    conversationId: string;
    assistantId: string;
    baseMessages: Message[];
    text: string;
    controller: AbortController;
  }): Promise<void> => {
    const { conversationId, assistantId, baseMessages, text, controller } = params;
    const { signal } = controller;
    abortRef.current = controller;
    lastTurnRef.current = { conversationId, text };
    setError(null);
    updateStatus('streaming');

    let accumulated = '';

    const buildBindings = (): ToolBinding[] => buildToolBindings(transport.listPluginTools());
    const currentSettings = (): AgentSettings => settingsRef.current;

    try {
      let bindings = buildBindings();
      let tools: ToolDefinition[] = bindings.map((binding) => ({
        type: 'function',
        function: {
          name: binding.exposedName,
          description: binding.description,
          parameters: binding.parameters,
        },
      }));

      const makeSystemMessage = (): ChatRequestMessage => ({
        role: 'system',
        content: buildSystemPrompt({
          bindings,
          now: new Date(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || '本地时区',
          searchConfigured: Boolean(currentSettings().search.apiKey.trim()),
        }),
      });

      const history: ChatRequestMessage[] = [
        makeSystemMessage(),
        ...messagesToHistory(baseMessages, { thinking: currentSettings().thinking }),
      ];

      for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
        bindings = buildBindings();
        tools = bindings.map((binding) => ({
          type: 'function',
          function: {
            name: binding.exposedName,
            description: binding.description,
            parameters: binding.parameters,
          },
        }));
        history[0] = makeSystemMessage();

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
            } else if (event.type === 'tool_call') {
              pendingCalls.push(event.call);
            }
          },
        );

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
          const binding = findBindingByName(bindings, call.name);
          let resultText = '';
          try {
            if (call.parseError) throw new Error(call.parseError);
            const outcome = await executeTool(binding, call.name, call.args, {
              transport,
              settings: currentSettings(),
              signal,
            });
            updateMessage(conversationId, assistantId, (message) => ({
              ...message,
              toolCalls: message.toolCalls?.map((record) =>
                record.id === call.id
                  ? { ...record, status: 'success', result: outcome.result }
                  : record,
              ),
              sources: mergeSources(message.sources, outcome.sources),
            }));
            resultText = toolResultToText(outcome.result);
          } catch (toolError) {
            if (signal.aborted) throw abortError();
            const message =
              toolError instanceof Error ? toolError.message : String(toolError);
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

      const finalSettings = currentSettings();
      if (
        accumulated.trim() &&
        (finalSettings.tts.continuous || finalSettings.tts.autoPlay || voiceRef.current.active)
      ) {
        void speakText(accumulated, assistantId);
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
      const message = turnError instanceof Error ? turnError.message : String(turnError);
      updateMessage(conversationId, assistantId, (previous) => ({
        ...previous,
        status: 'error',
      }));
      updateStatus('idle');
      setError({ message, retryable: true });
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const send = async (rawText: string): Promise<void> => {
    const text = rawText.trim();
    if (!text || statusRef.current !== 'idle') return;
    if (!transport.isConfigured()) {
      setError({
        message:
          '还没有配置 MiMo API Key。请到设置 → 模型里填写，或打开「Mock 演示模式」先体验界面。',
        retryable: false,
      });
      return;
    }
    const currentStore = storeRef.current;
    const conversation = currentStore.conversations.find(
      (item) => item.id === currentStore.activeId,
    );
    if (!conversation) return;

    const userMessage = createMessage('user', text);
    const assistantMessage = createMessage('assistant', '', { status: 'streaming' });
    const baseMessages = [...conversation.messages, userMessage];

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

    await runTurn({
      conversationId: conversation.id,
      assistantId: assistantMessage.id,
      baseMessages,
      text,
      controller: new AbortController(),
    });
  };

  const stop = () => {
    abortRef.current?.abort();
    stopSpeaking();
  };

  const retry = async (): Promise<void> => {
    const lastTurn = lastTurnRef.current;
    if (!lastTurn || statusRef.current !== 'idle') return;
    const conv = storeRef.current.conversations.find(
      (item) => item.id === lastTurn.conversationId,
    );
    if (!conv) return;

    setError(null);
    const messages = conv.messages;
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
    const assistantMessage = createMessage('assistant', '', { status: 'streaming' });

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
      text: lastTurn.text,
      controller: new AbortController(),
    });
  };

  const dismissError = () => setError(null);

  const newConversation = () => {
    if (statusRef.current !== 'idle') stop();
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
    if (statusRef.current !== 'idle') stop();
    setStore((previous) =>
      previous.conversations.some((conversation) => conversation.id === id)
        ? { ...previous, activeId: id }
        : previous,
    );
  };

  const deleteConversation = (id: string) => {
    if (statusRef.current !== 'idle') stop();
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

  const enterVoice = () => {
    setVoice((previous) => ({ ...previous, active: true, error: null }));
    if (!settingsRef.current.tts.continuous) {
      persistSettings({ tts: { continuous: true } });
    }
  };

  const exitVoice = () => {
    recorderRef.current?.cancel();
    recorderRef.current = null;
    stopSpeaking();
    setVoice({ active: false, stage: 'idle', level: 0, error: null });
  };

  const startRecording = async (): Promise<void> => {
    if (
      voiceRef.current.stage === 'recording' ||
      voiceRef.current.stage === 'transcribing'
    ) {
      return;
    }
    stopSpeaking();
    const recorder = recorderRef.current ?? new VoiceRecorder();
    recorderRef.current = recorder;
    try {
      await recorder.start();
      setVoice((previous) => ({ ...previous, stage: 'recording', level: 0, error: null }));
    } catch (recordError) {
      const message =
        recordError instanceof Error ? recordError.message : String(recordError);
      setVoice((previous) => ({
        ...previous,
        stage: 'idle',
        level: 0,
        error: `无法开始录音：${message}`,
      }));
    }
  };

  const stopRecording = async (): Promise<void> => {
    const recorder = recorderRef.current;
    if (!recorder || voiceRef.current.stage !== 'recording') return;
    setVoice((previous) => ({ ...previous, stage: 'transcribing', level: 0 }));
    const controller = new AbortController();
    try {
      const audio = await recorder.stop();
      const transcript = await transport.transcribe(audio.wav, {
        signal: controller.signal,
      });
      setVoice((previous) => ({ ...previous, stage: 'idle' }));
      if (transcript.trim()) await send(transcript);
    } catch (transcribeError) {
      const message =
        transcribeError instanceof Error ? transcribeError.message : String(transcribeError);
      setVoice((previous) => ({
        ...previous,
        stage: 'idle',
        error: `语音识别失败：${message}`,
      }));
    }
  };

  const speakMessage = (messageId: string) => {
    if (speakingMessageId === messageId) {
      stopSpeaking();
      return;
    }
    const conversation = storeRef.current.conversations.find(
      (item) => item.id === storeRef.current.activeId,
    );
    const message = conversation?.messages.find((item) => item.id === messageId);
    if (message?.content.trim()) void speakText(message.content, messageId);
  };

  const toggleContinuousReading = () => {
    const currentSettings = settingsRef.current;
    const readingActive =
      currentSettings.tts.continuous ||
      Boolean(speakAbortRef.current) ||
      Boolean(ttsPlayerRef.current?.isSpeaking);
    if (readingActive) {
      persistSettings({ tts: { continuous: false } });
      stopSpeaking();
      return;
    }
    persistSettings({ tts: { continuous: true } });
    const conversation = storeRef.current.conversations.find(
      (item) => item.id === storeRef.current.activeId,
    );
    const lastAssistant = [...(conversation?.messages ?? [])]
      .reverse()
      .find(
        (message) =>
          message.role === 'assistant' &&
          message.status === 'done' &&
          message.content.trim(),
      );
    if (lastAssistant) void speakText(lastAssistant.content, lastAssistant.id);
  };

  const updateSettings = (patch: SettingsPatch) => {
    persistSettings(patch);
  };

  const dismissVoiceError = () => {
    setVoice((previous) => ({ ...previous, error: null }));
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
    stop,
    retry,
    dismissError,
    newConversation,
    selectConversation,
    deleteConversation,
    enterVoice,
    exitVoice,
    startRecording,
    stopRecording,
    speakMessage,
    toggleContinuousReading,
    stopSpeaking,
    dismissVoiceError,
  };
}
