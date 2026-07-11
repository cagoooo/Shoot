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
import { applyTouchLook } from '../../player/applyTouchLook'
import type { StoryMissionConfig } from './storyMissionConfig'

export function buildStoryWorldScene(
  engine: AbstractEngine,
  inputManager: InputManager,
  mission: StoryMissionConfig,
  comfortInput: Partial<ComfortSettings> = {},
  objectivePosition?: { x: number; z: number },
  onProximityChange?: (near: boolean) => void,
): Scene {
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0.79, 0.9, 0.84, 1)
  const comfort = normalizeComfortSettings(comfortInput)
  const camera = new UniversalCamera(`${mission.id}-camera`, new Vector3(0, 1.7, -15), scene)
  camera.setTarget(new Vector3(0, 1.3, 3))
  camera.fov = (comfort.fieldOfView * Math.PI) / 180
  camera.angularSensibility = 2000 / comfort.sensitivity
  scene.activeCamera = camera
  const canvas = engine.getRenderingCanvas()
  if (canvas) camera.attachControl(canvas, true)
  new HemisphericLight(`${mission.id}-light`, new Vector3(0.2, 1, 0.1), scene).intensity = 1

  const ground = MeshBuilder.CreateGround(`${mission.id}-ground`, { width: 32, height: 42 }, scene)
  const groundMaterial = new StandardMaterial(`${mission.id}-ground-material`, scene)
  groundMaterial.diffuseColor = Color3.FromHexString(mission.color)
  ground.material = groundMaterial

  const landmarkMaterial = new StandardMaterial(`${mission.id}-landmark-material`, scene)
  landmarkMaterial.diffuseColor = Color3.FromHexString('#f4efda')
  landmarkMaterial.emissiveColor = Color3.FromHexString(mission.color).scale(0.12)
  const landmark = mission.landmark === 'forest'
    ? MeshBuilder.CreateCylinder(`${mission.id}-landmark`, { height: 5.5, diameterTop: 0.8, diameterBottom: 1.8 }, scene)
    : mission.landmark === 'food'
      ? MeshBuilder.CreateBox(`${mission.id}-landmark`, { width: 5, height: 2.5, depth: 3 }, scene)
      : mission.landmark === 'health'
        ? MeshBuilder.CreateSphere(`${mission.id}-landmark`, { diameter: 3.2, segments: 16 }, scene)
        : mission.landmark === 'home'
          ? MeshBuilder.CreateBox(`${mission.id}-landmark`, { width: 4.5, height: 3.6, depth: 4 }, scene)
          : mission.landmark === 'ocean'
            ? MeshBuilder.CreateCylinder(`${mission.id}-landmark`, { height: 1.1, diameter: 7, tessellation: 20 }, scene)
            : MeshBuilder.CreatePolyhedron(`${mission.id}-landmark`, { type: 1, size: 2.3 }, scene)
  landmark.position = new Vector3(0, mission.landmark === 'ocean' ? 0.55 : 1.8, 7)
  landmark.material = landmarkMaterial

  if (objectivePosition) {
    const markerMaterial = new StandardMaterial(`${mission.id}-objective-marker-material`, scene)
    markerMaterial.emissiveColor = Color3.FromHexString('#d9ff4a')
    const marker = MeshBuilder.CreateTorus(`${mission.id}-objective-marker`, { diameter: 4.2, thickness: 0.15, tessellation: 24 }, scene)
    marker.position = new Vector3(objectivePosition.x, 0.12, objectivePosition.z)
    marker.material = markerMaterial
  }
  let wasNear: boolean | undefined

  for (const [index, x] of [-6, -3, 3, 6].entries()) {
    const beacon = MeshBuilder.CreateCylinder(`${mission.id}-beacon-${index}`, { height: 2.2, diameter: 0.34 }, scene)
    beacon.position = new Vector3(x, 1.1, 11 + (index % 2) * 3)
    beacon.material = landmarkMaterial
  }

  scene.onBeforeRenderObservable.add(() => {
    const input = inputManager.snapshot()
    const deltaSeconds = Math.min(engine.getDeltaTime() / 1000, 0.05)
    applyTouchLook(camera, input, deltaSeconds)
    const next = integrateMovement({ x: camera.position.x, z: camera.position.z }, input, deltaSeconds, 4, camera.rotation.y)
    camera.position.x = Math.max(-14, Math.min(14, next.x))
    camera.position.z = Math.max(-18, Math.min(21, next.z))
    if (objectivePosition) {
      const near = Math.hypot(camera.position.x - objectivePosition.x, camera.position.z - objectivePosition.z) <= 4.8
      if (near !== wasNear) {
        wasNear = near
        onProximityChange?.(near)
      }
    }
  })
  return scene
}
