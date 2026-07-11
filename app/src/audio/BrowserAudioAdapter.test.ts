import { describe, expect, it, vi } from 'vitest'
import { BrowserAudioAdapter, type BrowserAudioElement } from './BrowserAudioAdapter'

const makeAudio = (): BrowserAudioElement => ({
  loop: false,
  volume: 1,
  paused: true,
  play: vi.fn(async () => undefined),
  pause: vi.fn(),
})

describe('BrowserAudioAdapter', () => {
  it('只載入已核可的音樂，並以網站基底路徑播放', async () => {
    const audio = makeAudio()
    const createAudio = vi.fn(() => audio)
    const adapter = new BrowserAudioAdapter('/Shoot/', createAudio, async () => [
      {
        id: 'music-base',
        kind: 'music',
        sources: [{ format: 'mp3', path: 'assets/audio/music-base.mp3' }],
        loop: true,
        licenseRecord: 'ledger#base',
        deploymentStatus: 'approved',
      },
      {
        id: 'music-report',
        kind: 'music',
        sources: [],
        loop: true,
        licenseRecord: 'ledger#report',
        deploymentStatus: 'awaiting-audited-file',
      },
    ])

    await adapter.initialize()
    await adapter.transitionMusic('music-base', 900)

    expect(createAudio).toHaveBeenCalledWith('/Shoot/assets/audio/music-base.mp3')
    expect(audio.loop).toBe(true)
    expect(audio.play).toHaveBeenCalledOnce()
  })

  it('切換曲目時停止前一首，且安全略過尚未核可的曲目', async () => {
    const first = makeAudio()
    const second = makeAudio()
    const adapter = new BrowserAudioAdapter(
      '/',
      vi.fn().mockReturnValueOnce(first).mockReturnValueOnce(second),
      async () => [
        {
          id: 'music-base', kind: 'music', sources: [{ format: 'mp3', path: 'base.mp3' }], loop: true, licenseRecord: 'x', deploymentStatus: 'approved',
        },
        {
          id: 'music-boss', kind: 'music', sources: [{ format: 'mp3', path: 'boss.mp3' }], loop: true, licenseRecord: 'x', deploymentStatus: 'approved',
        },
      ],
    )

    await adapter.initialize()
    await adapter.transitionMusic('music-base', 0)
    await adapter.transitionMusic('music-boss', 0)
    await adapter.transitionMusic('music-report', 0)

    expect(first.pause).toHaveBeenCalledOnce()
    expect(second.play).toHaveBeenCalledOnce()
  })
})
