import { describe, expect, it, vi } from 'vitest'
import { createMissionState } from '../../domain/missions/missionState'
import { MissionDirector } from './MissionDirector'

describe('MissionDirector', () => {
  it('報告頁的完成獎勵只發一次', async () => {
    const checkpoint = { save: vi.fn(async () => undefined) }
    const director = new MissionDirector(
      checkpoint,
      createMissionState({ phase: 'report' }),
    )

    expect(await director.claimReportAward()).toBe(true)
    expect(await director.claimReportAward()).toBe(false)
    expect(checkpoint.save).toHaveBeenCalledOnce()
  })
})
