import { NullEngine } from '@babylonjs/core/Engines/nullEngine'
import { describe, expect, it, vi } from 'vitest'
import { InputManager } from '../../../input/InputManager'
import { buildRecyclingStormScene } from './buildRecyclingStorm'
import { createZoneGraph } from './zones'
import {
  classifyWaste,
  createSortingChallenge,
  evaluateEvacuationBag,
} from './interactions'

describe('recycling storm mission rules', () => {
  it('主路與維修小路都能到達能源控制室', () => {
    const graph = createZoneGraph()

    expect(graph.hasPath('entrance', 'energy-room', ['main-route'])).toBe(true)
    expect(
      graph.hasPath('entrance', 'energy-room', ['maintenance-route']),
    ).toBe(true)
  })

  it('分類錯誤時提供材料線索而不扣分', () => {
    const challenge = createSortingChallenge()
    const bottle = challenge.find((item) => item.id === 'drink-bottle')!

    expect(classifyWaste(bottle, 'paper')).toEqual({
      correct: false,
      hint: '摸摸看：瓶身有彈性，而且可以洗乾淨再利用。',
    })
    expect(classifyWaste(bottle, 'plastic').correct).toBe(true)
  })

  it('撤離包必須包含安全工具，且不超過三件', () => {
    expect(
      evaluateEvacuationBag(['first-aid-kit', 'repair-notes', 'water']),
    ).toMatchObject({ ready: true })
    expect(evaluateEvacuationBag(['repair-notes', 'water'])).toMatchObject({
      ready: false,
      reason: '請帶上安全急救包',
    })
    expect(
      evaluateEvacuationBag([
        'first-aid-kit',
        'repair-notes',
        'water',
        'heavy-scrap',
      ]),
    ).toMatchObject({ ready: false, reason: '最多選三件重要物品' })
  })

  it('灰盒場景包含八個區域、兩條路線與正式模型替換接口', () => {
    const engine = new NullEngine()
    const assetProvider = { load: vi.fn(async () => true) }
    const scene = buildRecyclingStormScene(
      engine,
      new InputManager(),
      assetProvider,
    )

    expect(scene.activeCamera).not.toBeNull()
    expect(
      scene.meshes.filter((mesh) => mesh.metadata?.interactionPoint),
    ).toHaveLength(8)
    expect(
      scene.meshes.some((mesh) => mesh.metadata?.route === 'main-route'),
    ).toBe(true)
    expect(
      scene.meshes.some(
        (mesh) => mesh.metadata?.route === 'maintenance-route',
      ),
    ).toBe(true)
    expect(assetProvider.load).toHaveBeenCalledWith(scene)

    scene.dispose()
    engine.dispose()
  })
})
