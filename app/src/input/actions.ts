export interface InputSnapshot {
  moveX: number
  moveY: number
  lookX: number
  lookY: number
  primaryUse: boolean
  secondaryUse: boolean
  interact: boolean
  switchNext: boolean
  pause: boolean
}

export type InputSourceState = Partial<InputSnapshot>

export function createEmptyInput(): InputSnapshot {
  return {
    moveX: 0,
    moveY: 0,
    lookX: 0,
    lookY: 0,
    primaryUse: false,
    secondaryUse: false,
    interact: false,
    switchNext: false,
    pause: false,
  }
}
