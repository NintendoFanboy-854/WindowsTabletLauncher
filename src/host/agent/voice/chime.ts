/**
 * 人脸唤醒提示音：唤醒成功后给一声短提示，然后开始录音。
 * 音频参数属于交互反馈（不是 UI 动效），不走 motionTokens。
 */

let context: AudioContext | null = null;

export function playWakeChime(): void {
  try {
    if (typeof AudioContext === 'undefined') return;
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();
    const now = context.currentTime;
    const gain = context.createGain();
    gain.connect(context.destination);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    const tones = [
      { frequency: 880, start: 0 },
      { frequency: 1_174.66, start: 0.16 },
    ];
    for (const tone of tones) {
      const oscillator = context.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = tone.frequency;
      oscillator.connect(gain);
      oscillator.start(now + tone.start);
      oscillator.stop(now + tone.start + 0.24);
    }
  } catch {
    // 没有音频输出设备时静默失败，不影响唤醒流程
  }
}
