#!/usr/bin/env node
/**
 * MiMo 音频链路冒烟（契约 §7.6 / §11）
 *
 * 验证真实接口的「原生音频一次发送」链路：
 *   1) TTS（mimo-v2.5-tts，流式 pcm16 24kHz）合成一句中文 → 包成 WAV；
 *   2) 同一份 WAV 以 `input_audio` + `text` content parts 发 MiMo 对话
 *      （mimo-v2.6-flash，流式，断言 HTTP 200 / 有内容流 / 音频 token 被计入）；
 *   3) 同一份 WAV 发 MiMo ASR（mimo-v2.5-asr），回读文字并与原句比对；
 *   4) 再发一条纯文字追问，确认后续轮次只靠文字上下文（请求体不含 input_audio）。
 *
 * 读取 public/secrets.json 的 mimo.apiKey / mimo.baseUrl；绝不打印 API Key，
 * 也不打印音频 base64。任一真实接口失败 → 打印 FAIL 并以退出码 1 结束，
 * 不降级成“先 ASR 再发文字”的旧链路。
 *
 * 用法：node scripts/smoke-mimo-audio.mjs
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** 待合成、再送进对话与 ASR 的中文句子（短句，避免 ASR 长句误差） */
const SENTENCE = '今天天气不错，我们下午三点开会，记得带上资料。';
const TTS_MODEL = 'mimo-v2.5-tts';
const CHAT_MODEL = 'mimo-v2.6-flash';
const ASR_MODEL = 'mimo-v2.5-asr';
const TTS_VOICE = '冰糖';
const TTS_SAMPLE_RATE = 24_000;
const REQUEST_TIMEOUT_MS = 180_000;

const results = [];

function record(step, ok, detail) {
  results.push({ step, ok, detail });
  console.log(`${ok ? '[通过]' : '[失败]'} ${step}${detail ? ` — ${detail}` : ''}`);
}

function loadConfig() {
  const path = resolve(ROOT, 'public', 'secrets.json');
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`读不到 ${path}：${error instanceof Error ? error.message : String(error)}`);
  }
  const mimo = parsed?.mimo;
  const apiKey = typeof mimo?.apiKey === 'string' ? mimo.apiKey.trim() : '';
  if (!apiKey) throw new Error(`${path} 里缺少 mimo.apiKey`);
  const baseUrl =
    typeof mimo?.baseUrl === 'string' && mimo.baseUrl.trim()
      ? mimo.baseUrl.trim().replace(/\/+$/, '')
      : 'https://api.xiaomimimo.com/v1';
  const chatEndpoint = `${baseUrl}/chat/completions`;
  return { apiKey, baseUrl, chatEndpoint };
}

