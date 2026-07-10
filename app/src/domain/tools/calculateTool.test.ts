import { describe, expect, it } from 'vitest'
import { calculateTool } from './calculateTool'
import {
  energyRecoveryCooler,
  powerEmitter,
  recycledBattery,
  solarBox,
  steadyEmitter,
} from './presets'

describe('calculateTool', () => {
  it('強力發射頭提高力量但增加耗能與發熱', () => {
    const powerful = calculateTool([
      recycledBattery,
      powerEmitter,
      energyRecoveryCooler,
    ])
    const steady = calculateTool([
      recycledBattery,
      steadyEmitter,
      energyRecoveryCooler,
    ])

    expect(powerful.power).toBeGreaterThan(steady.power)
    expect(powerful.energyPerShot).toBeGreaterThan(steady.energyPerShot)
    expect(powerful.heatPerShot).toBeGreaterThan(steady.heatPerShot)
  })

  it('將學生能力限制在一到五點', () => {
    const result = calculateTool([solarBox, powerEmitter])

    expect(
      Object.values(result.studentStats).every(
        (value) => value >= 1 && value <= 5,
      ),
    ).toBe(true)
  })

  it('拒絕在同一位置放入兩個零件', () => {
    expect(() => calculateTool([solarBox, recycledBattery])).toThrow(
      'duplicate_tool_slot: energy',
    )
  })

  it('拒絕沒有任何零件的工具', () => {
    expect(() => calculateTool([])).toThrow('tool_requires_parts')
  })
})
