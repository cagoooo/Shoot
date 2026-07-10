import { describe, expect, it } from 'vitest'
import { InputManager } from './InputManager'
import { bindKeyboardMouseInput } from './bindKeyboardMouseInput'

describe('bindKeyboardMouseInput', () => {
  it('把鍵盤與滑鼠事件送入統一輸入管理器', () => {
    const manager = new InputManager()
    const target = new EventTarget()
    const pointerTarget = new EventTarget()
    const cleanup = bindKeyboardMouseInput(target, pointerTarget, manager)

    target.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }))
    pointerTarget.dispatchEvent(
      new MouseEvent('pointerdown', { button: 0 }),
    )

    expect(manager.snapshot()).toMatchObject({ moveY: 1, primaryUse: true })

    target.dispatchEvent(new Event('blur'))
    expect(manager.snapshot()).toMatchObject({ moveY: 0, primaryUse: false })

    cleanup()
  })

  it('解除綁定時清除來源，避免角色持續移動', () => {
    const manager = new InputManager()
    const target = new EventTarget()
    const pointerTarget = new EventTarget()
    const cleanup = bindKeyboardMouseInput(target, pointerTarget, manager)

    target.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }))
    cleanup()

    expect(manager.snapshot().moveX).toBe(0)
  })
})
