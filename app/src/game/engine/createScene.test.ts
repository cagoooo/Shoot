import { NullEngine } from '@babylonjs/core/Engines/nullEngine'
import { describe, expect, it } from 'vitest'
import { createGameScene } from './createScene'

describe('createGameScene', () => {
  it('建立明亮測試場景並可完整釋放', () => {
    const engine = new NullEngine({
      renderWidth: 800,
      renderHeight: 600,
      textureSize: 512,
      deterministicLockstep: false,
      lockstepMaxSteps: 4,
    })
    const scene = createGameScene(engine)

    expect(scene.activeCamera).not.toBeNull()
    expect(scene.meshes.some((mesh) => mesh.name === 'ground')).toBe(true)

    scene.dispose()
    expect(scene.isDisposed).toBe(true)
    engine.dispose()
  })
})
