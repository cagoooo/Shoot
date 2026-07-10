import { NullEngine } from '@babylonjs/core/Engines/nullEngine'
import { describe, expect, it } from 'vitest'
import { createGameScene } from './createScene'
import { InputManager } from '../../input/InputManager'
import type { WeaponState } from '../../domain/combat/weaponState'

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

  it('使用工具時扣除能量，並只建立可修復的搗蛋核心', () => {
    const engine = new NullEngine()
    const input = new InputManager()
    const updates: WeaponState[] = []
    const scene = createGameScene(engine, input, undefined, (state) =>
      updates.push(state),
    )

    expect(
      scene.meshes.filter(
        (mesh) => mesh.metadata?.targetKind === 'trouble-core',
      ),
    ).toHaveLength(3)

    input.updateSource('test', { primaryUse: true })
    scene.onBeforeRenderObservable.notifyObservers(scene)

    expect(updates.at(-1)?.energy).toBe(92)
    expect(updates.at(-1)?.heat).toBe(22)

    scene.dispose()
    engine.dispose()
  })
})
