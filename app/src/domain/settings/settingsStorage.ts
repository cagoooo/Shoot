import {
  DEFAULT_COMFORT_SETTINGS,
  normalizeComfortSettings,
  type ComfortSettings,
} from './accessibility'

const COMFORT_KEY = 'earth-guardian-comfort'
const AUDIO_MUTED_KEY = 'earth-guardian-audio-muted'

function safeStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage
  } catch {
    return undefined
  }
}

export function loadComfortSettings(): ComfortSettings {
  const storage = safeStorage()
  if (!storage) return DEFAULT_COMFORT_SETTINGS
  try {
    const raw = storage.getItem(COMFORT_KEY)
    if (!raw) return DEFAULT_COMFORT_SETTINGS
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return DEFAULT_COMFORT_SETTINGS
    return normalizeComfortSettings(parsed as Partial<ComfortSettings>)
  } catch {
    return DEFAULT_COMFORT_SETTINGS
  }
}

export function saveComfortSettings(settings: ComfortSettings): void {
  try {
    safeStorage()?.setItem(COMFORT_KEY, JSON.stringify(settings))
  } catch {
    // 無法寫入（隱私模式或空間不足）時，設定僅在本次遊玩有效。
  }
}

export function loadAudioMuted(): boolean {
  try {
    return safeStorage()?.getItem(AUDIO_MUTED_KEY) === 'true'
  } catch {
    return false
  }
}

export function saveAudioMuted(muted: boolean): void {
  try {
    safeStorage()?.setItem(AUDIO_MUTED_KEY, String(muted))
  } catch {
    // 同上，寫入失敗時不影響遊玩。
  }
}
