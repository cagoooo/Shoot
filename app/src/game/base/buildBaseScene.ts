import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Scene } from '@babylonjs/core/scene'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents'
import { addWorldLife, applyWorldAmbience } from '../missions/objectiveBeacon'
import { emitSceneInteraction } from '../missions/sceneInteraction'

interface BaseZoneBuilding {
  id: 'mission' | 'workbench' | 'range' | 'report' | 'collection'
  name: string
  emoji: string
  hex: string
  x: number
  z: number
  width: number
  height: number
}

const buildings: readonly BaseZoneBuilding[] = [
  { id: 'mission', name: '今天任務', emoji: '🗺️', hex: '#e4c05a', x: 0, z: 7, width: 4.4, height: 3.4 },
  { id: 'workbench', name: '工具桌', emoji: '🔧', hex: '#79aec9', x: -8.2, z: 4.4, width: 3.2, height: 2.5 },
  { id: 'range', name: '試玩區', emoji: '🎯', hex: '#7fb787', x: 8.2, z: 4.4, width: 3.2, height: 2.5 },
  { id: 'report', name: '行動紀錄', emoji: '📒', hex: '#c9a179', x: -4.6, z: 1.6, width: 2.7, height: 2.2 },
  { id: 'collection', name: '成就收藏冊', emoji: '⭐', hex: '#b294cf', x: 4.6, z: 1.6, width: 2.7, height: 2.2 },
]

/**
 * 3D 基地村落：五座可點擊的建築（點擊即前往該區），
 * 各有漂浮招牌（圖示＋中文名）；與主畫面同一套天空、光影與雲朵。
 */
export function buildBaseScene(
  engine: AbstractEngine,
  options: { reducedMotion: boolean } = { reducedMotion: false },
): Scene {
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0.62, 0.79, 0.86, 1)

  const camera = new UniversalCamera('base-camera', new Vector3(0, 4.2, -13.5), scene)
  camera.setTarget(new Vector3(0, 2, 4))
  scene.activeCamera = camera

  new HemisphericLight('base-light', new Vector3(0.2, 1, 0.1), scene).intensity = 0.95
  applyWorldAmbience(scene, '#c2dde6', { top: '#6aa8d8', bottom: '#f0f6e4', namePrefix: 'base' })
  addWorldLife(scene, { namePrefix: 'base', reducedMotion: options.reducedMotion })

  const ground = MeshBuilder.CreateGround('base-ground', { width: 64, height: 48 }, scene)
  const groundMaterial = new StandardMaterial('base-ground-material', scene)
  groundMaterial.diffuseColor = Color3.FromHexString('#93bd8d')
  groundMaterial.specularColor = Color3.Black()
  ground.material = groundMaterial

  const pathMaterial = new StandardMaterial('base-path-material', scene)
  pathMaterial.diffuseColor = Color3.FromHexString('#d9cba6')
  for (const building of buildings) {
    const length = Math.hypot(building.x, building.z + 13.5)
    const path = MeshBuilder.CreateBox(`base-path-${building.id}`, { width: 1.4, height: 0.05, depth: length * 0.55 }, scene)
    path.position = new Vector3(building.x * 0.45, 0.03, (building.z - 4) * 0.5)
    path.rotation.y = Math.atan2(building.x, building.z + 13.5)
    path.material = pathMaterial
  }

  const signPlanes: Mesh[] = []
  for (const building of buildings) {
    const wallMaterial = new StandardMaterial(`base-wall-${building.id}`, scene)
    wallMaterial.diffuseColor = Color3.FromHexString(building.hex)
    const body = MeshBuilder.CreateBox(`base-building-${building.id}`, { width: building.width, height: building.height, depth: building.width * 0.8 }, scene)
    body.position = new Vector3(building.x, building.height / 2, building.z)
    body.material = wallMaterial
    body.metadata = { baseZone: building.id }

    const roofMaterial = new StandardMaterial(`base-roof-${building.id}`, scene)
    roofMaterial.diffuseColor = Color3.FromHexString(building.hex).scale(0.66)
    const roof = MeshBuilder.CreateCylinder(`base-roof-${building.id}`, { height: building.width * 0.9, diameter: building.width * 1.05, tessellation: 4 }, scene)
    roof.rotation.z = Math.PI / 2
    roof.rotation.y = Math.PI / 4
    roof.position = new Vector3(building.x, building.height + 0.55, building.z)
    roof.material = roofMaterial
    roof.metadata = { baseZone: building.id }

    try {
      const texture = new DynamicTexture(`base-sign-texture-${building.id}`, { width: 256, height: 128 }, scene, false)
      texture.hasAlpha = true
      texture.drawText(building.emoji, null, 62, 'bold 56px sans-serif', '#ffffff', 'transparent', true)
      texture.drawText(building.name, null, 112, 'bold 34px sans-serif', '#ffffff', 'transparent', true)
      const signMaterial = new StandardMaterial(`base-sign-material-${building.id}`, scene)
      signMaterial.diffuseTexture = texture
      signMaterial.useAlphaFromDiffuseTexture = true
      signMaterial.emissiveColor = Color3.White()
      signMaterial.disableLighting = true
      signMaterial.backFaceCulling = false
      const sign = MeshBuilder.CreatePlane(`base-sign-${building.id}`, { width: 3.4, height: 1.7 }, scene)
      sign.position = new Vector3(building.x, building.height + 1.9, building.z)
      sign.billboardMode = Mesh.BILLBOARDMODE_ALL
      sign.material = signMaterial
      sign.isPickable = false
      signPlanes.push(sign)
    } catch {
      // 測試環境沒有 2D context 時略過招牌，建築仍可互動。
    }
  }

  scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type !== PointerEventTypes.POINTERDOWN) return
    const zone = (pointerInfo.pickInfo?.pickedMesh?.metadata as { baseZone?: string } | null)?.baseZone
    if (zone) emitSceneInteraction({ kind: 'base-zone', id: zone })
  })

  if (!options.reducedMotion) {
    let elapsed = 0
    scene.onBeforeRenderObservable.add(() => {
      const deltaSeconds = Math.min(engine.getDeltaTime() / 1000, 0.05)
      elapsed += deltaSeconds
      camera.position.x = Math.sin(elapsed * 0.1) * 2.2
      camera.setTarget(new Vector3(0, 2, 4))
      for (const [index, sign] of signPlanes.entries()) {
        sign.position.y += Math.sin(elapsed * 1.3 + index) * 0.0015
      }
    })
  }

  return scene
}
