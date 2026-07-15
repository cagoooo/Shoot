import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Scene } from '@babylonjs/core/scene'
import type { InputManager } from '../../../input/InputManager'
import {
  DEFAULT_COMFORT_SETTINGS,
  normalizeComfortSettings,
  type ComfortSettings,
} from '../../../domain/settings/accessibility'
import { integrateMovement } from '../../player/PlayerController'
import { applyTouchLook } from '../../player/applyTouchLook'
import { applyWorldAmbience, createObjectiveBeacon } from '../objectiveBeacon'
import { computeObjectiveTracking, createTrackingEmitter, type ObjectiveTracking } from '../objectiveTracking'
import {
  recyclingStormZones,
  zoneConnections,
  zonePositions,
  type RecyclingStormZone,
  type RouteKind,
} from './zones'

export interface RecyclingStationAssetProvider {
  load(scene: Scene): Promise<boolean>
}

const routeColors: Record<RouteKind, Color3> = {
  'main-route': Color3.FromHexString('#ebc95d'),
  'maintenance-route': Color3.FromHexString('#77a9d7'),
  shared: Color3.FromHexString('#84caa4'),
}

function createRouteSegment(
  scene: Scene,
  from: RecyclingStormZone,
  to: RecyclingStormZone,
  route: RouteKind,
) {
  const start = zonePositions[from]
  const end = zonePositions[to]
  const deltaX = end.x - start.x
  const deltaZ = end.z - start.z
  const length = Math.hypot(deltaX, deltaZ)
  const path = MeshBuilder.CreateBox(
    `route-${from}-${to}`,
    { width: 2.2, height: 0.08, depth: length },
    scene,
  )
  path.position = new Vector3(
    (start.x + end.x) / 2,
    0.06,
    (start.z + end.z) / 2,
  )
  path.rotation.y = Math.atan2(deltaX, deltaZ)
  path.metadata = { route, from, to }
  const material = new StandardMaterial(`route-material-${from}-${to}`, scene)
  material.diffuseColor = routeColors[route]
  path.material = material
  return path
}

