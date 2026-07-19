import { NullEngine } from '@babylonjs/core/Engines/nullEngine'
import { describe, expect, it } from 'vitest'
import { buildCampaignScene, type CampaignWorldStatus } from './buildCampaignScene'

function createEngine() {
  return new NullEngine({
    renderWidth: 400,
    renderHeight: 300,
    textureSize: 256,
    deterministicLockstep: false,
    lockstepMaxSteps: 4,
  })
}

const worlds: CampaignWorldStatus[] = [
  { id: 'recycling-storm', order: 1, icon: '♻️', color: '#5eb987', unlocked: true, playable: true, completed: true },
  { id: 'water-guardian', order: 2, icon: '💧', color: '#4f91bb', unlocked: true, playable: true, completed: false },
  { id: 'earth-partners', order: 9, icon: '🤝', color: '#956fba', unlocked: false, playable: false, completed: false },
]

describe('buildCampaignScene', () => {
  it('建立地球與九個世界標記，只有可遊玩的標記可被點擊', () => {
    const engine = createEngine()
    const scene = buildCampaignScene(engine, { worlds, reducedMotion: false })

    expect(scene.meshes.some((mesh) => mesh.name === 'campaign-earth')).toBe(true)
    const playable = scene.meshes.find((mesh) => mesh.name === 'campaign-marker-mesh-water-guardian')
    const locked = scene.meshes.find((mesh) => mesh.name === 'campaign-marker-mesh-earth-partners')
    expect(playable?.isPickable).toBe(true)
    expect(locked?.isPickable).toBe(false)
    expect(playable?.metadata).toEqual({ campaignWorld: 'water-guardian' })

    scene.render()
    scene.dispose()
    expect(scene.isDisposed).toBe(true)
    engine.dispose()
  })

  it('減少動態時不註冊逐幀動畫仍能渲染', () => {
    const engine = createEngine()
    const scene = buildCampaignScene(engine, { worlds, reducedMotion: true })
    scene.render()
    scene.dispose()
    engine.dispose()
    expect(scene.isDisposed).toBe(true)
  })
})
