import { describe, expect, it } from 'vitest'
import { campaignMissions, isMissionUnlocked } from './missionCatalog'

describe('campaignMissions', () => {
  it('提供九個依序排列的 SDGs 世界', () => {
    expect(campaignMissions).toHaveLength(9)
    expect(campaignMissions.map((mission) => mission.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(campaignMissions.every((mission) => mission.status === 'playable')).toBe(true)
  })

  it('水滴守護行動需要先完成垃圾風暴救援行動', () => {
    const waterMission = campaignMissions.find((mission) => mission.id === 'water-guardian')!
    expect(isMissionUnlocked(waterMission, [])).toBe(false)
    expect(isMissionUnlocked(waterMission, ['recycling-storm'])).toBe(true)
  })
})
