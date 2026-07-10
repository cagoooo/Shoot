export type ToolSlot =
  | 'energy'
  | 'emitter'
  | 'aimTube'
  | 'grip'
  | 'cooler'
  | 'helper'

export interface StudentStats {
  power: number
  saving: number
  range: number
  aim: number
  cooling: number
  lightness: number
  earthCare: number
}

export interface ToolPart {
  id: string
  slot: ToolSlot
  stats: StudentStats
}

export interface ToolResult {
  studentStats: StudentStats
  power: number
  energyPerShot: number
  heatPerShot: number
}
