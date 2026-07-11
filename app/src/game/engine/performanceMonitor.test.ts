import { describe, expect, it } from 'vitest'
import {
  createPerformanceMonitor,
  feedSamples,
} from './performanceMonitor'

describe('performanceMonitor', () => {
  it('連續五秒低於 28 FPS 時只降一級畫質', () => {
    const monitor = createPerformanceMonitor('high')
    const result = feedSamples(monitor, Array(300).fill(24))

    expect(result.profile).toBe('medium')
    expect(result.reason).toBe('sustained-low-fps')
  })

  it('同一次低幀率期間不會一路降到最低畫質', () => {
    const monitor = createPerformanceMonitor('high')
    feedSamples(monitor, Array(300).fill(24))
    const result = feedSamples(monitor, Array(600).fill(20))

    expect(result.profile).toBe('medium')
  })

  it('幀率恢復後，下一次持續低幀率才能再降一級', () => {
    const monitor = createPerformanceMonitor('high')
    feedSamples(monitor, Array(300).fill(24))
    feedSamples(monitor, Array(120).fill(60))
    const result = feedSamples(monitor, Array(300).fill(24))

    expect(result.profile).toBe('low')
    expect(result.reason).toBe('sustained-low-fps')
  })
})
