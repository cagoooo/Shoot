import { describe, expect, it, vi } from 'vitest'
import { loadContent } from './loadContent'

const parts = [
  {
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
  },
]

const weapons = [
  {
    id: 'light-rifle',
    name: '小光能量槍',
    shortDescription: '力量、距離和省電都很平均',
    platform: 'light-rifle',
    defaultParts: {
      energy: 'solar-box',
      emitter: 'steady-emitter',
      aimTube: 'balanced-aim-tube',
      grip: 'stable-grip',
      cooler: 'energy-recovery-cooler',
      helper: 'aim-helper',
    },
    sdgs: [7, 12],
  },
]

const missions = [
  {
    id: 'recycling-storm',
    name: '垃圾風暴救援',
    shortDescription: '修好回收站並安全撤離',
    sdgs: [7, 12, 13],
    phases: [
      { id: 'briefing', name: '接收任務', instruction: '先查看天氣和回收站狀況' },
    ],
    badges: [
      { id: 'energy-saver', name: '省電高手', reason: '用較少能源完成任務' },
    ],
  },
]

describe('loadContent', () => {
  it('從 GitHub Pages 子路徑載入並驗證三類內容', async () => {
    const responses = [parts, weapons, missions[0]]
    const fetcher = vi.fn(async (_input: RequestInfo | URL) =>
      new Response(JSON.stringify(responses.shift()), { status: 200 }),
    )

    const result = await loadContent('/Shoot/', fetcher)

    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      '/Shoot/content/parts.zh-TW.json',
      '/Shoot/content/weapons.zh-TW.json',
      '/Shoot/content/mission-recycling-storm.zh-TW.json',
    ])
    expect(result.parts[0].name).toBe('陽光能源盒')
    expect(result.missions[0].sdgs).toEqual([7, 12, 13])
  })

  it('在伺服器錯誤時提供明確檔名', async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL) =>
      new Response('', { status: 404 }),
    )

    await expect(loadContent('/', fetcher)).rejects.toThrow(
      'content_load_failed: parts.zh-TW.json',
    )
  })
})
