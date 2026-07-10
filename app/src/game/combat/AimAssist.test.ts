import { describe, expect, it } from 'vitest'
import { selectAimTarget } from './AimAssist'

describe('AimAssist', () => {
  it('只協助瞄準小角度內的搗蛋核心', () => {
    const selected = selectAimTarget(
      { x: 0, y: 0, z: 1 },
      [
        {
          id: 'near-core',
          kind: 'trouble-core',
          direction: { x: 0.08, y: 0, z: 1 },
          distance: 8,
        },
        {
          id: 'wide-core',
          kind: 'trouble-core',
          direction: { x: 1, y: 0, z: 1 },
          distance: 4,
        },
      ],
      8,
    )

    expect(selected?.id).toBe('near-core')
  })

  it('綠色保護目標永遠不會被輔助鎖定', () => {
    const selected = selectAimTarget(
      { x: 0, y: 0, z: 1 },
      [
        {
          id: 'protected-seedling',
          kind: 'protected',
          direction: { x: 0, y: 0, z: 1 },
          distance: 2,
        },
        {
          id: 'safe-core',
          kind: 'trouble-core',
          direction: { x: 0.05, y: 0, z: 1 },
          distance: 7,
        },
      ],
      8,
    )

    expect(selected?.id).toBe('safe-core')
  })
})
