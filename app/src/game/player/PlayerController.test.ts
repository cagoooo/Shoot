import { describe, expect, it } from 'vitest'
import {
  integrateMovement,
  simulateMovement,
  stepPlayerCamera,
} from './PlayerController'

describe('PlayerController movement', () => {
  it('不同幀率下移動距離近似相同', () => {
    const sixty = simulateMovement({ fps: 60, seconds: 1, speed: 4 })
    const thirty = simulateMovement({ fps: 30, seconds: 1, speed: 4 })

    expect(Math.abs(sixty.z - thirty.z)).toBeLessThan(0.02)
    expect(sixty.z).toBeCloseTo(4, 4)
  })

  it('斜向移動不會比直線更快', () => {
    const straight = integrateMovement(
      { x: 0, z: 0 },
      { moveX: 0, moveY: 1 },
      1,
      4,
      0,
    )
    const diagonal = integrateMovement(
      { x: 0, z: 0 },
      { moveX: 1, moveY: 1 },
      1,
      4,
      0,
    )

    expect(Math.hypot(diagonal.x, diagonal.z)).toBeCloseTo(
      Math.hypot(straight.x, straight.z),
      5,
    )
  })

  it('依攝影機方向旋轉移動向量', () => {
    const moved = integrateMovement(
      { x: 0, z: 0 },
      { moveX: 0, moveY: 1 },
      1,
      4,
      Math.PI / 2,
    )

    expect(moved.x).toBeCloseTo(4, 5)
    expect(moved.z).toBeCloseTo(0, 5)
  })

  it('把統一輸入套用到攝影機位置', () => {
    const camera = {
      position: { x: 1, z: 2 },
      rotation: { y: Math.PI / 2 },
    }

    stepPlayerCamera(camera, { moveX: 0, moveY: 1 }, 0.5, 4)

    expect(camera.position.x).toBeCloseTo(3, 5)
    expect(camera.position.z).toBeCloseTo(2, 5)
  })
})
