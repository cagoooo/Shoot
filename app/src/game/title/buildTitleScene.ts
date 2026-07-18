import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Scene } from '@babylonjs/core/scene'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { addWorldLife, applyWorldAmbience } from '../missions/objectiveBeacon'

/** 主畫面能否使用 3D 渲染（測試環境與不支援 WebGL 的舊瀏覽器退回靜態背景）。 */
export function canRenderTitle3D(): boolean {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

const worldPillarColors = [
  '#e2574c', '#77a96e', '#d8914d', '#70b8c1', '#b0836e',
  '#4f91bb', '#956fba', '#e4b64e', '#5eb987',
]

/**
 * 主畫面迎賓場景：緩緩自轉的地球、環繞的九色世界柱與星核，
 * 鏡頭繞著地球慢速環繞；開啟減少動態時全部靜止。
 */
export function buildTitleScene(
  engine: AbstractEngine,
  options: { reducedMotion: boolean } = { reducedMotion: false },
): Scene {
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0.55, 0.75, 0.88, 1)

  const center = new Vector3(0, 2.6, 0)
  const camera = new UniversalCamera('title-camera', new Vector3(0, 3.4, -13), scene)
  camera.setTarget(center)
  scene.activeCamera = camera

  new HemisphericLight('title-light', new Vector3(0.2, 1, 0.1), scene).intensity = 0.95
  applyWorldAmbience(scene, '#bcd8e6', { top: '#5f9fd4', bottom: '#f2f7e6', namePrefix: 'title' })
  addWorldLife(scene, { namePrefix: 'title', reducedMotion: options.reducedMotion })

  const ground = MeshBuilder.CreateGround('title-ground', { width: 60, height: 60 }, scene)
  const groundMaterial = new StandardMaterial('title-ground-material', scene)
  groundMaterial.diffuseColor = Color3.FromHexString('#8fbf8f')
  groundMaterial.specularColor = Color3.Black()
  ground.material = groundMaterial

  // 地球：藍底綠地的手繪感貼圖，緩緩自轉。
  const earth = MeshBuilder.CreateSphere('title-earth', { diameter: 4.4, segments: 24 }, scene)
  earth.position = center.clone()
  const earthMaterial = new StandardMaterial('title-earth-material', scene)
  earthMaterial.diffuseColor = Color3.FromHexString('#3f86c8')
  earthMaterial.specularColor = Color3.Black()
  const earthTexture = new DynamicTexture('title-earth-texture', { width: 256, height: 128 }, scene, false)
  const context = earthTexture.getContext()
  if (context && typeof context.arc === 'function') {
    context.fillStyle = '#3f86c8'
    context.fillRect(0, 0, 256, 128)
    context.fillStyle = '#59a862'
    for (const [x, y, r] of [[40, 46, 22], [92, 78, 16], [150, 38, 20], [204, 84, 18], [232, 30, 12], [16, 96, 12]] as const) {
      context.beginPath()
      context.arc(x, y, r, 0, Math.PI * 2)
      context.fill()
      context.beginPath()
      context.arc(x + r * 0.7, y + r * 0.4, r * 0.6, 0, Math.PI * 2)
      context.fill()
    }
    earthTexture.update(false)
    earthMaterial.diffuseTexture = earthTexture
  } else {
    earthTexture.dispose()
  }
  earth.material = earthMaterial

  // 星核：地球上方緩慢旋轉的發光多面體。
  const core = MeshBuilder.CreatePolyhedron('title-core', { type: 1, size: 0.55 }, scene)
  core.position = new Vector3(center.x, center.y + 3.4, center.z)
  const coreMaterial = new StandardMaterial('title-core-material', scene)
  coreMaterial.emissiveColor = Color3.FromHexString('#ffe97a')
  coreMaterial.diffuseColor = Color3.FromHexString('#e4b64e')
  core.material = coreMaterial

  // 九色世界柱環繞地球，代表九大世界。
  for (const [index, hex] of worldPillarColors.entries()) {
    const angle = (index / worldPillarColors.length) * Math.PI * 2
    const pillarMaterial = new StandardMaterial(`title-pillar-material-${index}`, scene)
    pillarMaterial.diffuseColor = Color3.FromHexString(hex)
    pillarMaterial.emissiveColor = Color3.FromHexString(hex).scale(0.22)
    const pillar = MeshBuilder.CreateCylinder(`title-pillar-${index}`, { height: 1.7 + (index % 3) * 0.5, diameter: 0.55 }, scene)
    pillar.position = new Vector3(Math.sin(angle) * 7.2, 0.9 + (index % 3) * 0.25, Math.cos(angle) * 7.2)
    pillar.material = pillarMaterial
  }

  if (!options.reducedMotion) {
    let elapsed = 0
    scene.onBeforeRenderObservable.add(() => {
      const deltaSeconds = Math.min(engine.getDeltaTime() / 1000, 0.05)
      elapsed += deltaSeconds
      earth.rotation.y += deltaSeconds * 0.25
      core.rotation.y -= deltaSeconds * 0.6
      core.position.y = center.y + 3.4 + Math.sin(elapsed * 1.4) * 0.25
      const angle = elapsed * 0.12
      camera.position.x = Math.sin(angle) * 13
      camera.position.z = -Math.cos(angle) * 13
      camera.setTarget(center)
    })
  }

  return scene
}
