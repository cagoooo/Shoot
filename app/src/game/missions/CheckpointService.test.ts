import { describe, expect, it } from 'vitest'
import { CheckpointService } from './CheckpointService'

describe('CheckpointService', () => {
  it('只儲存任務資料並在安全出生點恢復', async () => {
    let stored = ''
    const service = new CheckpointService({
      read: () => stored,
      write: (value) => {
        stored = value
      },
    })

    await service.save({
      phase: 'sorting-hall',
      completedObjectives: ['sorting-machine-fixed'],
      reportAwarded: false,
    })
    const restored = await service.load()

    expect(restored).toMatchObject({
      phase: 'sorting-hall',
      safeSpawnId: 'sorting-hall-safe',
    })
    expect(stored).not.toMatch(/velocity|position|physics/i)
  })
})
