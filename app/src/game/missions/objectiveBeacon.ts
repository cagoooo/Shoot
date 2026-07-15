import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Scene } from '@babylonjs/core/scene'

/**
 * 目標地點的發光信標：地面光環＋直上天際的光柱。
 * reducedMotion 為 false 時光環會緩慢脈動，幫助學生遠距離辨識。
 */
export function createObjectiveBeacon(
  scene: Scene,
  position: { x: number; z: number },
  options: { namePrefix: string; reducedMotion: boolean; ringDiameter?: number },
): void {
  const { namePrefix, reducedMotion, ringDiameter = 4 } = options

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

  if (!reducedMotion) {
    let elapsed = 0
    scene.onBeforeRenderObservable.add(() => {
      elapsed += scene.getEngine().getDeltaTime() / 1000
      const pulse = 1 + Math.sin(elapsed * 2.2) * 0.08
      ring.scaling.x = pulse
      ring.scaling.z = pulse
      beamMaterial.alpha = 0.26 + (Math.sin(elapsed * 2.2) + 1) * 0.06
    })
  }
}

/**
 * 世界氛圍：以世界主色調加入線性霧氣，讓遠近層次更明顯。
 */
export function applyWorldAmbience(scene: Scene, fogHex: string): void {
  scene.fogMode = Scene.FOGMODE_LINEAR
  scene.fogStart = 20
  scene.fogEnd = 62
  scene.fogColor = Color3.FromHexString(fogHex)
}
