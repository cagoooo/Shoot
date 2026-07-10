export type WeaponPlatform = 'light-rifle' | 'hand-cannon' | 'prism-scatter'

export interface WeaponState {
  energy: number
  energyCapacity: number
  heat: number
  heatLimit: number
  overheated: boolean
}

export interface FireCost {
  energyCost: number
  heat: number
}

export function createWeaponState(
  initial: Partial<WeaponState> = {},
): WeaponState {
  const energy = Math.max(0, initial.energy ?? 100)
  const energyCapacity = Math.max(
    energy,
    initial.energyCapacity ?? Math.max(100, energy),
  )
  const heatLimit = Math.max(1, initial.heatLimit ?? 100)
  const heat = Math.max(0, initial.heat ?? 0)

  return {
    energy,
    energyCapacity,
    heat,
    heatLimit,
    overheated: initial.overheated ?? heat >= heatLimit,
  }
}

export function canFire(state: WeaponState, energyCost = 0): boolean {
  return !state.overheated && state.energy >= Math.max(0, energyCost)
}

export function fireWeapon(
  state: WeaponState,
  cost: FireCost,
): WeaponState {
  const energyCost = Math.max(0, cost.energyCost)
  if (!canFire(state, energyCost)) return state

  const heat = state.heat + Math.max(0, cost.heat)
  return {
    ...state,
    energy: state.energy - energyCost,
    heat,
    overheated: heat >= state.heatLimit,
  }
}

export function coolWeapon(state: WeaponState, amount: number): WeaponState {
  const heat = Math.max(0, state.heat - Math.max(0, amount))
  return { ...state, heat, overheated: heat >= state.heatLimit }
}

export function rechargeWeapon(
  state: WeaponState,
  amount: number,
): WeaponState {
  return {
    ...state,
    energy: Math.min(
      state.energyCapacity,
      state.energy + Math.max(0, amount),
    ),
  }
}
