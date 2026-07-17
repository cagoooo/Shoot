const SPEECH_EVENT = 'earth-guardian-speech'
const SPEECH_PROGRESS_EVENT = 'earth-guardian-speech-progress'

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function emitSpeechText(text: string | null): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(SPEECH_EVENT, { detail: text }))
}

/** 訂閱語音朗讀內容（字幕用）；朗讀結束會收到 null。 */
export function subscribeSpeech(
  listener: (text: string | null) => void,
): () => void {
  const handler = (event: Event) => {
    listener((event as CustomEvent<string | null>).detail)
  }
  window.addEventListener(SPEECH_EVENT, handler)
  return () => window.removeEventListener(SPEECH_EVENT, handler)
}

/** 訂閱朗讀進度（已唸到的字元位置），做「唸到哪、亮到哪」的同步字幕。 */
export function subscribeSpeechProgress(
  listener: (charIndex: number) => void,
): () => void {
  const handler = (event: Event) => {
    listener((event as CustomEvent<number>).detail)
  }
  window.addEventListener(SPEECH_PROGRESS_EVENT, handler)
  return () => window.removeEventListener(SPEECH_PROGRESS_EVENT, handler)
}

function emitSpeechProgress(charIndex: number): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(SPEECH_PROGRESS_EVENT, { detail: charIndex }))
}

export function speak(text: string): void {
  if (!canSpeak()) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-TW'
  utterance.rate = 0.9
  utterance.onend = () => emitSpeechText(null)
  utterance.onerror = () => emitSpeechText(null)
  utterance.onboundary = (event) => emitSpeechProgress(event.charIndex)
  emitSpeechProgress(0)
  emitSpeechText(text)
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking(): void {
  if (!canSpeak()) return
  window.speechSynthesis.cancel()
  emitSpeechText(null)
}
