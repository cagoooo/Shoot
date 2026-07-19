import { NullEngine } from '@babylonjs/core/Engines/nullEngine'
import { describe, expect, it } from 'vitest'
import { buildToolPreviewScene } from './buildToolPreviewScene'
import type { ToolPart } from '../../domain/tools/types'

const fullLoadout: ToolPart[] = [
  { id: 'solar-box', slot: 'energy', stats: { power: 2, saving: 4, range: 3, aim: 3, cooling: 3, lightness: 3, earthCare: 5 } },
  { id: 'power-emitter', slot: 'emitter', stats: { power: 5, saving: 1, range: 3, aim: 2, cooling: 1, lightness: 2, earthCare: 2 } },
  { id: 'long-aim-tube', slot: 'aimTube', stats: { power: 3, saving: 3, range: 5, aim: 5, cooling: 3, lightness: 1, earthCare: 3 } },
  { id: 'light-grip', slot: 'grip', stats: { power: 2, saving: 3, range: 3, aim: 2, cooling: 3, lightness: 5, earthCare: 4 } },
  { id: 'fast-cooler', slot: 'cooler', stats: { power: 3, saving: 2, range: 3, aim: 3, cooling: 5, lightness: 1, earthCare: 3 } },
  { id: 'eco-helper', slot: 'helper', stats: { power: 2, saving: 4, range: 3, aim: 3, cooling: 3, lightness: 4, earthCare: 5 } },
]

function createEngine() {
  return new NullEngine({
    renderWidth: 400,
    renderHeight: 300,
    textureSize: 256,
    deterministicLockstep: false,
    lockstepMaxSteps: 4,
  })
}

describe('buildToolPreviewScene', () => {
  it('六個插槽都有零件時建立完整模型且可釋放', () => {
    const engine = createEngine()
    const scene = buildToolPreviewScene(engine, { parts: fullLoadout, reducedMotion: false })

    expect(scene.activeCamera).not.toBeNull()
    expect(scene.meshes.some((mesh) => mesh.name === 'tool-preview-energy')).toBe(true)
    expect(scene.meshes.some((mesh) => mesh.name === 'tool-preview-emitter')).toBe(true)
    expect(scene.meshes.some((mesh) => mesh.name === 'tool-preview-helper')).toBe(true)

    scene.render()
    scene.dispose()
    expect(scene.isDisposed).toBe(true)
    engine.dispose()
  })

  it('插槽尚未選擇零件時不會建立該部位、也不會拋錯', () => {
    const engine = createEngine()
    const partial = fullLoadout.filter((part) => part.slot === 'energy')
    const scene = buildToolPreviewScene(engine, { parts: partial, reducedMotion: true })

    expect(scene.meshes.some((mesh) => mesh.name === 'tool-preview-energy')).toBe(true)
    expect(scene.meshes.some((mesh) => mesh.name === 'tool-preview-emitter')).toBe(false)
    expect(scene.meshes.some((mesh) => mesh.name === 'tool-preview-helper')).toBe(false)

    scene.dispose()
    engine.dispose()
  })

  it('沒有任何零件時仍能建立空場景不拋錯', () => {
    const engine = createEngine()
    const scene = buildToolPreviewScene(engine, { parts: [], reducedMotion: true })

    expect(scene.activeCamera).not.toBeNull()
    scene.dispose()
    engine.dispose()
  })
})
