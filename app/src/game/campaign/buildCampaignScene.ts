import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import { Scene } from '@babylonjs/core/scene'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents'
import { addWorldLife, applyWorldAmbience } from '../missions/objectiveBeacon'
import { emitSceneInteraction } from '../missions/sceneInteraction'

export interface CampaignWorldStatus {
  id: string
  order: number
  icon: string
  color: string
  unlocked: boolean
  playable: boolean
  completed: boolean
}

function billboardGlyph(scene: Scene, name: string, glyph: string, size: number): Mesh | undefined {
  try {
    const texture = new DynamicTexture(`${name}-texture`, { width: 128, height: 128 }, scene, false)
    texture.hasAlpha = true
    texture.drawText(glyph, null, 96, 'bold 92px sans-serif', '#ffffff', 'transparent', true)
    const material = new StandardMaterial(`${name}-material`, scene)
    material.diffuseTexture = texture
    material.useAlphaFromDiffuseTexture = true
    material.emissiveColor = Color3.White()
    material.disableLighting = true
    material.backFaceCulling = false
    const plane = MeshBuilder.CreatePlane(name, { size }, scene)
    plane.billboardMode = Mesh.BILLBOARDMODE_ALL
    plane.material = material
    plane.isPickable = false
    return plane
  } catch {
    return undefined
  }
}

function createEarth(scene: Scene, position: Vector3): Mesh {
  const earth = MeshBuilder.CreateSphere('campaign-earth', { diameter: 6.4, segments: 24 }, scene)
  earth.position = position
  const material = new StandardMaterial('campaign-earth-material', scene)
  material.diffuseColor = Color3.FromHexString('#3f86c8')
  material.specularColor = Color3.Black()
  try {
    const texture = new DynamicTexture('campaign-earth-texture', { width: 256, height: 128 }, scene, false)
    const context = texture.getContext()
    if (context && typeof context.arc === 'function') {
      context.fillStyle = '#3f86c8'
      context.fillRect(0, 0, 256, 128)
      context.fillStyle = '#59a862'
      for (const [x, y, r] of [[40, 46, 22], [92, 78, 16], [150, 38, 20], [204, 84, 18], [232, 30, 12], [16, 96, 12]] as const) {
        context.beginPath()
        context.arc(x, y, r, 0, Math.PI * 2)
        context.fill()
      }
      texture.update(false)
      material.diffuseTexture = texture
    } else {
      texture.dispose()
    }
  } catch {
    // 測試環境略過貼圖。
  }
  earth.material = material
  earth.isPickable = false
  return earth
}

/**
 * 3D 地球行動地圖：正中一顆自轉地球，九個世界標記排成弧形環繞在前。
 * 可遊玩的標記亮起世界色並可點擊進關，已完成的頂著金星，未解鎖的暗灰加問號。
 */
export function buildCampaignScene(
  engine: AbstractEngine,
  options: { worlds: readonly CampaignWorldStatus[]; reducedMotion: boolean },
): Scene {
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0.55, 0.74, 0.86, 1)

  const camera = new UniversalCamera('campaign-camera', new Vector3(0, 5, -15), scene)
  camera.setTarget(new Vector3(0, 3, 6))
  scene.activeCamera = camera

  new HemisphericLight('campaign-light', new Vector3(0.2, 1, 0.1), scene).intensity = 0.85
  const sun = new DirectionalLight('campaign-sun', new Vector3(-0.45, -1, 0.4), scene)
  sun.intensity = 0.5
  applyWorldAmbience(scene, '#c2dde6', { top: '#5f9fd4', bottom: '#eef6e4', namePrefix: 'campaign' })
  addWorldLife(scene, { namePrefix: 'campaign', reducedMotion: options.reducedMotion })

  const earth = createEarth(scene, new Vector3(0, 7.5, 12))

  const markers: Array<{ node: TransformNode; phase: number }> = []
  const stars: Mesh[] = []

  options.worlds.forEach((world, index) => {
    const count = options.worlds.length
    const t = (index - (count - 1) / 2) / ((count - 1) / 2)
    const x = t * 12
    const z = 4 + t * t * 5
    const y = 2.2

    const holder = new TransformNode(`campaign-marker-${world.id}`, scene)
    holder.position = new Vector3(x, y, z)

    const orb = MeshBuilder.CreateSphere(`campaign-marker-mesh-${world.id}`, { diameter: 1.3, segments: 16 }, scene)
    const material = new StandardMaterial(`campaign-marker-material-${world.id}`, scene)
    if (world.playable || world.completed) {
      material.diffuseColor = Color3.FromHexString(world.color)
      material.emissiveColor = Color3.FromHexString(world.color).scale(world.playable && !world.completed ? 0.5 : 0.3)
    } else {
      material.diffuseColor = Color3.FromHexString('#8f9c94')
      material.emissiveColor = Color3.FromHexString('#8f9c94').scale(0.1)
    }
    orb.material = material
    orb.parent = holder
    // 只有可遊玩的世界能被點擊；其餘標記不進入拾取。
    orb.isPickable = world.playable
    orb.metadata = { campaignWorld: world.id }

    const icon = billboardGlyph(scene, `campaign-icon-${world.id}`, world.unlocked ? world.icon : '❓', 1.2)
    if (icon) icon.position = new Vector3(x, y, z - 0.05)

    const orderSign = billboardGlyph(scene, `campaign-order-${world.id}`, String(world.order), 0.7)
    if (orderSign) orderSign.position = new Vector3(x, y - 1.1, z)

    markers.push({ node: holder, phase: index })

    if (world.completed) {
      const star = billboardGlyph(scene, `campaign-star-${world.id}`, '⭐', 0.8)
      if (star) {
        star.position = new Vector3(x, y + 1.1, z)
        stars.push(star)
      }
    }
  })

  scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type !== PointerEventTypes.POINTERDOWN) return
    const id = (pointerInfo.pickInfo?.pickedMesh?.metadata as { campaignWorld?: string } | null)?.campaignWorld
    if (id) emitSceneInteraction({ kind: 'campaign-world', id })
  })

  const still =
    options.reducedMotion ||
    (typeof navigator !== 'undefined' && navigator.webdriver === true)
  if (!still) {
    let elapsed = 0
    scene.onBeforeRenderObservable.add(() => {
      const deltaSeconds = Math.min(engine.getDeltaTime() / 1000, 0.05)
      elapsed += deltaSeconds
      earth.rotation.y += deltaSeconds * 0.2
      for (const marker of markers) {
        marker.node.position.y = 2.2 + Math.sin(elapsed * 1.4 + marker.phase) * 0.12
      }
      for (const star of stars) {
        star.rotation.y += deltaSeconds * 1.4
      }
    })
  }

  return scene
}
