import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TouchControls } from './TouchControls'

describe('TouchControls', () => {
  it('主要工具按下與放開會更新動作', () => {
    const onInputChange = vi.fn()
    render(<TouchControls onInputChange={onInputChange} />)

    const primary = screen.getByTestId('primary-use')
    fireEvent.pointerDown(primary, { pointerId: 1 })
    expect(onInputChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ primaryUse: true }),
    )

    fireEvent.pointerUp(primary, { pointerId: 1 })
    expect(onInputChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ primaryUse: false }),
    )
  })

  it('pointer cancel 後清除移動避免角色自己走', () => {
    const onInputChange = vi.fn()
    render(<TouchControls onInputChange={onInputChange} />)

    const stick = screen.getByTestId('move-stick')
    fireEvent.pointerDown(stick, { pointerId: 2, clientX: 50, clientY: 50 })
    fireEvent.pointerMove(stick, { pointerId: 2, clientX: 90, clientY: 50 })
    fireEvent.pointerCancel(stick, { pointerId: 2 })

    expect(onInputChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ moveX: 0, moveY: 0 }),
    )
  })
})
