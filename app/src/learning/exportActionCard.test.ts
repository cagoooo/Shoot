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
})
