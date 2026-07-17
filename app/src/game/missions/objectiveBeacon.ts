import { Color3 } from '@babylonjs/core/Maths/math.color'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import type { GroundMesh } from '@babylonjs/core/Meshes/groundMesh'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
// DynamicTexture 需要引擎端擴充；WebGL 與 WebGPU 兩條路徑都要載入，缺一個就會在執行期丟
// 「engine.createDynamicTexture is not a function」。
import '@babylonjs/core/Engines/Extensions/engine.dynamicTexture'
import '@babylonjs/core/Engines/WebGPU/Extensions/engine.dynamicTexture'
import { Scene } from '@babylonjs/core/scene'

/**
 * 目標地點的發光信標：地面光環＋直上天際的光柱。
 * reducedMotion 為 false 時光環會緩慢脈動，幫助學生遠距離辨識。
 */
export function createObjectiveBeacon(
  scene: Scene,
  position: { x: number; z: number },
  options: { namePrefix: string; reducedMotion: boolean; ringDiameter?: number; icon?: string },
): void {
  const { namePrefix, reducedMotion, ringDiameter = 4, icon } = options

  const ringMaterial = new StandardMaterial(`${namePrefix}-beacon-ring-material`, scene)
  ringMaterial.emissiveColor = Color3.FromHexString('#d9ff4a')
  const ring = MeshBuilder.CreateTorus(
    `${namePrefix}-beacon-ring`,
    { diameter: ringDiameter, thickness: 0.15, tessellation: 24 },
    scene,
  )
  ring.position = new Vector3(position.x, 0.12, position.z)
  ring.material = ringMaterial
  ring.isPickable = false

  const beamMaterial = new StandardMaterial(`${namePrefix}-beacon-beam-material`, scene)
  beamMaterial.emissiveColor = Color3.FromHexString('#eaff9a')
  beamMaterial.disableLighting = true
  beamMaterial.alpha = 0.32
  const beam = MeshBuilder.CreateCylinder(
    `${namePrefix}-beacon-beam`,
    { height: 14, diameterTop: 0.5, diameterBottom: 1.1, tessellation: 12 },
    scene,
  )
  beam.position = new Vector3(position.x, 7, position.z)
  beam.material = beamMaterial
  beam.isPickable = false

  let iconPlane: Mesh | undefined
  const iconBaseY = 3.4
  if (icon) {
    const texture = new DynamicTexture(`${namePrefix}-beacon-icon-texture`, { width: 256, height: 256 }, scene, false)
    texture.hasAlpha = true
    texture.drawText(icon, null, 190, 'bold 170px sans-serif', '#ffffff', 'transparent', true)
    const iconMaterial = new StandardMaterial(`${namePrefix}-beacon-icon-material`, scene)
    iconMaterial.diffuseTexture = texture
    iconMaterial.useAlphaFromDiffuseTexture = true
    iconMaterial.emissiveColor = Color3.White()
    iconMaterial.disableLighting = true
    iconMaterial.backFaceCulling = false
    iconPlane = MeshBuilder.CreatePlane(`${namePrefix}-beacon-icon`, { size: 2.2 }, scene)
    iconPlane.position = new Vector3(position.x, iconBaseY, position.z)
    iconPlane.billboardMode = Mesh.BILLBOARDMODE_ALL
    iconPlane.material = iconMaterial
    iconPlane.isPickable = false
  }

  if (!reducedMotion) {
    let elapsed = 0
    scene.onBeforeRenderObservable.add(() => {
      elapsed += scene.getEngine().getDeltaTime() / 1000
      const pulse = 1 + Math.sin(elapsed * 2.2) * 0.08
      ring.scaling.x = pulse
      ring.scaling.z = pulse
      beamMaterial.alpha = 0.26 + (Math.sin(elapsed * 2.2) + 1) * 0.06
      if (iconPlane) iconPlane.position.y = iconBaseY + Math.sin(elapsed * 1.6) * 0.22
    })
  }
}

/**
 * 世界光影與生氣：低強度方向光讓物體各面亮度不同（不開陰影、平板友善），
 * 加上幾朵慢慢漂的雲；開啟減少動態時雲朵靜止。
 */
