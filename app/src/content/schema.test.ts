import { describe, expect, it } from 'vitest'
import { partSchema } from './schema'

describe('partSchema', () => {
  it('拒絕沒有白話說明的零件', () => {
    expect(() =>
      partSchema.parse({ id: 'solar-box', name: '陽光能源盒' }),
    ).toThrow()
  })

  it('接受具七項能力與 SDGs 連結的零件', () => {
    const result = partSchema.parse({
      id: 'solar-box',
      name: '陽光能源盒',
      shortDescription: '有陽光時充電比較快',
      slot: 'energy',
      stats: {
        power: 2,
        saving: 4,
        range: 3,
        aim: 3,
        cooling: 3,
        lightness: 3,
        earthCare: 5,
      },
      sdgs: [7, 12],
      why: '太陽能會受到日照強弱影響',
    })

    expect(result.id).toBe('solar-box')
  })

  it('拒絕超過五點的學生能力', () => {
    expect(() =>
      partSchema.parse({
        id: 'too-strong',
        name: '超級能源盒',
        shortDescription: '這個測試零件超出能力範圍',
        slot: 'energy',
        stats: {
          power: 6,
          saving: 4,
          range: 3,
          aim: 3,
          cooling: 3,
          lightness: 3,
          earthCare: 5,
        },
        sdgs: [7],
        why: '學生能力必須維持在一到五點',
      }),
    ).toThrow()
  })
})
