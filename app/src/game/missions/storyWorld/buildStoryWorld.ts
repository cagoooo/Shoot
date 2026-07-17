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
import { createIntroOrbit } from '../introCinematic'
import type { StoryMissionConfig } from './storyMissionConfig'

export function buildStoryWorldScene(
  engine: AbstractEngine,
  inputManager: InputManager,
  mission: StoryMissionConfig,
  comfortInput: Partial<ComfortSettings> = {},
  objectivePosition?: { x: number; z: number; icon?: string },
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

  const worldColor = Color3.FromHexString(mission.color)
  applyWorldAmbience(scene, '#cbe6d9', {
    top: Color3.Lerp(worldColor, Color3.FromHexString('#7db8dc'), 0.6).toHexString(),
    bottom: Color3.Lerp(worldColor, Color3.White(), 0.78).toHexString(),
    namePrefix: mission.id,
  })
  if (objectivePosition) {
    createObjectiveBeacon(scene, objectivePosition, {
      namePrefix: `${mission.id}-objective`,
      reducedMotion: comfort.reducedMotion,
      ringDiameter: 4.2,
      icon: objectivePosition.icon,
    })
  }
  const emitTracking = createTrackingEmitter(onObjectiveTracking)
  const intro = createIntroOrbit({
    key: mission.id,
    center: { x: 0, z: 7 },
    disabled: comfort.reducedMotion || (typeof navigator !== 'undefined' && navigator.webdriver === true),
  })
  const spawnPosition = camera.position.clone()
  const spawnTarget = new Vector3(0, 1.3, 3)

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

  if (mission.landmark === 'health') {
    const basinMaterial = new StandardMaterial(`${mission.id}-basin-material`, scene)
    basinMaterial.diffuseColor = Color3.FromHexString('#e8f4f6')
    const basin = MeshBuilder.CreateBox(`${mission.id}-wash-basin`, { width: 2.6, height: 1, depth: 1.2 }, scene)
    basin.position = new Vector3(-7, 0.5, 4)
    basin.material = basinMaterial
    const faucetMaterial = new StandardMaterial(`${mission.id}-faucet-material`, scene)
    faucetMaterial.diffuseColor = Color3.FromHexString('#9db4bd')
    for (const [index, offset] of [-0.8, 0, 0.8].entries()) {
      const faucet = MeshBuilder.CreateCylinder(`${mission.id}-faucet-${index}`, { height: 0.7, diameter: 0.14 }, scene)
      faucet.position = new Vector3(-7 + offset, 1.35, 3.6)
      faucet.material = faucetMaterial
    }
    const stationMaterial = new StandardMaterial(`${mission.id}-water-station-material`, scene)
    stationMaterial.diffuseColor = Color3.FromHexString('#5fb3d9')
    stationMaterial.emissiveColor = Color3.FromHexString('#123c4f')
    const waterStation = MeshBuilder.CreateBox(`${mission.id}-water-station`, { width: 1.6, height: 2, depth: 1.2 }, scene)
    waterStation.position = new Vector3(7, 1, 4)
    waterStation.material = stationMaterial
    const bubbleMaterial = new StandardMaterial(`${mission.id}-bubble-material`, scene)
    bubbleMaterial.diffuseColor = Color3.FromHexString('#bfeef5')
    bubbleMaterial.alpha = 0.55
    for (const [index, spot] of [{ x: -3, y: 2.2, z: 9 }, { x: 2, y: 3, z: 10 }, { x: 5, y: 1.8, z: 8 }].entries()) {
      const bubble = MeshBuilder.CreateSphere(`${mission.id}-bubble-${index}`, { diameter: 0.9 + index * 0.3, segments: 10 }, scene)
      bubble.position = new Vector3(spot.x, spot.y, spot.z)
      bubble.material = bubbleMaterial
    }
  }

  if (mission.landmark === 'home') {
    const wallMaterial = new StandardMaterial(`${mission.id}-wall-material`, scene)
    wallMaterial.diffuseColor = Color3.FromHexString('#e8d9c4')
    const roofMaterial = new StandardMaterial(`${mission.id}-roof-material`, scene)
    roofMaterial.diffuseColor = Color3.FromHexString('#a34f3f')
    for (const [index, spot] of [{ x: -9, z: 11 }, { x: 9, z: 13 }].entries()) {
      const house = MeshBuilder.CreateBox(`${mission.id}-house-${index}`, { width: 3, height: 2.2, depth: 2.6 }, scene)
      house.position = new Vector3(spot.x, 1.1, spot.z)
      house.material = wallMaterial
      const roof = MeshBuilder.CreateCylinder(`${mission.id}-roof-${index}`, { height: 2.8, diameter: 2.6, tessellation: 3 }, scene)
      roof.rotation.z = Math.PI / 2
      roof.position = new Vector3(spot.x, 2.75, spot.z)
      roof.material = roofMaterial
    }
    const drainMaterial = new StandardMaterial(`${mission.id}-drain-material`, scene)
    drainMaterial.diffuseColor = Color3.FromHexString('#5a6b70')
    const drain = MeshBuilder.CreateCylinder(`${mission.id}-drain`, { height: 0.16, diameter: 2.4, tessellation: 16 }, scene)
    drain.position = new Vector3(-7, 0.08, 4)
    drain.material = drainMaterial
    const signMaterial = new StandardMaterial(`${mission.id}-sign-material`, scene)
    signMaterial.diffuseColor = Color3.FromHexString('#f0c93f')
    const signPole = MeshBuilder.CreateCylinder(`${mission.id}-sign-pole`, { height: 2.4, diameter: 0.16 }, scene)
    signPole.position = new Vector3(7, 1.2, 3.4)
    signPole.material = signMaterial
    const signBoard = MeshBuilder.CreateBox(`${mission.id}-sign-board`, { width: 1.4, height: 0.9, depth: 0.12 }, scene)
    signBoard.position = new Vector3(7, 2.1, 3.4)
    signBoard.material = signMaterial
    const bagMaterial = new StandardMaterial(`${mission.id}-sandbag-material`, scene)
    bagMaterial.diffuseColor = Color3.FromHexString('#b09a72')
    for (const [index, offset] of [-0.9, 0, 0.9].entries()) {
      const sandbag = MeshBuilder.CreateSphere(`${mission.id}-sandbag-${index}`, { diameterX: 1, diameterY: 0.55, diameterZ: 0.7, segments: 8 }, scene)
      sandbag.position = new Vector3(7 + offset, 0.28, 4.8)
      sandbag.material = bagMaterial
    }
  }

  if (mission.landmark === 'ocean') {
    const poolMaterial = new StandardMaterial(`${mission.id}-pool-material`, scene)
    poolMaterial.diffuseColor = Color3.FromHexString('#3f86b8')
    poolMaterial.emissiveColor = Color3.FromHexString('#0c3d5c')
    poolMaterial.alpha = 0.85
    for (const [index, spot] of [{ x: -7, z: 4, d: 3.4 }, { x: 7, z: 4, d: 2.8 }].entries()) {
      const pool = MeshBuilder.CreateCylinder(`${mission.id}-tide-pool-${index}`, { height: 0.14, diameter: spot.d, tessellation: 20 }, scene)
      pool.position = new Vector3(spot.x, 0.07, spot.z)
      pool.material = poolMaterial
    }
    const buoyMaterial = new StandardMaterial(`${mission.id}-buoy-material`, scene)
    buoyMaterial.diffuseColor = Color3.FromHexString('#e2574c')
    const buoyPole = MeshBuilder.CreateCylinder(`${mission.id}-buoy-pole`, { height: 1.6, diameter: 0.14 }, scene)
    buoyPole.position = new Vector3(-4, 0.8, 10)
    buoyPole.material = buoyMaterial
    const buoyBall = MeshBuilder.CreateSphere(`${mission.id}-buoy-ball`, { diameter: 0.7, segments: 10 }, scene)
    buoyBall.position = new Vector3(-4, 1.8, 10)
    buoyBall.material = buoyMaterial
    const debrisMaterial = new StandardMaterial(`${mission.id}-debris-material`, scene)
    debrisMaterial.diffuseColor = Color3.FromHexString('#8d8d84')
    for (const [index, spot] of [{ x: 5.6, z: 3.2 }, { x: 8.2, z: 4.6 }, { x: 6.8, z: 5.4 }].entries()) {
      const debris = MeshBuilder.CreateBox(`${mission.id}-debris-${index}`, { width: 0.7, height: 0.4, depth: 0.5 }, scene)
      debris.position = new Vector3(spot.x, 0.2, spot.z)
      debris.rotation.y = index * 0.9
      debris.material = debrisMaterial
    }
  }

  if (mission.landmark === 'partners') {
    const worldColors = ['#e2574c', '#77a96e', '#d8914d', '#70b8c1', '#b0836e', '#4f91bb', '#956fba', '#e4b64e', '#5eb987']
    for (const [index, hex] of worldColors.entries()) {
      const angle = (index / worldColors.length) * Math.PI * 2
      const pillarMaterial = new StandardMaterial(`${mission.id}-pillar-material-${index}`, scene)
      pillarMaterial.diffuseColor = Color3.FromHexString(hex)
      pillarMaterial.emissiveColor = Color3.FromHexString(hex).scale(0.18)
      const pillar = MeshBuilder.CreateCylinder(`${mission.id}-pillar-${index}`, { height: 1.8 + (index % 3) * 0.4, diameter: 0.5 }, scene)
      pillar.position = new Vector3(Math.sin(angle) * 6, 0.9 + (index % 3) * 0.2, 7 + Math.cos(angle) * 6)
      pillar.material = pillarMaterial
    }
    const tableMaterial = new StandardMaterial(`${mission.id}-table-material`, scene)
    tableMaterial.diffuseColor = Color3.FromHexString('#d9cff0')
    for (const spot of [{ x: -7, z: 4 }, { x: 7, z: 4 }]) {
      const table = MeshBuilder.CreateCylinder(`${mission.id}-table-${spot.x}`, { height: 0.9, diameter: 2.2, tessellation: 16 }, scene)
      table.position = new Vector3(spot.x, 0.45, spot.z)
      table.material = tableMaterial
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
    const introPose = intro.update(deltaSeconds, input.moveX !== 0 || input.moveY !== 0 || input.lookX !== 0 || input.lookY !== 0)
    if (introPose) {
      camera.position.set(introPose.x, introPose.y, introPose.z)
      camera.setTarget(new Vector3(introPose.targetX, introPose.targetY, introPose.targetZ))
      return
    }
    if (intro.consumeJustFinished()) {
      camera.position.copyFrom(spawnPosition)
      camera.setTarget(spawnTarget)
    }
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
