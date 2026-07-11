import { describe, expect, it } from 'vitest'
import { applyTouchLook } from './applyTouchLook'

describe('applyTouchLook', () => {
  it('能依觸控軸轉向，並限制上下觀看角度', () => {
    const camera = { rotation: { x: 0, y: 0 } }
    applyTouchLook(camera, { lookX: 1, lookY: 1 }, 1)

    expect(camera.rotation.y).toBeGreaterThan(0)
    expect(camera.rotation.x).toBeGreaterThanOrEqual(-0.65)
    expect(camera.rotation.x).toBeLessThanOrEqual(0.65)
  })
})
