import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import { Scene } from '@babylonjs/core/scene'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { addWorldLife, applyWorldAmbience } from '../missions/objectiveBeacon'

export interface CollectionWorldStatus {
  id: string
  icon: string
  color: string
  completed: boolean
  perfect: boolean
}

/** 各世界的展示顏色（未完成時以暗灰呈現）。 */
export const collectionWorldColors: Record<string, string> = {
  'recycling-storm': '#5eb987',
  'water-guardian': '#4f91bb',
  'green-energy-community': '#e4b64e',
  'seed-forest': '#77a96e',
  'food-rescue': '#d8914d',
  'health-bubble': '#70b8c1',
  'safe-home': '#b0836e',
  'ocean-blue': '#3f86b8',
  'earth-partners': '#956fba',
}

function iconSign(scene: Scene, name: string, glyph: string): Mesh | undefined {
  try {
    const texture = new DynamicTexture(`${name}-texture`, { width: 128, height: 128 }, scene, false)
    texture.hasAlpha = true
    texture.drawText(glyph, null, 96, 'bold 96px sans-serif', '#ffffff', 'transparent', true)
    const material = new StandardMaterial(`${name}-material`, scene)
    material.diffuseTexture = texture
    material.useAlphaFromDiffuseTexture = true
    material.emissiveColor = Color3.White()
    material.disableLighting = true
    material.backFaceCulling = false
    const plane = MeshBuilder.CreatePlane(name, { size: 1.4 }, scene)
    plane.billboardMode = Mesh.BILLBOARDMODE_ALL
    plane.material = material
    plane.isPickable = false
    return plane
  } catch {
    // 測試環境沒有 2D context 時略過圖示。
    return undefined
  }
}

/**
 * 成就殿堂：九座基座排成弧形，完成的世界基座上有發光獎盃（世界顏色）與圖示，
 * 完美結局頂著緩緩旋轉的金星，未完成則是暗色基座加問號。
 * 天空、光影與雲朵沿用主畫面／基地的視覺語言。
 */
export function buildCollectionScene(
  engine: AbstractEngine,
  options: { worlds: readonly CollectionWorldStatus[]; reducedMotion: boolean },
): Scene {
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0.58, 0.76, 0.86, 1)

  const camera = new UniversalCamera('collection-camera', new Vector3(0, 5.4, -14), scene)
  camera.setTarget(new Vector3(0, 2.4, 6))
  scene.activeCamera = camera

  new HemisphericLight('collection-light', new Vector3(0.2, 1, 0.1), scene).intensity = 0.95
  applyWorldAmbience(scene, '#c2dde6', { top: '#6aa8d8', bottom: '#f0f6e4', namePrefix: 'collection' })
  addWorldLife(scene, { namePrefix: 'collection', reducedMotion: options.reducedMotion })

  const floor = MeshBuilder.CreateGround('collection-floor', { width: 60, height: 44 }, scene)
  const floorMaterial = new StandardMaterial('collection-floor-material', scene)
  floorMaterial.diffuseColor = Color3.FromHexString('#9fbfa0')
  floorMaterial.specularColor = Color3.Black()
  floor.material = floorMaterial

  const orbs: Array<{ node: TransformNode; phase: number }> = []
  const stars: Mesh[] = []

  options.worlds.forEach((world, index) => {
    const t = (index - (options.worlds.length - 1) / 2) / ((options.worlds.length - 1) / 2)
    const x = t * 11
    const z = 5 + t * t * 5

    const pedestalMaterial = new StandardMaterial(`collection-pedestal-${world.id}`, scene)
    pedestalMaterial.diffuseColor = world.completed
      ? Color3.FromHexString(world.color).scale(0.55)
      : Color3.FromHexString('#8f9c94')
    const pedestal = MeshBuilder.CreateCylinder(`collection-pedestal-mesh-${world.id}`, { height: 1.4, diameter: 1.7, tessellation: 18 }, scene)
    pedestal.position = new Vector3(x, 0.7, z)
    pedestal.material = pedestalMaterial

    if (world.completed) {
      const orbHolder = new TransformNode(`collection-orb-${world.id}`, scene)
      orbHolder.position = new Vector3(x, 2.35, z)
      const orb = MeshBuilder.CreateSphere(`collection-orb-mesh-${world.id}`, { diameter: 1.1, segments: 16 }, scene)
      const orbMaterial = new StandardMaterial(`collection-orb-material-${world.id}`, scene)
      orbMaterial.diffuseColor = Color3.FromHexString(world.color)
      orbMaterial.emissiveColor = Color3.FromHexString(world.color).scale(0.45)
      orb.material = orbMaterial
      orb.parent = orbHolder
      const sign = iconSign(scene, `collection-icon-${world.id}`, world.icon)
      if (sign) sign.position = new Vector3(x, 2.35, z)
      orbs.push({ node: orbHolder, phase: index })

      if (world.perfect) {
        const star = iconSign(scene, `collection-star-${world.id}`, '⭐')
        if (star) {
          star.position = new Vector3(x, 3.7, z)
          stars.push(star)
        }
      }
    } else {
      const question = iconSign(scene, `collection-question-${world.id}`, '❓')
      if (question) question.position = new Vector3(x, 2.3, z)
    }
  })

  const still =
    options.reducedMotion ||
    (typeof navigator !== 'undefined' && navigator.webdriver === true)
  if (!still) {
    let elapsed = 0
    scene.onBeforeRenderObservable.add(() => {
      const deltaSeconds = Math.min(engine.getDeltaTime() / 1000, 0.05)
      elapsed += deltaSeconds
      camera.position.x = Math.sin(elapsed * 0.16) * 3
      camera.setTarget(new Vector3(0, 2.4, 6))
      for (const orb of orbs) {
        orb.node.position.y = 2.35 + Math.sin(elapsed * 1.5 + orb.phase) * 0.14
      }
      for (const star of stars) {
        star.rotation.y += deltaSeconds * 1.4
      }
    })
  }

  return scene
}