export function buildRecyclingStormScene(
  engine: AbstractEngine,
  inputManager: InputManager,
  assetProvider?: RecyclingStationAssetProvider,
  comfortInput: Partial<ComfortSettings> = DEFAULT_COMFORT_SETTINGS,
  objectivePosition?: { x: number; z: number },
  onObjectiveTracking?: (tracking: ObjectiveTracking) => void,
): Scene {
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0.78, 0.9, 0.94, 1)
  scene.collisionsEnabled = true

  const camera = new UniversalCamera(
    'mission-player-camera',
    new Vector3(0, 1.7, -19),
    scene,
  )
  camera.setTarget(new Vector3(0, 1.4, -11))
  camera.minZ = 0.1
  const comfort = normalizeComfortSettings(comfortInput)
  camera.fov = (comfort.fieldOfView * Math.PI) / 180
  camera.angularSensibility = 2000 / comfort.sensitivity
  camera.keysUp = []
  camera.keysDown = []
  camera.keysLeft = []
  camera.keysRight = []
  camera.checkCollisions = true
  camera.ellipsoid = new Vector3(0.45, 0.85, 0.45)
  scene.activeCamera = camera

  const canvas = engine.getRenderingCanvas()
  if (canvas) camera.attachControl(canvas, true)

  const light = new HemisphericLight(
    'mission-daylight',
    new Vector3(0.3, 1, 0.15),
    scene,
  )
  light.intensity = 0.95

  const ground = MeshBuilder.CreateGround(
    'recycling-station-ground',
    { width: 34, height: 52 },
    scene,
  )
  ground.checkCollisions = true
  const groundMaterial = new StandardMaterial('mission-ground-material', scene)
  groundMaterial.diffuseColor = Color3.FromHexString('#7eaa7c')
  ground.material = groundMaterial

  for (const zoneId of recyclingStormZones) {
    const zone = zonePositions[zoneId]
    const platform = MeshBuilder.CreateBox(
      `zone-${zoneId}`,
      { width: 5, height: 0.18, depth: 4 },
      scene,
    )
    platform.position = new Vector3(zone.x, 0.1, zone.z)
    platform.checkCollisions = true
    platform.metadata = { zoneId, interactionPoint: true }
    const material = new StandardMaterial(`zone-material-${zoneId}`, scene)
    material.diffuseColor = Color3.FromHexString(zone.color)
    platform.material = material

    const beacon = MeshBuilder.CreateCylinder(
      `beacon-${zoneId}`,
      { height: 2.2, diameter: 0.28 },
      scene,
    )
    beacon.position = new Vector3(zone.x - 1.8, 1.2, zone.z)
    beacon.metadata = { zoneId, guideBeacon: true }
    beacon.material = material
  }

  for (const connection of zoneConnections) {
    createRouteSegment(scene, connection.from, connection.to, connection.route)
  }

  const protectedSeedling = MeshBuilder.CreateCylinder(
    'protected-seedling',
    { height: 1.4, diameterTop: 0.2, diameterBottom: 0.7 },
    scene,
  )
  protectedSeedling.position = new Vector3(-7.5, 0.7, -5)
  protectedSeedling.metadata = { targetKind: 'protected' }
  const seedlingMaterial = new StandardMaterial('seedling-material', scene)
  seedlingMaterial.diffuseColor = Color3.FromHexString('#2c8b57')
  protectedSeedling.material = seedlingMaterial

  for (const [index, position] of [
    new Vector3(-4.5, 0.3, -3.5),
    new Vector3(5, 0.3, -3),
    new Vector3(-3, 0.3, 13),
  ].entries()) {
    const marker = MeshBuilder.CreateSphere(
      `troublemaker-spawn-${index + 1}`,
      { diameter: 0.35, segments: 8 },
      scene,
    )
    marker.position = position
    marker.metadata = { spawnKind: 'troublemaker' }
    marker.isVisible = false
  }

  const evacuation = MeshBuilder.CreateCylinder(
    'rooftop-evacuation-point',
    { height: 0.12, diameter: 3.2 },
    scene,
  )
  evacuation.position = new Vector3(0, 0.18, 21)
  evacuation.metadata = { interaction: 'evacuate', protected: true }
  const evacuationMaterial = new StandardMaterial('evacuation-material', scene)
  evacuationMaterial.diffuseColor = Color3.FromHexString('#50c7d4')
  evacuationMaterial.emissiveColor = Color3.FromHexString('#0d5660')
  evacuation.material = evacuationMaterial

  const machineBody = MeshBuilder.CreateCylinder(
    'storm-machine-body',
    { height: 3.6, diameter: 3.4, tessellation: 12 },
    scene,
  )
  machineBody.position = new Vector3(0, 1.9, 14)
  machineBody.metadata = { machinePart: 'main-body' }
  const machineMaterial = new StandardMaterial('storm-machine-material', scene)
  machineMaterial.diffuseColor = Color3.FromHexString('#596b76')
  machineBody.material = machineMaterial

  const coreMaterial = new StandardMaterial('storm-core-warning-material', scene)
  coreMaterial.diffuseColor = Color3.FromHexString('#f1bd3f')
  coreMaterial.emissiveColor = Color3.FromHexString('#6b4300')
  for (const [index, offset] of [-1.05, 0, 1.05].entries()) {
    const core = MeshBuilder.CreateSphere(
      `storm-core-${index + 1}`,
      { diameter: 0.62, segments: 10 },
      scene,
    )
    core.position = new Vector3(offset, 2.1, 12.35)
    core.metadata = {
      stormCore: true,
      targetKind: 'trouble-core',
      warningCue: 'yellow',
    }
    core.material = coreMaterial
  }

  const protectedPanel = MeshBuilder.CreateBox(
    'protected-energy-panel',
    { width: 2.2, height: 1.1, depth: 0.25 },
    scene,
  )
  protectedPanel.position = new Vector3(0, 0.9, 12.3)
  protectedPanel.metadata = {
    machinePart: 'protected-energy-panel',
    targetKind: 'protected',
  }
  const panelMaterial = new StandardMaterial('protected-panel-material', scene)
  panelMaterial.diffuseColor = Color3.FromHexString('#48a878')
  protectedPanel.material = panelMaterial

  applyWorldAmbience(scene, '#c6dfe6')
  if (objectivePosition) {
    createObjectiveBeacon(scene, objectivePosition, {
      namePrefix: 'recycling-objective',
      reducedMotion: comfort.reducedMotion,
      ringDiameter: 4.2,
    })
  }
  const emitTracking = createTrackingEmitter(onObjectiveTracking)

  scene.onBeforeRenderObservable.add(() => {
    const input = inputManager.snapshot()
    const deltaSeconds = Math.min(engine.getDeltaTime() / 1000, 0.05)
    applyTouchLook(camera, input, deltaSeconds)
    const next = integrateMovement(
      { x: camera.position.x, z: camera.position.z },
      input,
      deltaSeconds,
      4,
      camera.rotation.y,
    )
    camera.position.x = Math.max(-16, Math.min(16, next.x))
    camera.position.z = Math.max(-21, Math.min(24, next.z))
    if (objectivePosition) {
      emitTracking(computeObjectiveTracking(
        { x: camera.position.x, z: camera.position.z, yaw: camera.rotation.y },
        objectivePosition,
        4.8,
      ))
    }
  })

  if (assetProvider) void assetProvider.load(scene)
  return scene
}
