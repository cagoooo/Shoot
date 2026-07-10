import { describe, expect, it } from 'vitest'
import { selectQualityProfile } from './qualityProfile'

describe('selectQualityProfile', () => {
  it.each([
    [{ averageFps: 24, deviceMemory: 2 }, 'low'],
    [{ averageFps: 45, deviceMemory: 4 }, 'medium'],
    [{ averageFps: 60, deviceMemory: 8 }, 'high'],
    [{ averageFps: 60, deviceMemory: undefined }, 'medium'],
  ] as const)('依效能樣本選擇 %s', (sample, expected) => {
    expect(selectQualityProfile(sample)).toBe(expected)
  })
})
