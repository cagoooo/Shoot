import { describe, expect, it, vi } from 'vitest'
import { StormMachineController } from './StormMachineController'

describe('StormMachineController', () => {
  it('每次狀態改變都通知畫面，但錯誤分類仍可繼續', () => {
    const onChange = vi.fn()
    const controller = new StormMachineController(onChange)

    controller.sort('paper', 'metal')

    expect(controller.snapshot().phase).toBe('sorting')
    expect(controller.snapshot().feedback).toBe('try-again')
    expect(onChange).toHaveBeenCalledWith(controller.snapshot())
  })
})
