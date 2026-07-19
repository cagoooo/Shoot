import { describe, expect, it } from 'vitest'
import { getWeeklyQuest, isoWeekKey } from './weeklyQuest'

describe('weeklyQuest', () => {
  it('同一週回傳相同任務，不同週會輪換', () => {
    const monday = getWeeklyQuest(new Date('2026-07-13T09:00:00Z'))
    const wednesday = getWeeklyQuest(new Date('2026-07-15T09:00:00Z'))
    expect(monday.weekKey).toBe(wednesday.weekKey)
    expect(monday.missionId).toBe(wednesday.missionId)

    const nextWeek = getWeeklyQuest(new Date('2026-07-22T09:00:00Z'))
    expect(nextWeek.weekKey).not.toBe(monday.weekKey)
  })

  it('回傳的重點世界與行動挑戰都有內容', () => {
    const quest = getWeeklyQuest(new Date('2026-07-15T09:00:00Z'))
    expect(quest.missionTitle.length).toBeGreaterThan(1)
    expect(quest.missionIcon.length).toBeGreaterThan(0)
    expect(quest.action.length).toBeGreaterThan(5)
  })

  it('isoWeekKey 產生 YYYY-Www 格式', () => {
    expect(isoWeekKey(new Date('2026-07-15T00:00:00Z'))).toMatch(/^\d{4}-W\d{2}$/)
  })
})
