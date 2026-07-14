import { describe, expect, it } from 'vitest'
import { storyMissions } from './storyMissionConfig'

describe('storyMissions', () => {
  it('提供第 4 至第 9 關各自不同的世界任務', () => {
    expect(storyMissions).toHaveLength(6)
    expect(storyMissions.map((mission) => mission.chapter)).toEqual([4, 5, 6, 7, 8, 9])
    expect(new Set(storyMissions.map((mission) => mission.landmark)).size).toBe(6)
  })

  it('第 4、5 關有排順序玩法且每一步要走到不同地點', () => {
    for (const id of ['seed-forest', 'food-rescue'] as const) {
      const mission = storyMissions.find((item) => item.id === id)
      expect(mission).toBeDefined()
      const sequenceStep = mission!.steps.find((step) => step.kind === 'sequence')
      expect(sequenceStep).toBeDefined()
      expect(sequenceStep!.requiredChoices).toBe(sequenceStep!.choices.length)
      const positions = mission!.steps.map((step) => `${step.position?.x},${step.position?.z}`)
      expect(new Set(positions).size).toBe(mission!.steps.length)
    }
  })
})