export function addWorldLife(
  scene: Scene,
  options: { namePrefix: string; reducedMotion: boolean },
): void {
  const { namePrefix, reducedMotion } = options

  const sun = new DirectionalLight(`${namePrefix}-sun`, new Vector3(-0.45, -1, 0.4), scene)
  sun.intensity = 0.4
  sun.diffuse = Color3.FromHexString('#fff2d8')

  const cloudMaterial = new StandardMaterial(`${namePrefix}-cloud-material`, scene)
  cloudMaterial.diffuseColor = Color3.White()
  cloudMaterial.emissiveColor = Color3.FromHexString('#f4f8fa').scale(0.5)
  cloudMaterial.alpha = 0.88
  cloudMaterial.fogEnabled = false

  const clouds = [
    { x: -14, y: 15, z: 18, scale: 1.4, speed: 0.35 },
    { x: 4, y: 17, z: 26, scale: 2, speed: 0.22 },
    { x: 16, y: 14, z: 10, scale: 1.1, speed: 0.45 },
  ].map((spot, index) => {
    const cloud = MeshBuilder.CreateSphere(`${namePrefix}-cloud-${index}`, { diameterX: 6 * spot.scale, diameterY: 1.6 * spot.scale, diameterZ: 3 * spot.scale, segments: 8 }, scene)
    cloud.position = new Vector3(spot.x, spot.y, spot.z)
    cloud.material = cloudMaterial
    cloud.isPickable = false
    cloud.applyFog = false
    return { cloud, speed: spot.speed }
  })

  if (!reducedMotion) {
    scene.onBeforeRenderObservable.add(() => {
      const deltaSeconds = scene.getEngine().getDeltaTime() / 1000
      for (const { cloud, speed } of clouds) {
        cloud.position.x += speed * deltaSeconds
        if (cloud.position.x > 26) cloud.position.x = -26
      }
    })
  }
}

/**
 * 程序化地面質感：以底色加上深淺斑點的重複貼圖取代單色地板。
 * NullEngine（測試環境）沒有 2D context 時自動跳過。
 */
export function applyGroundTexture(
  scene: Scene,
  ground: GroundMesh,
  baseHex: string,
  namePrefix: string,
): void {
  const texture = new DynamicTexture(`${namePrefix}-ground-texture`, { width: 128, height: 128 }, scene, true)
  const context = texture.getContext()
  if (!context || typeof context.fillRect !== 'function') {
    texture.dispose()
    return
  }
  const base = Color3.FromHexString(baseHex)
  const shade = (factor: number) =>
    `rgb(${Math.round(base.r * 255 * factor)}, ${Math.round(base.g * 255 * factor)}, ${Math.round(base.b * 255 * factor)})`
  context.fillStyle = shade(1)
  context.fillRect(0, 0, 128, 128)
  for (let index = 0; index < 46; index += 1) {
    context.fillStyle = shade(index % 2 === 0 ? 0.93 : 1.06)
    const size = 3 + (index % 5) * 2
    context.beginPath()
    context.arc((index * 37) % 128, (index * 53) % 128, size, 0, Math.PI * 2)
    context.fill()
  }
  texture.update(false)
  texture.uScale = 6
  texture.vScale = 7

  const material = new StandardMaterial(`${namePrefix}-ground-textured-material`, scene)
  material.diffuseTexture = texture
  material.specularColor = Color3.Black()
  ground.material = material
}

/**
 * 世界氛圍：以世界主色調加入線性霧氣，讓遠近層次更明顯；
 * 若提供天空色，另建立漸層天空穹頂（上深下淺）取代單色背景。
 */
export function applyWorldAmbience(
  scene: Scene,
  fogHex: string,
  sky?: { top: string; bottom: string; namePrefix?: string },
): void {
  scene.fogMode = Scene.FOGMODE_LINEAR
  scene.fogStart = 20
  scene.fogEnd = 62
  scene.fogColor = Color3.FromHexString(fogHex)

  if (!sky) return
  const namePrefix = sky.namePrefix ?? 'world'
  const texture = new DynamicTexture(`${namePrefix}-sky-texture`, { width: 4, height: 256 }, scene, false)
  const context = texture.getContext()
  if (!context || typeof context.createLinearGradient !== 'function') {
    // NullEngine（測試環境）沒有 2D 繪圖 context，跳過天空穹頂。
    texture.dispose()
    return
  }
  const gradient = context.createLinearGradient(0, 0, 0, 256)
  gradient.addColorStop(0, sky.top)
  gradient.addColorStop(1, sky.bottom)
  context.fillStyle = gradient
  context.fillRect(0, 0, 4, 256)
  texture.update(false)

  const skyMaterial = new StandardMaterial(`${namePrefix}-sky-material`, scene)
  skyMaterial.emissiveTexture = texture
  skyMaterial.diffuseColor = Color3.Black()
  skyMaterial.specularColor = Color3.Black()
  skyMaterial.disableLighting = true
  skyMaterial.backFaceCulling = false
  skyMaterial.fogEnabled = false

  const skyDome = MeshBuilder.CreateSphere(`${namePrefix}-sky-dome`, { diameter: 160, segments: 12 }, scene)
  skyDome.material = skyMaterial
  skyDome.isPickable = false
  skyDome.infiniteDistance = true
  skyDome.applyFog = false
}
