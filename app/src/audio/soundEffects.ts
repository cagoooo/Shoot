export type SoundEffect =
  | 'select'
  | 'click'
  | 'purify'
  | 'sort'
  | 'complete'
  | 'sparkle'

type AudioContextClass = typeof AudioContext

interface ToneStep {
  freq: number
  start: number
  duration: number
  type?: OscillatorType
  gain?: number
}

/** 每種音效以幾個短促音符合成，不需外部音檔。 */
const recipes: Record<SoundEffect, ToneStep[]> = {
  select: [
    { freq: 523, start: 0, duration: 0.08, type: 'triangle' },
    { freq: 784, start: 0.06, duration: 0.1, type: 'triangle' },
  ],
  click: [{ freq: 660, start: 0, duration: 0.06, type: 'square', gain: 0.5 }],
  purify: [
    { freq: 880, start: 0, duration: 0.18, type: 'sine' },
    { freq: 440, start: 0.08, duration: 0.22, type: 'sine' },
  ],
  sort: [
    { freq: 520, start: 0, duration: 0.09, type: 'triangle' },
    { freq: 690, start: 0.05, duration: 0.12, type: 'triangle' },
  ],
  complete: [
    { freq: 523, start: 0, duration: 0.14, type: 'triangle' },
    { freq: 659, start: 0.12, duration: 0.14, type: 'triangle' },
    { freq: 784, start: 0.24, duration: 0.22, type: 'triangle' },
  ],
  sparkle: [
    { freq: 1318, start: 0, duration: 0.1, type: 'sine', gain: 0.5 },
    { freq: 1976, start: 0.07, duration: 0.16, type: 'sine', gain: 0.4 },
  ],
}

let context: AudioContext | undefined
let muted = false
let volume = 0.8

function getContextClass(): AudioContextClass | undefined {
  if (typeof globalThis === 'undefined') return undefined
  const scope = globalThis as unknown as {
    AudioContext?: AudioContextClass
    webkitAudioContext?: AudioContextClass
  }
  return scope.AudioContext ?? scope.webkitAudioContext
}

function ensureContext(): AudioContext | undefined {
  if (context) return context
  const ContextClass = getContextClass()
  if (!ContextClass) return undefined
  try {
    context = new ContextClass()
  } catch {
    return undefined
  }
  return context
}

export function setSfxMuted(next: boolean): void {
  muted = next
}

/** 測試用：清除快取的 AudioContext 與狀態。 */
export function resetSfxForTest(): void {
  context = undefined
  muted = false
  volume = 0.8
}

export function setSfxVolume(next: number): void {
  volume = Math.max(0, Math.min(1, next))
}

/** 播放一個程序化音效；靜音、無 Web Audio 或發生錯誤時安靜略過，永不擋遊戲。 */
export function playSfx(effect: SoundEffect): void {
  if (muted) return
  const ctx = ensureContext()
  if (!ctx) return
  try {
    if (ctx.state === 'suspended') void ctx.resume()
    const now = ctx.currentTime
    for (const step of recipes[effect]) {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = step.type ?? 'sine'
      oscillator.frequency.value = step.freq
      const peak = (step.gain ?? 0.7) * volume
      const startAt = now + step.start
      gain.gain.setValueAtTime(0.0001, startAt)
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), startAt + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + step.duration)
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.start(startAt)
      oscillator.stop(startAt + step.duration + 0.02)
    }
  } catch {
    // 任何 Web Audio 例外都不影響遊玩。
  }
}
