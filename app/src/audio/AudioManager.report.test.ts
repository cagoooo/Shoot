import { describe, expect, it, vi } from 'vitest'
import { AudioManager, type AudioAdapter } from './AudioManager'

class ReportAudioAdapter implements AudioAdapter {
  initialize = vi.fn(async () => undefined)
  transitionMusic = vi.fn(async () => undefined)
  setMusicGain = vi.fn()
  setEffectsGain = vi.fn()
  playEffect = vi.fn()
  suspend = vi.fn(async () => undefined)
  resume = vi.fn(async () => undefined)
}

describe('任務報告音樂', () => {
  it('進入報告畫面時播放專屬反思音樂', async () => {
    const adapter = new ReportAudioAdapter()
    const audio = new AudioManager(adapter)
    await audio.unlockFromUserGesture()

    audio.transitionTo('report')

    expect(adapter.transitionMusic).toHaveBeenLastCalledWith('music-report', 900)
  })
})
