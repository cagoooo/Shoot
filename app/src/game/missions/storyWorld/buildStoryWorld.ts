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
import { applyWorldAmbience, createObjectiveBeacon } from '../objectiveBeacon'
import { computeObjectiveTracking, createTrackingEmitter, type ObjectiveTracking } from '../objectiveTracking'
import type { StoryMissionConfig } from './storyMissionConfig'

export function buildStoryWorldScene(
  engine: AbstractEngine,
  inputManager: InputManager,
  mission: StoryMissionConfig,
  comfortInput: Partial<ComfortSettings> = {},
  objectivePosition?: { x: number; z: number },
  onObjectiveTracking?: (tracking: ObjectiveTracking) => void,
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

  applyWorldAmbience(scene, '#cbe6d9')
  if (objectivePosition) {
    createObjectiveBeacon(scene, objectivePosition, {
      namePrefix: `${mission.id}-objective`,
      reducedMotion: comfort.reducedMotion,
      ringDiameter: 4.2,
    })
  }
  const emitTracking = createTrackingEmitter(onObjectiveTracking)

  for (const [index, x] of [-6, -3, 3, 6].entries()) {
    const beacon = MeshBuilder.CreateCylinder(`${mission.id}-beacon-${index}`, { height: 2.2, diameter: 0.34 }, scene)
    beacon.position = new Vector3(x, 1.1, 11 + (index % 2) * 3)
    beacon.material = landmarkMaterial
  }

  if (mission.landmark === 'forest') {
    const trunkMaterial = new StandardMaterial(`${mission.id}-trunk-material`, scene)
    trunkMaterial.diffuseColor = Color3.FromHexString('#8a6a48')
    const crownMaterial = new StandardMaterial(`${mission.id}-crown-material`, scene)
    crownMaterial.diffuseColor = Color3.FromHexString('#4f8f4f')
    for (const [index, spot] of [{ x: -10, z: 10 }, { x: 9, z: 12 }, { x: -4, z: 16 }].entries()) {
      const trunk = MeshBuilder.CreateCylinder(`${mission.id}-tree-trunk-${index}`, { height: 3, diameter: 0.6 }, scene)
      trunk.position = new Vector3(spot.x, 1.5, spot.z)
      trunk.material = trunkMaterial
      const crown = MeshBuilder.CreateSphere(`${mission.id}-tree-crown-${index}`, { diameter: 2.6, segments: 10 }, scene)
      crown.position = new Vector3(spot.x, 3.5, spot.z)
      crown.material = crownMaterial
    }
    const soilMaterial = new StandardMaterial(`${mission.id}-soil-material`, scene)
    soilMaterial.diffuseColor = Color3.FromHexString('#6b5136')
    const soilPatch = MeshBuilder.CreateCylinder(`${mission.id}-soil-patch`, { height: 0.2, diameter: 4, tessellation: 18 }, scene)
    soilPatch.position = new Vector3(-7, 0.1, 4)
    soilPatch.material = soilMaterial
    const seedlingMaterial = new StandardMaterial(`${mission.id}-seedling-material`, scene)
    seedlingMaterial.diffuseColor = Color3.FromHexString('#7fbf6a')
    for (const [index, offset] of [-1, 0, 1].entries()) {
      const seedling = MeshBuilder.CreateCylinder(`${mission.id}-seedling-${index}`, { height: 0.9, diameterTop: 0, diameterBottom: 0.55 }, scene)
      seedling.position = new Vector3(7 + offset, 0.45, 4 + Math.abs(offset) * 0.8)
      seedling.material = seedlingMaterial
    }
  }

  if (mission.landmark === 'food') {
    const crateMaterial = new StandardMaterial(`${mission.id}-crate-material`, scene)
    crateMaterial.diffuseColor = Color3.FromHexString('#c48a4f')
    for (const [index, spot] of [{ x: -7.6, z: 3.4 }, { x: -6.4, z: 4.6 }, { x: -7, z: 4 }].entries()) {
      const crate = MeshBuilder.CreateBox(`${mission.id}-crate-${index}`, { size: 1.1 }, scene)
      crate.position = new Vector3(spot.x, index === 2 ? 1.65 : 0.55, spot.z)
      crate.material = crateMaterial
    }
    const coolBoxMaterial = new StandardMaterial(`${mission.id}-coolbox-material`, scene)
    coolBoxMaterial.diffuseColor = Color3.FromHexString('#7fb7d9')
    const coolBox = MeshBuilder.CreateBox(`${mission.id}-coolbox`, { width: 1.8, height: 1.4, depth: 1.2 }, scene)
    coolBox.position = new Vector3(-5, 0.7, 5.4)
    coolBox.material = coolBoxMaterial
    const standMaterial = new StandardMaterial(`${mission.id}-stand-material`, scene)
    standMaterial.diffuseColor = Color3.FromHexString('#e0b64f')
    const shareStand = MeshBuilder.CreateBox(`${mission.id}-share-stand`, { width: 2.6, height: 1.1, depth: 1.4 }, scene)
    shareStand.position = new Vector3(7, 0.55, 4)
    shareStand.material = standMaterial
    const roof = MeshBuilder.CreateCylinder(`${mission.id}-share-roof`, { height: 0.3, diameter: 3.2, tessellation: 4 }, scene)
    roof.position = new Vector3(7, 2.3, 4)
    roof.material = standMaterial
  }

  scene.onBeforeRenderObservable.add(() => {
    const input = inputManager.snapshot()
    const deltaSeconds = Math.min(engine.getDeltaTime() / 1000, 0.05)
    applyTouchLook(camera, input, deltaSeconds)
    const next = integrateMovement({ x: camera.position.x, z: camera.position.z }, input, deltaSeconds, 4, camera.rotation.y)
    camera.position.x = Math.max(-14, Math.min(14, next.x))
    camera.position.z = Math.max(-18, Math.min(21, next.z))
    if (objectivePosition) {
      emitTracking(computeObjectiveTracking(
        { x: camera.position.x, z: camera.position.z, yaw: camera.rotation.y },
        objectivePosition,
        4.8,
      ))
    }
  })
  return scene
}
