import type { MissionPhase, MissionState } from '../../domain/missions/missionState'

const phaseObjectives: Record<MissionPhase, readonly string[]> = {
  briefing: ['read-briefing'],
  loadout: ['tool-ready'],
  entrance: ['entrance-secured'],
  'sorting-hall': ['sorting-machine-fixed'],
  'storm-machine': ['storm-machine-cleansed'],
  evacuation: ['team-evacuated'],
  report: [],
}

export class ObjectiveTracker {
  requiredFor(phase: MissionPhase): readonly string[] {
    return phaseObjectives[phase]
  }

  isPhaseComplete(state: MissionState): boolean {
    return this.requiredFor(state.phase).every((objective) =>
      state.completedObjectives.includes(objective),
    )
  }
}
