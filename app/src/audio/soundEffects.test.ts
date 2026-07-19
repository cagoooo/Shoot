import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { playSfx, resetSfxForTest, setSfxMuted } from './soundEffects'

class FakeParam {
  setValueAtTime = vi.fn()
  exponentialRampToValueAtTime = vi.fn()
}
class FakeOscillator {
  type = 'sine'
  frequency = { value: 0 }
  connect = vi.fn()
  start = vi.fn()
  stop = vi.fn()
}
class FakeGain {
  gain = new FakeParam()
  connect = vi.fn()
}
class FakeAudioContext {
  static instances: FakeAudioContext[] = []
  state = 'running'
  currentTime = 0
  destination = {}
  oscillators: FakeOscillator[] = []
  resume = vi.fn()
  createOscillator = vi.fn(() => {
    const osc = new FakeOscillator()
    this.oscillators.push(osc)
    return osc
  })
  createGain = vi.fn(() => new FakeGain())
  constructor() {
    FakeAudioContext.instances.push(this)
  }
}

describe('soundEffects', () => {
  beforeEach(() => {
    resetSfxForTest()
    FakeAudioContext.instances = []
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    setSfxMuted(false)
  })

  it('播放時建立振盪器並排程音符', () => {
    vi.stubGlobal('AudioContext', FakeAudioContext)
    playSfx('complete')
    const ctx = FakeAudioContext.instances[0]
    expect(ctx.oscillators.length).toBe(3)
    expect(ctx.oscillators[0].start).toHaveBeenCalled()
  })

  it('靜音時不建立任何音訊節點', () => {
    vi.stubGlobal('AudioContext', FakeAudioContext)
    setSfxMuted(true)
    playSfx('select')
    expect(FakeAudioContext.instances.length).toBe(0)
  })

  it('沒有 Web Audio 時安靜略過不拋錯', () => {
    vi.stubGlobal('AudioContext', undefined)
    vi.stubGlobal('webkitAudioContext', undefined)
    expect(() => playSfx('purify')).not.toThrow()
  })
})
