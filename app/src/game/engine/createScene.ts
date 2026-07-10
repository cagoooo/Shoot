import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Scene } from '@babylonjs/core/scene'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import {
  DEFAULT_COMFORT_SETTINGS,
  normalizeComfortSettings,
  type ComfortSettings,
} from '../../domain/settings/accessibility'
import { InputManager } from '../../input/InputManager'
import { stepPlayerCamera } from '../player/PlayerController'

export function createGameScene(
  engine: AbstractEngine,
  inputManager = new InputManager(),
  comfortInput: Partial<ComfortSettings> = DEFAULT_COMFORT_SETTINGS,
): Scene {
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0.85, 0.93, 0.9, 1)
  const comfort = normalizeComfortSettings(comfortInput)

  const camera = new UniversalCamera(
    'player-camera',
    new Vector3(0, 1.7, -7),
    scene,
  )
  camera.setTarget(new Vector3(0, 1.3, 0))
  camera.minZ = 0.1
  camera.fov = (comfort.fieldOfView * Math.PI) / 180
  camera.angularSensibility = 2000 / comfort.sensitivity
  camera.keysUp = []
  camera.keysDown = []
  camera.keysLeft = []
  camera.keysRight = []
  scene.activeCamera = camera

  const canvas = engine.getRenderingCanvas()
  if (canvas) camera.attachControl(canvas, true)

  scene.onBeforeRenderObservable.add(() => {
    const input = inputManager.snapshot()
    const deltaSeconds = Math.min(engine.getDeltaTime() / 1000, 0.05)
    stepPlayerCamera(camera, input, deltaSeconds, 4)
  })

  const light = new HemisphericLight(
    'sky-light',
    new Vector3(0.2, 1, 0.3),
    scene,
  )
  light.intensity = 0.92
  light.diffuse = new Color3(1, 0.97, 0.82)
  light.groundColor = new Color3(0.32, 0.5, 0.42)

  const ground = MeshBuilder.CreateGround(
    'ground',
    { width: 24, height: 24 },
    scene,
  )
  const groundMaterial = new StandardMaterial('ground-material', scene)
  groundMaterial.diffuseColor = new Color3(0.32, 0.58, 0.38)
  ground.material = groundMaterial

  const energyCore = MeshBuilder.CreatePolyhedron(
    'energy-core',
    { type: 1, size: 1.1 },
    scene,
  )
  energyCore.position = new Vector3(0, 1.3, 1)
  const coreMaterial = new StandardMaterial('energy-core-material', scene)
  coreMaterial.diffuseColor = new Color3(0.95, 0.68, 0.16)
  coreMaterial.emissiveColor = new Color3(0.25, 0.12, 0.01)
  energyCore.material = coreMaterial

  return scene
}
