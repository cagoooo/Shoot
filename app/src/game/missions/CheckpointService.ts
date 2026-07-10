import {
  createMissionState,
  type MissionPhase,
  type MissionState,
} from '../../domain/missions/missionState'

interface CheckpointStorage {
  read: () => string | null | Promise<string | null>
  write: (value: string) => void | Promise<void>
}

export interface RestoredCheckpoint extends MissionState {
  safeSpawnId: string
}

const phases: MissionPhase[] = [
  'briefing',
  'loadout',
  'entrance',
  'sorting-hall',
  'storm-machine',
  'evacuation',
  'report',
]

const browserStorage: CheckpointStorage = {
  read: () => localStorage.getItem('earth-guardian-checkpoint'),
  write: (value) => localStorage.setItem('earth-guardian-checkpoint', value),
}

export class CheckpointService {
  private readonly storage: CheckpointStorage

  constructor(storage: CheckpointStorage = browserStorage) {
    this.storage = storage
  }

  async save(state: MissionState): Promise<void> {
    await this.storage.write(
      JSON.stringify({
        phase: state.phase,
        completedObjectives: [...state.completedObjectives],
        reportAwarded: state.reportAwarded,
      }),
    )
  }

  async load(): Promise<RestoredCheckpoint | null> {
    const stored = await this.storage.read()
    if (!stored) return null

    try {
      const input = JSON.parse(stored) as Partial<MissionState>
      if (!input.phase || !phases.includes(input.phase)) return null
      const state = createMissionState({
        phase: input.phase,
        completedObjectives: Array.isArray(input.completedObjectives)
          ? input.completedObjectives.filter(
              (objective): objective is string => typeof objective === 'string',
            )
          : [],
        reportAwarded: input.reportAwarded === true,
      })
      return { ...state, safeSpawnId: `${state.phase}-safe` }
    } catch {
      return null
    }
  }
}
