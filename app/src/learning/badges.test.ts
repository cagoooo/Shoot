import { describe, expect, it } from 'vitest'
import { calculateBadges } from './badges'
import { reduceLearningEvents } from './reducer'

describe('calculateBadges', () => {
  it('省電高手只依能源效率與修復行動判定', () => {
    const report = reduceLearningEvents([
      { type: 'energy-used', amount: 30 },
      { type: 'machine-repaired', id: 'sorter-a' },
      { type: 'enemy-cleansed', amount: 0 },
    ])

    expect(calculateBadges(report)).toContain('energy-saver')
  })

  it('擊敗或淨化數量不會單獨產生徽章', () => {
    const report = reduceLearningEvents([
      { type: 'enemy-cleansed', amount: 999 },
    ])

    expect(calculateBadges(report)).toEqual([])
  })

  it('依回收、修理、保護與反思行為頒發教育徽章', () => {
    const report = reduceLearningEvents([
      { type: 'material-recycled', category: 'paper', amount: 2 },
      { type: 'material-recycled', category: 'plastic', amount: 1 },
      { type: 'material-recycled', category: 'metal', amount: 1 },
      { type: 'machine-repaired', id: 'sorter' },
      { type: 'machine-repaired', id: 'storm-machine' },
      { type: 'protected-target', id: 'seedling' },
      { type: 'reflection-chosen', choice: '下次少用一點能源' },
    ])

    expect(calculateBadges(report)).toEqual(
      expect.arrayContaining([
        'recycling-expert',
        'repair-helper',
        'safety-guardian',
        'design-improver',
      ]),
    )
  })
})
