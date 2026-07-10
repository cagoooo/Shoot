export type FlashStrength = 'reduced' | 'standard'

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
  }
}
