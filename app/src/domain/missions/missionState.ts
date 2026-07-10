export type MissionPhase =
  | 'briefing'
  | 'loadout'
  | 'entrance'
  | 'sorting-hall'
  | 'storm-machine'
  | 'evacuation'
  | 'report'

export type MissionEvent =
  | 'finish-briefing'
  | 'confirm-loadout'
  | 'enter-sorting-hall'
  | 'choose-energy-mode'
  | 'start-evacuation'
  | 'finish-evacuation'

export interface MissionState {
  phase: MissionPhase
  completedObjectives: string[]
  reportAwarded: boolean
}

const transitions: Record<
  MissionEvent,
  { from: MissionPhase; to: MissionPhase; objective: string }
> = {
  'finish-briefing': {
    from: 'briefing',
    to: 'loadout',
    objective: 'read-briefing',
  },
  'confirm-loadout': {
    from: 'loadout',
    to: 'entrance',
    objective: 'tool-ready',
  },
  'enter-sorting-hall': {
    from: 'entrance',
    to: 'sorting-hall',
    objective: 'entrance-secured',
  },
  'choose-energy-mode': {
    from: 'sorting-hall',
    to: 'storm-machine',
    objective: 'sorting-machine-fixed',
  },
  'start-evacuation': {
    from: 'storm-machine',
    to: 'evacuation',
    objective: 'storm-machine-cleansed',
  },
  'finish-evacuation': {
    from: 'evacuation',
    to: 'report',
    objective: 'team-evacuated',
  },
}

export function createMissionState(
  initial: Partial<MissionState> = {},
): MissionState {
  return {
    phase: initial.phase ?? 'briefing',
    completedObjectives: [...(initial.completedObjectives ?? [])],
    reportAwarded: initial.reportAwarded ?? false,
  }
}

export function completeObjective(
  state: MissionState,
  objective: string,
): MissionState {
  if (state.completedObjectives.includes(objective)) return state
  return {
    ...state,
    completedObjectives: [...state.completedObjectives, objective],
  }
}

export function transitionMission(
  state: MissionState,
  event: MissionEvent,
): MissionState {
  const transition = transitions[event]
  if (!state.completedObjectives.includes(transition.objective)) {
    throw new Error('objective_not_completed')
  }
  if (state.phase !== transition.from) throw new Error('invalid_mission_phase')
  return { ...state, phase: transition.to }
}
