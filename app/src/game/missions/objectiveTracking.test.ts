import { describe, expect, it, vi } from 'vitest'
import {
  computeObjectiveTracking,
  createTrackingEmitter,
} from './objectiveTracking'

describe('computeObjectiveTracking', () => {
  it('面向目標時方向為 0 度且回報距離', () => {
    const tracking = computeObjectiveTracking(
      { x: 0, z: 0, yaw: 0 },
      { x: 0, z: 10 },
      4.5,
    )
    expect(tracking.bearing).toBeCloseTo(0)
    expect(tracking.distance).toBeCloseTo(10)
    expect(tracking.near).toBe(false)
  })

  it('目標在右邊時方向為 90 度', () => {
    const tracking = computeObjectiveTracking(
      { x: 0, z: 0, yaw: 0 },
      { x: 8, z: 0 },
      4.5,
    )
    expect(tracking.bearing).toBeCloseTo(90)
  })

  it('轉身後方向會跟著視角改變並正規化到 -180 至 180', () => {
    const tracking = computeObjectiveTracking(
      { x: 0, z: 0, yaw: Math.PI },
      { x: 0, z: 10 },
      4.5,
    )
    expect(Math.abs(tracking.bearing)).toBeCloseTo(180)
  })

  it('距離在半徑內回報已靠近', () => {
    const tracking = computeObjectiveTracking(
      { x: 1, z: 5, yaw: 0 },
      { x: 0, z: 7 },
      4.5,
    )
    expect(tracking.near).toBe(true)
  })
})

describe('createTrackingEmitter', () => {
  it('微小變化不重複通知，明顯變化才通知', () => {
    const onTracking = vi.fn()
    const emit = createTrackingEmitter(onTracking)
    emit({ near: false, distance: 10, bearing: 0 })
    emit({ near: false, distance: 10.2, bearing: 2 })
    expect(onTracking).toHaveBeenCalledTimes(1)
    emit({ near: false, distance: 8, bearing: 2 })
    expect(onTracking).toHaveBeenCalledTimes(2)
    emit({ near: true, distance: 4, bearing: 2 })
    expect(onTracking).toHaveBeenCalledTimes(3)
  })
})
