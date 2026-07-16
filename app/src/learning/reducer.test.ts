import { describe, expect, it } from 'vitest'
import { reduceLearningEvents } from './reducer'

describe('reduceLearningEvents', () => {
  it('把能源、回收、修理與保護行動整理成學習報告', () => {
    const report = reduceLearningEvents([
      { type: 'energy-used', amount: 55 },
      { type: 'material-recycled', category: 'paper', amount: 2 },
      { type: 'material-recycled', category: 'plastic', amount: 1 },
      { type: 'machine-repaired', id: 'sorting-machine' },
      { type: 'machine-repaired', id: 'storm-machine' },
      { type: 'protected-target', id: 'green-energy-panel' },
      { type: 'reflection-chosen', choice: '下次想試試分區供電' },
    ])

    expect(report.energyUsed).toBe(55)
    expect(report.recycledByCategory).toEqual({ paper: 2, plastic: 1 })
    expect(report.repairedMachines).toEqual(['sorting-machine', 'storm-machine'])
    expect(report.protectedTargets).toEqual(['green-energy-panel'])
    expect(report.reflections).toEqual(['下次想試試分區供電'])
  })

  it('相同修理與保護事件不重複計數', () => {
    const report = reduceLearningEvents([
      { type: 'machine-repaired', id: 'sorter-a' },
      { type: 'machine-repaired', id: 'sorter-a' },
      { type: 'protected-target', id: 'seedling' },
      { type: 'protected-target', id: 'seedling' },
    ])

    expect(report.repairedMachines).toHaveLength(1)
    expect(report.protectedTargets).toHaveLength(1)
  })

  it('任務結局摘要會收進報告', () => {
    const report = reduceLearningEvents([
      { type: 'mission-ending', missionId: 'ocean-blue', ending: 'learned', summary: '潮池生物差點少了朋友，最後牠們都平安。' },
    ])
    expect(report.endings).toEqual(['潮池生物差點少了朋友，最後牠們都平安。'])
  })
})
