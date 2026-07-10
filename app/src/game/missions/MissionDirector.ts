import {
  completeObjective,
  createMissionState,
  transitionMission,
  type MissionEvent,
  type MissionState,
} from '../../domain/missions/missionState'

interface CheckpointWriter {
  save(state: MissionState): Promise<void>
}

export class MissionDirector {
  private state: MissionState
  private readonly checkpoint: CheckpointWriter

  constructor(
    checkpoint: CheckpointWriter,
    initialState: MissionState = createMissionState(),
  ) {
    this.checkpoint = checkpoint
    this.state = createMissionState(initialState)
  }

  snapshot(): MissionState {
    return createMissionState(this.state)
  }

  complete(objective: string): MissionState {
    this.state = completeObjective(this.state, objective)
    return this.snapshot()
  }

  async transition(event: MissionEvent): Promise<MissionState> {
    this.state = transitionMission(this.state, event)
    await this.checkpoint.save(this.state)
    return this.snapshot()
  }

  async claimReportAward(): Promise<boolean> {
    if (this.state.phase !== 'report' || this.state.reportAwarded) return false
    this.state = { ...this.state, reportAwarded: true }
    await this.checkpoint.save(this.state)
    return true
  }
}