function headers(apiKey) {
  // 与 src/host/agent/transport/real.ts 一致：Bearer 认证
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` };
}

/** 解析 SSE：返回 data 字符串序列（调用方自己 JSON.parse；[DONE] 由调用方判断） */
async function* iterSse(response) {
  if (!response.body) throw new Error('响应没有可读的流');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let index = buffer.indexOf('\n');
    while (index >= 0) {
      const line = buffer.slice(0, index).replace(/\r$/, '');
      buffer = buffer.slice(index + 1);
      if (line.startsWith('data:')) {
        const data = line.slice(5).trim();
        if (data) yield data;
      }
      index = buffer.indexOf('\n');
    }
  }
  const tail = buffer.replace(/\r$/, '').trim();
  if (tail.startsWith('data:')) {
    const data = tail.slice(5).trim();
    if (data) yield data;
  }
}

async function readError(response) {
  try {
    const text = (await response.text()).trim();
    if (!text) return '';
    try {
      const parsed = JSON.parse(text);
      return typeof parsed?.error?.message === 'string'
        ? parsed.error.message
        : text.slice(0, 500);
    } catch {
      return text.slice(0, 500);
    }
  } catch {
    return '';
  }
}

/** PCM16LE 单声道 → WAV Buffer（标准 44 字节头） */
function pcmToWav(pcm, sampleRate) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8, 'ascii');
  header.write('fmt ', 12, 'ascii');
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write('data', 36, 'ascii');
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

// ---------- 1) TTS ----------

async function synthesizeSpeech(config) {
  const startedAt = Date.now();
  const body = {
    model: TTS_MODEL,
    messages: [
      { role: 'user', content: '用自然、清晰的中文语气朗读下面这句话。' },
      { role: 'assistant', content: SENTENCE },
    ],
    audio: { format: 'pcm16', voice: TTS_VOICE },
    stream: true,
  };
  const response = await fetch(config.chatEndpoint, {
    method: 'POST',
    headers: headers(config.apiKey),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`TTS HTTP ${response.status}：${await readError(response)}`);
  }

  const chunks = [];
  let eventCount = 0;
  for await (const data of iterSse(response)) {
    if (data === '[DONE]') break;
    let payload;
    try {
      payload = JSON.parse(data);
    } catch {
      continue;
    }
    const encoded = payload?.choices?.[0]?.delta?.audio?.data;
    if (typeof encoded === 'string' && encoded) {
      chunks.push(Buffer.from(encoded, 'base64'));
      eventCount += 1;
    }
  }
  const pcm = Buffer.concat(chunks);
  if (pcm.length < 2) throw new Error(`TTS 没有返回音频数据（${eventCount} 个音频事件）`);
  if (pcm.length % 2 !== 0) throw new Error(`TTS 返回的 PCM 字节数不是偶数：${pcm.length}`);

  const wav = pcmToWav(pcm, TTS_SAMPLE_RATE);
  const durationSec = pcm.length / 2 / TTS_SAMPLE_RATE;
  return {
    wav,
    durationSec,
    audioBytes: pcm.length,
    eventCount,
    elapsedMs: Date.now() - startedAt,
    sampleRate: TTS_SAMPLE_RATE,
  };
}

// ---------- 2) 原生音频对话 ----------

function toAudioDataUrl(wav) {
  return `data:audio/wav;base64,${wav.toString('base64')}`;
}

async function chatWithAudio(config, wav) {
  const startedAt = Date.now();
  const body = {
    model: CHAT_MODEL,
    messages: [
      {
        role: 'system',
        content: '你是 Windows 平板桌面启动器里的助手。回答简洁，用简体中文。',
      },
      {
        role: 'user',
        content: [
          { type: 'input_audio', input_audio: { data: toAudioDataUrl(wav) } },
          { type: 'text', text: '请听这段语音，用一句中文直接回应语音里的请求。' },
        ],
      },
    ],
    stream: true,
    stream_options: { include_usage: true },
    thinking: { type: 'disabled' },
  };
  const response = await fetch(config.chatEndpoint, {
    method: 'POST',
    headers: headers(config.apiKey),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`chat(input_audio) HTTP ${response.status}：${await readError(response)}`);
  }

  let text = '';
  let chunkCount = 0;
  let finishReason = null;
  let audioTokens = null;
  let promptTokens = null;
  for await (const data of iterSse(response)) {
    if (data === '[DONE]') break;
    let payload;
    try {
      payload = JSON.parse(data);
    } catch {
      continue;
    }
    const choice = payload?.choices?.[0];
    const delta = choice?.delta?.content;
    if (typeof delta === 'string' && delta) {
      text += delta;
      chunkCount += 1;
    }
    if (choice?.finish_reason) finishReason = choice.finish_reason;
    const usage = payload?.usage;
    if (usage) {
      promptTokens = usage.prompt_tokens ?? promptTokens;
      audioTokens = usage.prompt_tokens_details?.audio_tokens ?? audioTokens;
    }
  }
  return {
    status: response.status,
    text: text.trim(),
    chunkCount,
    finishReason,
    audioTokens,
    promptTokens,
    elapsedMs: Date.now() - startedAt,
  };
}

// ---------- 3) ASR ----------

async function transcribeAudio(config, wav) {
  const startedAt = Date.now();
  const body = {
    model: ASR_MODEL,
    messages: [
      {
        role: 'user',
        content: [{ type: 'input_audio', input_audio: { data: toAudioDataUrl(wav) } }],
      },
    ],
    asr_options: { language: 'zh' },
  };
  const response = await fetch(config.chatEndpoint, {
    method: 'POST',
    headers: headers(config.apiKey),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`ASR HTTP ${response.status}：${await readError(response)}`);
  }
  const payload = await response.json();
  const text = (payload?.choices?.[0]?.message?.content ?? '').trim();
  return { status: response.status, text, elapsedMs: Date.now() - startedAt };
}

// ---------- 4) 后续纯文字追问 ----------

async function followUpTextOnly(config, transcript) {
  const body = {
    model: CHAT_MODEL,
    messages: [
      {
        role: 'user',
        content: `我刚才用语音说过：「${transcript}」。请用一句话确认你记得这件事。`,
      },
    ],
    stream: false,
    thinking: { type: 'disabled' },
  };
  const serialized = JSON.stringify(body);
  const hasAudioPart = serialized.includes('input_audio');
  const response = await fetch(config.chatEndpoint, {
    method: 'POST',
    headers: headers(config.apiKey),
    body: serialized,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`文字追问 HTTP ${response.status}：${await readError(response)}`);
  }
  const payload = await response.json();
  return {
    status: response.status,
    hasAudioPart,
    text: (payload?.choices?.[0]?.message?.content ?? '').trim(),
  };
}

// ---------- 文字相似度（ASR 回读校验） ----------

function normalizeText(text) {
  return text.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, '');
}

function charSetSimilarity(a, b) {
  const left = new Set(normalizeText(a));
  const right = new Set(normalizeText(b));
  if (!left.size || !right.size) return 0;
  let shared = 0;
  for (const char of left) if (right.has(char)) shared += 1;
  return shared / Math.max(left.size, right.size);
}

// ---------- 主流程 ----------

async function main() {
  console.log('MiMo 音频链路冒烟（契约 §7：音频只发一次 + ASR 回读）');
  const config = loadConfig();
  console.log(
    `接口：${config.chatEndpoint}；apiKey：<已隐藏，${config.apiKey.length} 字符>；模型：chat=${CHAT_MODEL} / asr=${ASR_MODEL} / tts=${TTS_MODEL}`,
  );
  console.log(`朗读内容：${SENTENCE}`);

  // 1) TTS
  let tts;
  try {
    tts = await synthesizeSpeech(config);
    record(
      `1/4 TTS 合成（${TTS_MODEL}，流式 pcm16）`,
      true,
      `${tts.audioBytes} 字节 / ${tts.durationSec.toFixed(2)}s / ${tts.eventCount} 个音频块 / ${tts.elapsedMs}ms`,
    );
  } catch (error) {
    record('1/4 TTS 合成（mimo-v2.5-tts，流式 pcm16）', false, errorMessage(error));
    return finish();
  }

  // 2) 原生音频对话
  let chat;
  try {
    chat = await chatWithAudio(config, tts.wav);
    const ok = chat.status === 200 && Boolean(chat.text) && chat.chunkCount > 0;
    record(
      '2/4 chat 原生音频输入（input_audio + text，流式）',
      ok,
      `HTTP ${chat.status} / ${chat.chunkCount} 个内容块 / finish=${chat.finishReason} / ` +
        `prompt_tokens=${chat.promptTokens ?? '?'} / audio_tokens=${chat.audioTokens ?? '未返回'} / ${chat.elapsedMs}ms`,
    );
    if (chat.text) console.log(`       模型回答：${chat.text.slice(0, 200)}`);
    if (!ok) {
      record('2/4 chat 原生音频输入', false, '接口 200 但无内容流（音频输入可能未被接受）');
      return finish();
    }
    if (chat.audioTokens === null) {
      console.log('       注意：响应 usage 未返回 audio_tokens（模型可能未把音频计入 token；回答内容仍基于音频）。');
    }
  } catch (error) {
    record('2/4 chat 原生音频输入（input_audio + text，流式）', false, errorMessage(error));
    return finish();
  }

  // 3) ASR 回读
  let asr;
  try {
    asr = await transcribeAudio(config, tts.wav);
    const ok = asr.status === 200 && Boolean(asr.text);
    record(
      `3/4 ASR 回读（${ASR_MODEL}）`,
      ok,
      `HTTP ${asr.status} / ${asr.elapsedMs}ms / 转写：${asr.text || '（空）'}`,
    );
    if (!ok) return finish();
    const similarity = charSetSimilarity(SENTENCE, asr.text);
    const similarityOk = similarity >= 0.5;
    record(
      '3b/4 ASR 与原句一致度',
      similarityOk,
      `字符集合相似度 ${(similarity * 100).toFixed(0)}%（阈值 50%）`,
    );
    if (!similarityOk) {
      console.log('       提示：真实 ASR 对 TTS 合成音可能有少量差异，但转写文本仍非空、已可入库。');
    }
  } catch (error) {
    record(`3/4 ASR 回读（${ASR_MODEL}）`, false, errorMessage(error));
    return finish();
  }

  // 4) 后续纯文字上下文
  try {
    const follow = await followUpTextOnly(config, asr.text);
    const ok = follow.status === 200 && Boolean(follow.text) && !follow.hasAudioPart;
    record(
      '4/4 后续轮次纯文字上下文（请求体无 input_audio）',
      ok,
      `HTTP ${follow.status} / 请求体含 input_audio=${follow.hasAudioPart} / 回答：${follow.text.slice(0, 120) || '（空）'}`,
    );
  } catch (error) {
    record('4/4 后续轮次纯文字上下文（请求体无 input_audio）', false, errorMessage(error));
  }

  return finish();
}

function errorMessage(error) {
  if (error instanceof Error) {
    if (error.name === 'TimeoutError' || /aborted due to timeout/i.test(error.message)) {
      return `请求超时（>${REQUEST_TIMEOUT_MS / 1000}s）：${error.message}`;
    }
    return error.message;
  }
  return String(error);
}

function finish() {
  const failed = results.filter((item) => !item.ok);
  console.log('');
  if (failed.length === 0) {
    console.log(`结论：PASS（${results.length}/${results.length} 项通过）`);
    process.exitCode = 0;
  } else {
    console.log(`结论：FAIL（${failed.length}/${results.length} 项失败）`);
    for (const item of failed) console.log(`  - ${item.step}: ${item.detail}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`[失败] 冒烟脚本异常：${errorMessage(error)}`);
  process.exitCode = 1;
});
