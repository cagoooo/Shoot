import { describe, expect, it } from 'vitest'
import {
  chooseEnergyMode,
  cleanStormCore,
  createStormMachine,
  sortStormItem,
  type EnergyMode,
  type StormMachineState,
} from './stormMachine'

function reachEnergyChoice(): StormMachineState {
  let state = createStormMachine()
  for (const item of ['paper', 'plastic', 'metal', 'general'] as const) {
    state = sortStormItem(state, { item, bin: item })
  }
  state = cleanStormCore(state)
  state = cleanStormCore(state)
  return cleanStormCore(state)
}

describe('storm machine', () => {
  it('分類錯誤只增加提示，不造成任務失敗', () => {
    const state = sortStormItem(createStormMachine(), {
      item: 'paper',
      bin: 'metal',
    })

    expect(state.phase).toBe('sorting')
    expect(state.feedback).toBe('try-again')
    expect(state.hintCount).toBe(1)
  })

  it('完成分類與三個核心後才可選能源方案', () => {
    const state = reachEnergyChoice()

    expect(state.phase).toBe('energy-choice')
    expect(state.coresRemaining).toBe(0)
  })

  it('三種能源方案都能修復，但結果各有取捨', () => {
    const ready = reachEnergyChoice()
    const modes: EnergyMode[] = ['fast-full', 'slow-saving', 'zoned']
    const restored = modes.map((mode) => chooseEnergyMode(ready, mode))

    expect(restored.every((state) => state.phase === 'restored')).toBe(true)
    expect(new Set(restored.map((state) => state.result?.energyUsed)).size).toBe(3)
    expect(new Set(restored.map((state) => state.result?.timeSpent)).size).toBe(3)
    expect(new Set(restored.map((state) => state.result?.repairScore)).size).toBe(3)
  })

  it('不能跳過核心直接選能源方案', () => {
    expect(() => chooseEnergyMode(createStormMachine(), 'zoned')).toThrow(
      'storm_phase_not_ready',
    )
  })
})
