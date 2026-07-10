import { createEmptyInput, type InputSnapshot } from './actions'

export class KeyboardMouseSource {
  private readonly keys = new Set<string>()
  private readonly buttons = new Set<number>()

  handleKey(code: string, pressed: boolean): void {
    if (pressed) this.keys.add(code)
    else this.keys.delete(code)
  }

  handlePointerButton(button: number, pressed: boolean): void {
    if (pressed) this.buttons.add(button)
    else this.buttons.delete(button)
  }

  reset(): void {
    this.keys.clear()
    this.buttons.clear()
  }

  snapshot(): InputSnapshot {
    const state = createEmptyInput()
    state.moveX = Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA'))
    state.moveY = Number(this.keys.has('KeyW')) - Number(this.keys.has('KeyS'))
    state.primaryUse = this.buttons.has(0)
    state.secondaryUse = this.buttons.has(2) || this.keys.has('Space')
    state.interact = this.keys.has('KeyE')
    state.switchNext = this.keys.has('KeyQ')
    state.pause = this.keys.has('Escape')
    return state
  }
}
