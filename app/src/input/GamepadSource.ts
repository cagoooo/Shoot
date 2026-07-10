import { createEmptyInput, type InputSnapshot } from './actions'

interface GamepadButtonLike {
  pressed: boolean
}

interface GamepadLike {
  axes: readonly number[]
  buttons: readonly GamepadButtonLike[]
}

const deadZone = (value: number) => (Math.abs(value) < 0.12 ? 0 : value)

export class GamepadSource {
  read(gamepad: GamepadLike): InputSnapshot {
    const state = createEmptyInput()
    state.moveX = deadZone(gamepad.axes[0] ?? 0)
    state.moveY = deadZone(-(gamepad.axes[1] ?? 0))
    state.lookX = deadZone(gamepad.axes[2] ?? 0)
    state.lookY = deadZone(-(gamepad.axes[3] ?? 0))
    state.interact = gamepad.buttons[0]?.pressed ?? false
    state.secondaryUse = gamepad.buttons[6]?.pressed ?? false
    state.primaryUse = gamepad.buttons[7]?.pressed ?? false
    state.pause = gamepad.buttons[9]?.pressed ?? false
    return state
  }
}
