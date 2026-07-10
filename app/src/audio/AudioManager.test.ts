import { describe, expect, it, vi } from 'vitest'
import { AudioManager, type AudioAdapter } from './AudioManager'

class FakeAudioAdapter implements AudioAdapter {
  initialize = vi.fn(async () => undefined)
  transitionMusic = vi.fn(async () => undefined)
  setMusicGain = vi.fn()
  setEffectsGain = vi.fn()
  playEffect = vi.fn()
  suspend = vi.fn(async () => undefined)
  resume = vi.fn(async () => undefined)
}

describe('AudioManager', () => {
  it('語音播放時降低 BGM 並於結束後恢復', () => {
    const audio = new AudioManager(new FakeAudioAdapter())
    audio.setMusicVolume(0.8)
    audio.setNarrationActive(true)
    expect(audio.currentMusicGain()).toBeLessThan(0.4)
    audio.setNarrationActive(false)
    expect(audio.currentMusicGain()).toBeCloseTo(0.8)
  })

  it('必須等使用者操作後才初始化音訊系統', async () => {
    const adapter = new FakeAudioAdapter()
    const audio = new AudioManager(adapter)

    audio.transitionTo('exploration')
    expect(adapter.initialize).not.toHaveBeenCalled()

    await audio.unlockFromUserGesture()
    expect(adapter.initialize).toHaveBeenCalledOnce()
    expect(adapter.transitionMusic).toHaveBeenCalledWith(
      'music-exploration',
      900,
    )
  })

  it('切換情境時交叉淡化，分頁隱藏時暫停', async () => {
    const adapter = new FakeAudioAdapter()
    const audio = new AudioManager(adapter)
    await audio.unlockFromUserGesture()

    audio.transitionTo('boss')
    await audio.setPageHidden(true)
    await audio.setPageHidden(false)

    expect(adapter.transitionMusic).toHaveBeenLastCalledWith('music-boss', 900)
    expect(adapter.suspend).toHaveBeenCalledOnce()
    expect(adapter.resume).toHaveBeenCalledOnce()
  })

  it('靜音時音樂與音效增益都為零', () => {
    const adapter = new FakeAudioAdapter()
    const audio = new AudioManager(adapter)
    audio.setMuted(true)

    expect(audio.currentMusicGain()).toBe(0)
    expect(adapter.setEffectsGain).toHaveBeenLastCalledWith(0)
  })
})
