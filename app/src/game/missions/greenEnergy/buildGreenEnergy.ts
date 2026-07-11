import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Scene } from '@babylonjs/core/scene'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { normalizeComfortSettings, type ComfortSettings } from '../../../domain/settings/accessibility'
import { InputManager } from '../../../input/InputManager'
import { integrateMovement } from '../../player/PlayerController'

export function buildGreenEnergyScene(
  engine: AbstractEngine,
  inputManager: InputManager,
  comfortInput: Partial<ComfortSettings> = {},
  objectivePosition?: { x: number; z: number },
  onProximityChange?: (near: boolean) => void,
): Scene {
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0.76, 0.9, 0.98, 1)
  const comfort = normalizeComfortSettings(comfortInput)
  const camera = new UniversalCamera('green-energy-camera', new Vector3(0, 1.7, -15), scene)
  camera.setTarget(new Vector3(0, 1.2, 1))
  camera.fov = (comfort.fieldOfView * Math.PI) / 180
  camera.angularSensibility = 2000 / comfort.sensitivity
  scene.activeCamera = camera
  const canvas = engine.getRenderingCanvas()
  if (canvas) camera.attachControl(canvas, true)
  new HemisphericLight('green-energy-light', new Vector3(0.2, 1, 0.1), scene).intensity = 1

  const ground = MeshBuilder.CreateGround('green-energy-ground', { width: 32, height: 42 }, scene)
  const groundMaterial = new StandardMaterial('green-energy-ground-material', scene)
  groundMaterial.diffuseColor = Color3.FromHexString('#86b987')
  ground.material = groundMaterial

  const solarMaterial = new StandardMaterial('solar-material', scene)
  solarMaterial.diffuseColor = Color3.FromHexString('#386f9a')
  solarMaterial.emissiveColor = Color3.FromHexString('#122c42')
  for (const x of [-3, 0, 3]) {
    const panel = MeshBuilder.CreateBox(`solar-panel-${x}`, { width: 2.4, height: 0.12, depth: 1.7 }, scene)
    panel.position = new Vector3(x, 1.25, 4)
    panel.rotation.x = Math.PI / 7
    panel.material = solarMaterial
  }

  const windMaterial = new StandardMaterial('wind-material', scene)
  windMaterial.diffuseColor = Color3.FromHexString('#e7f4f3')
  const windTower = MeshBuilder.CreateCylinder('wind-turbine', { height: 5.8, diameter: 0.32 }, scene)
  windTower.position = new Vector3(-6, 2.9, 7)
  windTower.material = windMaterial
  const batteryMaterial = new StandardMaterial('battery-material', scene)
  batteryMaterial.diffuseColor = Color3.FromHexString('#e4b64e')
  batteryMaterial.emissiveColor = Color3.FromHexString('#5b3906')
  const battery = MeshBuilder.CreateBox('community-battery', { width: 3.5, height: 2.2, depth: 2 }, scene)
  battery.position = new Vector3(5, 1.1, 11)
  battery.material = batteryMaterial

  if (objectivePosition) {
    const markerMaterial = new StandardMaterial('energy-objective-marker-material', scene)
    markerMaterial.emissiveColor = Color3.FromHexString('#d9ff4a')
    const marker = MeshBuilder.CreateTorus('energy-objective-marker', { diameter: 3.8, thickness: 0.14, tessellation: 24 }, scene)
    marker.position = new Vector3(objectivePosition.x, 0.12, objectivePosition.z)
    marker.material = markerMaterial
  }
  let wasNear: boolean | undefined

  scene.onBeforeRenderObservable.add(() => {
    const input = inputManager.snapshot()
    const deltaSeconds = Math.min(engine.getDeltaTime() / 1000, 0.05)
    const next = integrateMovement({ x: camera.position.x, z: camera.position.z }, input, deltaSeconds, 4, camera.rotation.y)
    camera.position.x = Math.max(-14, Math.min(14, next.x))
    camera.position.z = Math.max(-18, Math.min(21, next.z))
    if (objectivePosition) {
      const near = Math.hypot(camera.position.x - objectivePosition.x, camera.position.z - objectivePosition.z) <= 4.5
      if (near !== wasNear) {
        wasNear = near
        onProximityChange?.(near)
      }
    }
  })
  return scene
}
