export type FlashStrength = 'reduced' | 'standard'
export type QualityMode = 'saver' | 'standard' | 'fine'

export interface ComfortSettings {
  cameraBob: boolean
  motionBlur: boolean
  flashStrength: FlashStrength
  fieldOfView: number
  sensitivity: number
  quickTurn: boolean
  leftHanded: boolean
  largeText: boolean
  subtitlesBackground: boolean
  reducedMotion: boolean
  narrationAnnouncements: boolean
  musicVolume: number
  colorAssist: boolean
  qualityMode: QualityMode
  captions: boolean
}

export const DEFAULT_COMFORT_SETTINGS: ComfortSettings = {
  cameraBob: false,
  motionBlur: false,
  flashStrength: 'reduced',
  fieldOfView: 70,
  sensitivity: 1,
  quickTurn: true,
  leftHanded: false,
  largeText: false,
  subtitlesBackground: true,
  reducedMotion: false,
  narrationAnnouncements: true,
  musicVolume: 0.7,
  colorAssist: false,
  qualityMode: 'standard',
  captions: true,
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

export function normalizeComfortSettings(
  input: Partial<ComfortSettings>,
): ComfortSettings {
  return {
    ...DEFAULT_COMFORT_SETTINGS,
    ...input,
    fieldOfView: clamp(
      input.fieldOfView ?? DEFAULT_COMFORT_SETTINGS.fieldOfView,
      60,
      90,
    ),
    sensitivity: clamp(
      input.sensitivity ?? DEFAULT_COMFORT_SETTINGS.sensitivity,
      0.2,
      2,
    ),
    musicVolume: clamp(
      input.musicVolume ?? DEFAULT_COMFORT_SETTINGS.musicVolume,
      0,
      1,
    ),
    qualityMode: (['saver', 'standard', 'fine'] as const).includes(
      input.qualityMode as QualityMode,
    )
      ? (input.qualityMode as QualityMode)
      : DEFAULT_COMFORT_SETTINGS.qualityMode,
  }
}
