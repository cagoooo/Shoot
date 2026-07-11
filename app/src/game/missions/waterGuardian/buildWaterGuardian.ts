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

export function buildWaterGuardianScene(
  engine: AbstractEngine,
  inputManager: InputManager,
  comfortInput: Partial<ComfortSettings> = {},
): Scene {
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0.72, 0.9, 0.95, 1)
  scene.collisionsEnabled = true
  const comfort = normalizeComfortSettings(comfortInput)
  const camera = new UniversalCamera(
    'water-guardian-camera',
    new Vector3(0, 1.7, -14),
    scene,
  )
  camera.setTarget(new Vector3(0, 1.3, 0))
  camera.fov = (comfort.fieldOfView * Math.PI) / 180
  camera.angularSensibility = 2000 / comfort.sensitivity
  camera.checkCollisions = true
  camera.ellipsoid = new Vector3(0.45, 0.85, 0.45)
  scene.activeCamera = camera
  const canvas = engine.getRenderingCanvas()
  if (canvas) camera.attachControl(canvas, true)

  const light = new HemisphericLight('water-daylight', new Vector3(0.2, 1, 0.1), scene)
  light.intensity = 1
  const ground = MeshBuilder.CreateGround('water-station-ground', { width: 32, height: 40 }, scene)
  ground.checkCollisions = true
  const groundMaterial = new StandardMaterial('water-ground-material', scene)
  groundMaterial.diffuseColor = Color3.FromHexString('#8bc7a5')
  ground.material = groundMaterial

  const tankMaterial = new StandardMaterial('water-tank-material', scene)
  tankMaterial.diffuseColor = Color3.FromHexString('#4b9fbd')
  tankMaterial.emissiveColor = Color3.FromHexString('#0b3d4c')
  const tank = MeshBuilder.CreateCylinder('rainwater-tank', { height: 3.2, diameter: 3.4, tessellation: 16 }, scene)
  tank.position = new Vector3(-4, 1.6, 3)
  tank.material = tankMaterial
  tank.metadata = { waterStation: 'collect' }

  const filterMaterial = new StandardMaterial('filter-station-material', scene)
  filterMaterial.diffuseColor = Color3.FromHexString('#d6ad50')
  const filter = MeshBuilder.CreateBox('filter-station', { width: 3.2, height: 2.4, depth: 2.2 }, scene)
  filter.position = new Vector3(4, 1.2, 6)
  filter.material = filterMaterial
  filter.metadata = { waterStation: 'filter' }

  const cleanMaterial = new StandardMaterial('clean-water-material', scene)
  cleanMaterial.diffuseColor = Color3.FromHexString('#72d9ec')
  cleanMaterial.emissiveColor = Color3.FromHexString('#1c6b7a')
  const cleanTank = MeshBuilder.CreateCylinder('clean-water-tank', { height: 2.6, diameter: 2.8, tessellation: 16 }, scene)
  cleanTank.position = new Vector3(0, 1.3, 14)
  cleanTank.material = cleanMaterial
  cleanTank.metadata = { waterStation: 'distribute' }

  scene.onBeforeRenderObservable.add(() => {
    const input = inputManager.snapshot()
    const deltaSeconds = Math.min(engine.getDeltaTime() / 1000, 0.05)
    const next = integrateMovement(
      { x: camera.position.x, z: camera.position.z },
      input,
      deltaSeconds,
      4,
      camera.rotation.y,
    )
    camera.position.x = Math.max(-14, Math.min(14, next.x))
    camera.position.z = Math.max(-18, Math.min(20, next.z))
  })
  return scene
}
