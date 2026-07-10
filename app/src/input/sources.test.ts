import { describe, expect, it } from 'vitest'
import { GamepadSource } from './GamepadSource'
import { KeyboardMouseSource } from './KeyboardMouseSource'
import { calculateStickVector } from './PointerTouchSource'

describe('input sources', () => {
  it('將 WASD、互動鍵和滑鼠按鈕轉為共通動作', () => {
    const source = new KeyboardMouseSource()
    source.handleKey('KeyW', true)
    source.handleKey('KeyD', true)
    source.handleKey('KeyE', true)
    source.handlePointerButton(0, true)

    expect(source.snapshot()).toMatchObject({
      moveX: 1,
      moveY: 1,
      interact: true,
      primaryUse: true,
    })
  })

  it('讀取控制器搖桿與扳機', () => {
    const source = new GamepadSource()
    const buttons = Array.from({ length: 10 }, () => ({ pressed: false }))
    buttons[7] = { pressed: true }

    expect(
      source.read({ axes: [0.5, -0.75, 0.2, -0.3], buttons }),
    ).toMatchObject({
      moveX: 0.5,
      moveY: 0.75,
      lookX: 0.2,
      lookY: 0.3,
      primaryUse: true,
    })
  })

  it('將觸控搖桿距離限制在半徑內', () => {
    expect(calculateStickVector(0, 0, 100, 0, 50)).toEqual({ x: 1, y: 0 })
  })
})
