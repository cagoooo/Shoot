import { beforeEach, describe, expect, it } from 'vitest'
import { createIntroOrbit, resetPlayedIntros } from './introCinematic'

describe('createIntroOrbit', () => {
  beforeEach(() => {
    resetPlayedIntros()
  })

  it('環繞一圈後結束並回報剛結束一次', () => {
    const intro = createIntroOrbit({ key: 'test-world', center: { x: 0, z: 7 }, durationSeconds: 1 })
    const first = intro.update(0.25, false)
    expect(first).not.toBeNull()
    expect(Math.hypot(first!.x - 0, first!.z - 7)).toBeCloseTo(15, 1)

    intro.update(0.5, false)
    intro.update(0.5, false)
    expect(intro.update(0.016, false)).toBeNull()
    expect(intro.consumeJustFinished()).toBe(true)
    expect(intro.consumeJustFinished()).toBe(false)
  })

  it('玩家輸入時立刻取消', () => {
    const intro = createIntroOrbit({ key: 'cancel-world', center: { x: 0, z: 7 } })
    expect(intro.update(0.1, true)).toBeNull()
    expect(intro.consumeJustFinished()).toBe(true)
  })

  it('同一關第二次進入不再播放', () => {
    const first = createIntroOrbit({ key: 'once-world', center: { x: 0, z: 7 } })
    expect(first.update(0.1, false)).not.toBeNull()
    const second = createIntroOrbit({ key: 'once-world', center: { x: 0, z: 7 } })
    expect(second.update(0.1, false)).toBeNull()
    expect(second.consumeJustFinished()).toBe(false)
  })

  it('disabled 時完全不播放', () => {
    const intro = createIntroOrbit({ key: 'disabled-world', center: { x: 0, z: 7 }, disabled: true })
    expect(intro.update(0.1, false)).toBeNull()
    expect(intro.consumeJustFinished()).toBe(false)
  })
})
