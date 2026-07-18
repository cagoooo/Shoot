import { describe, expect, it } from 'vitest'
import { createActionCardSvg } from './exportActionCard'
import { reduceLearningEvents } from './reducer'

describe('createActionCardSvg', () => {
  it('永續行動卡只包含學習結果，不含個資或裝置識別碼', () => {
    const report = reduceLearningEvents([
      { type: 'energy-used', amount: 55 },
      { type: 'machine-repaired', id: 'storm-machine' },
      { type: 'reflection-chosen', choice: '我想試試更省電的方法' },
    ])
    const svg = createActionCardSvg(report, ['energy-saver'])

    expect(svg).toContain('我的永續行動卡')
    expect(svg).toContain('能源使用：55')
    expect(svg).not.toMatch(/name|email|@|device|advertising|ip address/i)
  })

  it('完美結局的行動卡有金框與完美標題', () => {
    const report = reduceLearningEvents([
      { type: 'energy-used', amount: 20 },
      { type: 'mission-ending', missionId: 'seed-forest', ending: 'perfect', summary: '你一次就把森林照顧對了！' },
    ])
    const svg = createActionCardSvg(report, [])

    expect(svg).toContain('完美永續行動卡')
    expect(svg).toContain('#c8940f')
  })

  it('學習結局的行動卡維持一般樣式', () => {
    const report = reduceLearningEvents([
      { type: 'mission-ending', missionId: 'seed-forest', ending: 'learned', summary: '幼苗一樣長大了。' },
    ])
    const svg = createActionCardSvg(report, [])

    expect(svg).toContain('我的永續行動卡')
    expect(svg).not.toContain('完美永續行動卡')
  })
})
