import { describe, expect, it } from 'vitest'
import { storyMissions } from './storyMissionConfig'

describe('storyMissions', () => {
  it('提供第 4 至第 9 關各自不同的世界任務', () => {
    expect(storyMissions).toHaveLength(6)
    expect(storyMissions.map((mission) => mission.chapter)).toEqual([4, 5, 6, 7, 8, 9])
    expect(new Set(storyMissions.map((mission) => mission.landmark)).size).toBe(6)
  })
})
