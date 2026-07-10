import {
  createEmptyInput,
  type InputSnapshot,
  type InputSourceState,
} from './actions'

const numericActions = ['moveX', 'moveY', 'lookX', 'lookY'] as const
const booleanActions = [
  'primaryUse',
  'secondaryUse',
  'interact',
  'switchNext',
  'pause',
] as const

const clampAxis = (value: number) => Math.max(-1, Math.min(1, value))

export class InputManager {
  private readonly sources = new Map<string, InputSourceState>()

  updateSource(id: string, state: InputSourceState): void {
    this.sources.set(id, { ...this.sources.get(id), ...state })
  }

  removeSource(id: string): void {
    this.sources.delete(id)
  }

  reset(): void {
    this.sources.clear()
  }

  snapshot(): InputSnapshot {
    const result = createEmptyInput()

    for (const action of numericActions) {
      result[action] = clampAxis(
        [...this.sources.values()].reduce(
          (sum, source) => sum + (source[action] ?? 0),
          0,
        ),
      )
    }

    for (const action of booleanActions) {
      result[action] = [...this.sources.values()].some(
        (source) => source[action] === true,
      )
    }

    return result
  }
}
