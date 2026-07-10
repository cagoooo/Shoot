import type { ToolPart } from './types'

export const solarBox: ToolPart = {
  id: 'solar-box',
  slot: 'energy',
  stats: { power: 2, saving: 4, range: 3, aim: 3, cooling: 3, lightness: 3, earthCare: 5 },
}

export const recycledBattery: ToolPart = {
  id: 'recycled-battery',
  slot: 'energy',
  stats: { power: 3, saving: 3, range: 3, aim: 3, cooling: 3, lightness: 4, earthCare: 5 },
}

export const steadyEmitter: ToolPart = {
  id: 'steady-emitter',
  slot: 'emitter',
  stats: { power: 3, saving: 3, range: 3, aim: 4, cooling: 3, lightness: 4, earthCare: 3 },
}

export const powerEmitter: ToolPart = {
  id: 'power-emitter',
  slot: 'emitter',
  stats: { power: 5, saving: 1, range: 3, aim: 2, cooling: 1, lightness: 2, earthCare: 2 },
}

export const energyRecoveryCooler: ToolPart = {
  id: 'energy-recovery-cooler',
  slot: 'cooler',
  stats: { power: 2, saving: 5, range: 3, aim: 3, cooling: 3, lightness: 3, earthCare: 5 },
}
