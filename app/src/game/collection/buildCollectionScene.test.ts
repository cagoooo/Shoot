import { NullEngine } from '@babylonjs/core/Engines/nullEngine'
import { describe, expect, it } from 'vitest'
import { buildCollectionScene, type CollectionWorldStatus } from './buildCollectionScene'

function createEngine() {
  return new NullEngine({
    renderWidth: 400,
    renderHeight: 300,
    textureSize: 256,
    deterministicLockstep: false,
    lockstepMaxSteps: 4,
  })
}

const worlds: CollectionWorldStatus[] = [
  { id: 'recycling-storm', icon: '♻️', color: '#5eb987', completed: true, perfect: true },
  { id: 'water-guardian', icon: '💧', color: '#4f91bb', completed: true, perfect: false },
  { id: 'green-energy-community', icon: '☀️', color: '#e4b64e', completed: false, perfect: false },
]

describe('buildCollectionScene', () => {
  it('完成的世界建立獎盃基座，未完成的仍建立基座且可釋放', () => {
    const engine = createEngine()
    const scene = buildCollectionScene(engine, { worlds, reducedMotion: false })

    expect(scene.activeCamera).not.toBeNull()
    // 每個世界都有基座。
    for (const world of worlds) {
      expect(scene.meshes.some((mesh) => mesh.name === `collection-pedestal-mesh-${world.id}`)).toBe(true)
    }
    // 完成的世界有發光獎盃，未完成的沒有。
    expect(scene.meshes.some((mesh) => mesh.name === 'collection-orb-mesh-recycling-storm')).toBe(true)
    expect(scene.meshes.some((mesh) => mesh.name === 'collection-orb-mesh-green-energy-community')).toBe(false)

    scene.render()
    scene.dispose()
    expect(scene.isDisposed).toBe(true)
    engine.dispose()
  })

  it('全部未完成時仍能建立場景不拋錯', () => {
    const engine = createEngine()
    const locked = worlds.map((world) => ({ ...world, completed: false, perfect: false }))
    const scene = buildCollectionScene(engine, { worlds: locked, reducedMotion: true })

    expect(scene.meshes.some((mesh) => mesh.name.startsWith('collection-orb-mesh-'))).toBe(false)
    scene.dispose()
    engine.dispose()
  })
})
