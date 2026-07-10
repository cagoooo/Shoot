export type StormMachinePhase =
  | 'sorting'
  | 'clean-cores'
  | 'energy-choice'
  | 'restored'

export type EnergyMode = 'fast-full' | 'slow-saving' | 'zoned'
export type WasteKind = 'paper' | 'plastic' | 'metal' | 'general'
export type StormFeedback =
  | 'ready'
  | 'try-again'
  | 'correct'
  | 'core-cleansed'
  | 'choose-energy'
  | 'restored'

export interface StormResult {
  energyUsed: number
  timeSpent: number
  repairScore: number
  report: string
}

export interface StormMachineState {
  phase: StormMachinePhase
  sortedItems: WasteKind[]
  coresRemaining: number
  hintCount: number
  feedback: StormFeedback
  energyMode?: EnergyMode
  result?: StormResult
}

const allWasteKinds: WasteKind[] = ['paper', 'plastic', 'metal', 'general']

const energyResults: Record<EnergyMode, StormResult> = {
  'fast-full': {
    energyUsed: 100,
    timeSpent: 3,
    repairScore: 3,
    report: '修復速度最快，但使用的能源最多。',
  },
  'slow-saving': {
    energyUsed: 55,
    timeSpent: 7,
    repairScore: 4,
    report: '等待時間較長，但節省了最多能源。',
  },
  zoned: {
    energyUsed: 72,
    timeSpent: 5,
    repairScore: 5,
    report: '分區供電兼顧速度與節能，修復最穩定。',
  },
}

export function createStormMachine(): StormMachineState {
  return {
    phase: 'sorting',
    sortedItems: [],
    coresRemaining: 3,
    hintCount: 0,
    feedback: 'ready',
  }
}

export function sortStormItem(
  state: StormMachineState,
  selection: { item: WasteKind; bin: WasteKind },
): StormMachineState {
  if (state.phase !== 'sorting') throw new Error('storm_phase_not_ready')
  if (selection.item !== selection.bin) {
    return {
      ...state,
      hintCount: state.hintCount + 1,
      feedback: 'try-again',
    }
  }
  if (state.sortedItems.includes(selection.item)) return state

  const sortedItems = [...state.sortedItems, selection.item]
  return {
    ...state,
    sortedItems,
    phase: allWasteKinds.every((item) => sortedItems.includes(item))
      ? 'clean-cores'
      : 'sorting',
    feedback: 'correct',
  }
}

export function cleanStormCore(state: StormMachineState): StormMachineState {
  if (state.phase !== 'clean-cores') throw new Error('storm_phase_not_ready')
  const coresRemaining = Math.max(0, state.coresRemaining - 1)
  return {
    ...state,
    coresRemaining,
    phase: coresRemaining === 0 ? 'energy-choice' : 'clean-cores',
    feedback: coresRemaining === 0 ? 'choose-energy' : 'core-cleansed',
  }
}

export function chooseEnergyMode(
  state: StormMachineState,
  mode: EnergyMode,
): StormMachineState {
  if (state.phase !== 'energy-choice') {
    throw new Error('storm_phase_not_ready')
  }
  return {
    ...state,
    phase: 'restored',
    energyMode: mode,
    result: { ...energyResults[mode] },
    feedback: 'restored',
  }
}
