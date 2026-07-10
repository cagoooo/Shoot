import { describe, expect, it } from 'vitest'
import {
  canFire,
  coolWeapon,
  createWeaponState,
  fireWeapon,
  rechargeWeapon,
} from './weaponState'

describe('energy weapon state', () => {
  it('過熱後暫停使用並在冷卻後恢復', () => {
    let state = createWeaponState({ energy: 100, heatLimit: 10 })
    state = fireWeapon(state, { energyCost: 5, heat: 10 })

    expect(canFire(state, 5)).toBe(false)
    expect(state.overheated).toBe(true)

    state = coolWeapon(state, 5)
    expect(canFire(state, 5)).toBe(true)
    expect(state.overheated).toBe(false)
  })

  it('能量不足時不會發射或產生熱量', () => {
    const state = createWeaponState({ energy: 3, heatLimit: 20 })
    const next = fireWeapon(state, { energyCost: 5, heat: 4 })

    expect(next).toEqual(state)
  })

  it('補充能量不超過容量', () => {
    const state = createWeaponState({ energy: 20, energyCapacity: 30 })

    expect(rechargeWeapon(state, 50).energy).toBe(30)
  })
})
