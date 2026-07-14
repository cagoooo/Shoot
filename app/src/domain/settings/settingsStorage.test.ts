import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_COMFORT_SETTINGS } from './accessibility'
import {
  loadAudioMuted,
  loadComfortSettings,
  saveAudioMuted,
  saveComfortSettings,
} from './settingsStorage'

describe('settingsStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('沒有紀錄時回傳預設舒適設定與未靜音', () => {
    expect(loadComfortSettings()).toEqual(DEFAULT_COMFORT_SETTINGS)
    expect(loadAudioMuted()).toBe(false)
  })

  it('儲存後可讀回音量、色彩輔助與靜音狀態', () => {
    saveComfortSettings({
      ...DEFAULT_COMFORT_SETTINGS,
      musicVolume: 0.4,
      colorAssist: true,
    })
    saveAudioMuted(true)

    expect(loadComfortSettings()).toMatchObject({
      musicVolume: 0.4,
      colorAssist: true,
    })
    expect(loadAudioMuted()).toBe(true)
  })

  it('壞掉的 JSON 回到安全預設值', () => {
    localStorage.setItem('earth-guardian-comfort', '{not json')
    localStorage.setItem('earth-guardian-audio-muted', 'banana')

    expect(loadComfortSettings()).toEqual(DEFAULT_COMFORT_SETTINGS)
    expect(loadAudioMuted()).toBe(false)
  })

  it('超出範圍的音量會被鎖回 0 到 1', () => {
    localStorage.setItem(
      'earth-guardian-comfort',
      JSON.stringify({ musicVolume: 9 }),
    )
    expect(loadComfortSettings().musicVolume).toBe(1)
  })
})
