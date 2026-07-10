import { describe, expect, it } from 'vitest'
import { InputManager } from './InputManager'

describe('InputManager', () => {
  it('合併鍵盤、觸控與控制器的共通動作', () => {
    const manager = new InputManager()
    manager.updateSource('keyboard', {
      moveX: 1,
      moveY: 0,
      primaryUse: false,
    })
    manager.updateSource('touch', {
      moveX: 0,
      moveY: 1,
      primaryUse: true,
    })

    expect(manager.snapshot()).toMatchObject({
      moveX: 1,
      moveY: 1,
      primaryUse: true,
    })
  })

  it('移除來源後不會留下持續移動', () => {
    const manager = new InputManager()
    manager.updateSource('touch', { moveX: 0.7, moveY: -0.4 })

    manager.removeSource('touch')

    expect(manager.snapshot()).toMatchObject({ moveX: 0, moveY: 0 })
  })

  it('合併後將移動限制在負一到一', () => {
    const manager = new InputManager()
    manager.updateSource('keyboard', { moveX: 1 })
    manager.updateSource('gamepad', { moveX: 0.8 })

    expect(manager.snapshot().moveX).toBe(1)
  })
})
