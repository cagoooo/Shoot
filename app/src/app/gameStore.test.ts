import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './gameStore'
import { DEFAULT_COMFORT_SETTINGS } from '../domain/settings/accessibility'

describe('gameStore learning events', () => {
  beforeEach(() => {
    useGameStore.setState({ learningEvents: [], screen: 'start' })
  })

  it('可累積任務學習事件並清除', () => {
    useGameStore.getState().recordLearningEvents([
      { type: 'energy-used', amount: 55 },
      { type: 'machine-repaired', id: 'storm-machine' },
    ])
    expect(useGameStore.getState().learningEvents).toHaveLength(2)

    useGameStore.getState().clearLearningEvents()
    expect(useGameStore.getState().learningEvents).toEqual([])
  })

  it('舒適與觸控偏好可供所有遊戲畫面共用', () => {
    useGameStore.setState({ comfortSettings: DEFAULT_COMFORT_SETTINGS })
    useGameStore.getState().setComfortSettings({
      ...DEFAULT_COMFORT_SETTINGS,
      leftHanded: true,
      largeText: true,
    })

    expect(useGameStore.getState().comfortSettings).toMatchObject({
      leftHanded: true,
      largeText: true,
    })
  })
})
