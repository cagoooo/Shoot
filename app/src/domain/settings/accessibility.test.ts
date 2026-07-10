import { describe, expect, it } from 'vitest'
import {
  DEFAULT_COMFORT_SETTINGS,
  normalizeComfortSettings,
} from './accessibility'

describe('comfort settings', () => {
  it('預設關閉視角晃動與動態模糊', () => {
    expect(DEFAULT_COMFORT_SETTINGS.cameraBob).toBe(false)
    expect(DEFAULT_COMFORT_SETTINGS.motionBlur).toBe(false)
    expect(DEFAULT_COMFORT_SETTINGS.flashStrength).toBe('reduced')
  })

  it('將視野與靈敏度限制在舒適範圍', () => {
    expect(
      normalizeComfortSettings({ fieldOfView: 200, sensitivity: 0 }),
    ).toMatchObject({ fieldOfView: 90, sensitivity: 0.2 })
  })
})
