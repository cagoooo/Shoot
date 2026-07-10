import { describe, expect, it } from 'vitest'
import {
  completeObjective,
  createMissionState,
  transitionMission,
} from './missionState'

describe('mission state', () => {
  it('不能在未修好分類機前進入頭目能源選擇', () => {
    const state = createMissionState()

    expect(() => transitionMission(state, 'choose-energy-mode')).toThrow(
      'objective_not_completed',
    )
  })

  it('依序完成目標後可走完七個階段', () => {
    let state = createMissionState()
    const steps = [
      ['read-briefing', 'finish-briefing'],
      ['tool-ready', 'confirm-loadout'],
      ['entrance-secured', 'enter-sorting-hall'],
      ['sorting-machine-fixed', 'choose-energy-mode'],
      ['storm-machine-cleansed', 'start-evacuation'],
      ['team-evacuated', 'finish-evacuation'],
    ] as const

    for (const [objective, event] of steps) {
      state = completeObjective(state, objective)
      state = transitionMission(state, event)
    }

    expect(state.phase).toBe('report')
  })

  it('重複完成同一目標不會重複計數', () => {
    let state = createMissionState()
    state = completeObjective(state, 'read-briefing')
    state = completeObjective(state, 'read-briefing')

    expect(state.completedObjectives).toEqual(['read-briefing'])
  })
})
