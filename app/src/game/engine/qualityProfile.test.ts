import { describe, expect, it } from 'vitest'
import { resolveQualityMode, selectQualityProfile } from './qualityProfile'

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

describe('resolveQualityMode', () => {
  it('省電降低解析度、精緻關閉自動降級、標準維持預設', () => {
    expect(resolveQualityMode('saver')).toEqual({ hardwareScaling: 1.8, autoDegrade: true })
    expect(resolveQualityMode('fine')).toEqual({ hardwareScaling: 1, autoDegrade: false })
    expect(resolveQualityMode('standard')).toEqual({ hardwareScaling: 1, autoDegrade: true })
  })
})
