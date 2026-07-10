import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './gameStore'

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
})
