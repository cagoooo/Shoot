import { describe, expect, it } from 'vitest'
import { storyMissions } from './storyMissionConfig'

describe('storyMissions', () => {
  it('提供第 4 至第 9 關各自不同的世界任務', () => {
    expect(storyMissions).toHaveLength(6)
    expect(storyMissions.map((mission) => mission.chapter)).toEqual([4, 5, 6, 7, 8, 9])
    expect(new Set(storyMissions.map((mission) => mission.landmark)).size).toBe(6)
  })

  it('第 4 到第 7 關有排順序玩法且要照 choices 順序完成', () => {
    for (const id of ['seed-forest', 'food-rescue', 'health-bubble', 'safe-home'] as const) {
      const mission = storyMissions.find((item) => item.id === id)
      expect(mission).toBeDefined()
      const sequenceStep = mission!.steps.find((step) => step.kind === 'sequence')
      expect(sequenceStep).toBeDefined()
      expect(sequenceStep!.requiredChoices).toBe(sequenceStep!.choices.length)
    }
  })

  it('第 8、9 關有單一最佳答案的情境判斷題', () => {
    for (const id of ['ocean-blue', 'earth-partners'] as const) {
      const mission = storyMissions.find((item) => item.id === id)
      expect(mission).toBeDefined()
      const quizStep = mission!.steps.find((step) => step.requiredChoices === 1)
      expect(quizStep).toBeDefined()
      expect(quizStep!.choices.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('每一關都有引導角色且每一步都有對話', () => {
    for (const mission of storyMissions) {
      expect(mission.guide.name.length).toBeGreaterThan(1)
      expect(mission.guide.icon.length).toBeGreaterThan(0)
      for (const step of mission.steps) {
        expect(step.dialogue, `${mission.id} 的「${step.title}」缺對話`).toBeTruthy()
      }
    }
  })

  it('每一關都有完美與學習兩種結局', () => {
    for (const mission of storyMissions) {
      expect(mission.endings.perfect.length).toBeGreaterThan(5)
      expect(mission.endings.learned.length).toBeGreaterThan(5)
      expect(mission.endings.perfect).not.toBe(mission.endings.learned)
    }
  })

  it('第 4 至第 9 關每一步都要走到不同的 3D 地點', () => {
    for (const mission of storyMissions) {
      const positions = mission.steps.map((step) => {
        expect(step.position).toBeDefined()
        return `${step.position?.x},${step.position?.z}`
      })
      expect(new Set(positions).size).toBe(mission.steps.length)
    }
  })
})
