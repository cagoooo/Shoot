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
import { addWorldLife, applyGroundTexture, applyWorldAmbience, burstParticles, createObjectiveBeacon } from '../objectiveBeacon'
import { computeObjectiveTracking, createTrackingEmitter, type ObjectiveTracking } from '../objectiveTracking'
import { createIntroOrbit } from '../introCinematic'
import { emitSceneInteraction, subscribeSceneState } from '../sceneInteraction'
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents'

export function buildWaterGuardianScene(
  engine: AbstractEngine,
  inputManager: InputManager,
  comfortInput: Partial<ComfortSettings> = {},
  objectivePosition?: { x: number; z: number; icon?: string },
  onObjectiveTracking?: (tracking: ObjectiveTracking) => void,
  sludge?: { count: number },
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
  scene.attachControl()

  const light = new HemisphericLight('water-daylight', new Vector3(0.2, 1, 0.1), scene)
  light.intensity = 1
  const ground = MeshBuilder.CreateGround('water-station-ground', { width: 32, height: 40 }, scene)
  ground.checkCollisions = true
  const groundMaterial = new StandardMaterial('water-ground-material', scene)
  groundMaterial.diffuseColor = Color3.FromHexString('#8bc7a5')
  ground.material = groundMaterial
  applyGroundTexture(scene, ground, '#8bc7a5', 'water')
  addWorldLife(scene, { namePrefix: 'water', reducedMotion: comfort.reducedMotion })

  const metalMaterial = new StandardMaterial('water-metal-material', scene)
  metalMaterial.diffuseColor = Color3.FromHexString('#9db4bd')
  const waterSurface = new StandardMaterial('water-surface-material', scene)
  waterSurface.diffuseColor = Color3.FromHexString('#6fcbe6')
  waterSurface.emissiveColor = Color3.FromHexString('#2a7f97')
  waterSurface.alpha = 0.9

  // 雨水收集桶：桶身＋頂蓋＋接雨漏斗＋水面＋束帶。
  const tankMaterial = new StandardMaterial('water-tank-material', scene)
  tankMaterial.diffuseColor = Color3.FromHexString('#4b9fbd')
  tankMaterial.emissiveColor = Color3.FromHexString('#0b3d4c')
  const tank = MeshBuilder.CreateCylinder('rainwater-tank', { height: 3.2, diameter: 3.4, tessellation: 20 }, scene)
  tank.position = new Vector3(-4, 1.6, 3)
  tank.material = tankMaterial
  tank.metadata = { waterStation: 'collect' }
  const tankBand = MeshBuilder.CreateTorus('rainwater-tank-band', { diameter: 3.5, thickness: 0.18, tessellation: 20 }, scene)
  tankBand.position.y = 0.4
  tankBand.material = metalMaterial
  tankBand.isPickable = false
  tankBand.parent = tank
  const funnel = MeshBuilder.CreateCylinder('rainwater-funnel', { diameterTop: 3, diameterBottom: 0.5, height: 1, tessellation: 20 }, scene)
  funnel.position.y = 2.1
  funnel.material = metalMaterial
  funnel.isPickable = false
  funnel.parent = tank
  const tankWater = MeshBuilder.CreateCylinder('rainwater-surface', { height: 0.1, diameter: 3, tessellation: 20 }, scene)
  tankWater.position.y = 1.5
  tankWater.material = waterSurface
  tankWater.isPickable = false
  tankWater.parent = tank

  // 過濾塔：塔身＋頂部漏斗＋三色濾層（布／砂／活性碳）＋支腳。
  const filterMaterial = new StandardMaterial('filter-station-material', scene)
  filterMaterial.diffuseColor = Color3.FromHexString('#d6ad50')
  const filter = MeshBuilder.CreateCylinder('filter-station', { diameter: 2.4, height: 2.6, tessellation: 20 }, scene)
  filter.position = new Vector3(4, 1.3, 6)
  filter.material = filterMaterial
  filter.metadata = { waterStation: 'filter' }
  const filterFunnel = MeshBuilder.CreateCylinder('filter-funnel', { diameterTop: 2.4, diameterBottom: 0.6, height: 0.9, tessellation: 20 }, scene)
  filterFunnel.position.y = 1.6
  filterFunnel.material = metalMaterial
  filterFunnel.isPickable = false
  filterFunnel.parent = filter
  for (const [layerIndex, hex] of ['#f2ede0', '#e2c37a', '#5a5a5a'].entries()) {
    const layerMaterial = new StandardMaterial(`filter-layer-${layerIndex}`, scene)
    layerMaterial.diffuseColor = Color3.FromHexString(hex)
    const layer = MeshBuilder.CreateCylinder(`filter-layer-mesh-${layerIndex}`, { diameter: 2.1, height: 0.5, tessellation: 20 }, scene)
    layer.position.y = 0.7 - layerIndex * 0.55
    layer.material = layerMaterial
    layer.isPickable = false
    layer.parent = filter
  }

  // 乾淨水箱：桶身＋水龍頭＋發光水面。
  const cleanMaterial = new StandardMaterial('clean-water-material', scene)
  cleanMaterial.diffuseColor = Color3.FromHexString('#72d9ec')
  cleanMaterial.emissiveColor = Color3.FromHexString('#1c6b7a')
  const cleanTank = MeshBuilder.CreateCylinder('clean-water-tank', { height: 2.6, diameter: 2.8, tessellation: 20 }, scene)
  cleanTank.position = new Vector3(0, 1.3, 14)
  cleanTank.material = cleanMaterial
  cleanTank.metadata = { waterStation: 'distribute' }
  const cleanSurface = MeshBuilder.CreateCylinder('clean-water-surface', { height: 0.12, diameter: 2.5, tessellation: 20 }, scene)
  cleanSurface.position.y = 1.3
  cleanSurface.material = waterSurface
  cleanSurface.isPickable = false
  cleanSurface.parent = cleanTank
  const tapArm = MeshBuilder.CreateCylinder('clean-water-tap', { diameter: 0.18, height: 0.9, tessellation: 10 }, scene)
  tapArm.rotation.z = Math.PI / 2
  tapArm.position.set(1.5, -0.6, 0)
  tapArm.material = metalMaterial
  tapArm.isPickable = false
  tapArm.parent = cleanTank
  const tapSpout = MeshBuilder.CreateCylinder('clean-water-spout', { diameter: 0.18, height: 0.4, tessellation: 10 }, scene)
  tapSpout.position.set(1.9, -0.85, 0)
  tapSpout.material = metalMaterial
  tapSpout.isPickable = false
  tapSpout.parent = cleanTank

  applyWorldAmbience(scene, '#b8dde6', { top: '#5fb0d4', bottom: '#eaf7f0', namePrefix: 'water' })
  if (objectivePosition) {
    createObjectiveBeacon(scene, objectivePosition, {
      namePrefix: 'water-objective',
      reducedMotion: comfort.reducedMotion,
      ringDiameter: 3.8,
      icon: objectivePosition.icon,
    })
  }
  if (sludge && sludge.count > 0) {
    const sludgeMaterial = new StandardMaterial('sludge-material', scene)
    sludgeMaterial.diffuseColor = Color3.FromHexString('#8a6a45')
    sludgeMaterial.emissiveColor = Color3.FromHexString('#3d2c15')
    const spots = [
      { x: -5.6, z: 2.2 },
      { x: -2.6, z: 3.8 },
      { x: -4.2, z: 4.9 },
    ]
    const whiteEye = new StandardMaterial('sludge-eye-white', scene)
    whiteEye.diffuseColor = Color3.White()
    whiteEye.emissiveColor = Color3.FromHexString('#eeeeee')
    const pupil = new StandardMaterial('sludge-eye-pupil', scene)
    pupil.diffuseColor = Color3.FromHexString('#222222')
    pupil.emissiveColor = Color3.FromHexString('#111111')

    const monsters = Array.from({ length: Math.min(sludge.count, spots.length) }, (_, index) => {
      const monster = MeshBuilder.CreateSphere(`sludge-monster-${index}`, { diameterX: 1.2, diameterY: 0.9, diameterZ: 1.2, segments: 10 }, scene)
      monster.position = new Vector3(spots[index].x, 0.5, spots[index].z)
      monster.material = sludgeMaterial
      monster.metadata = { sludgeIndex: index }
      // 大眼睛＋黑瞳孔，附著在身上一起移動與縮小。
      for (const offset of [-0.24, 0.24]) {
        const white = MeshBuilder.CreateSphere(`sludge-eye-${index}-${offset}`, { diameter: 0.34, segments: 8 }, scene)
        white.position = new Vector3(offset, 0.34, -0.42)
        white.material = whiteEye
        white.isPickable = false
        white.parent = monster
        const dot = MeshBuilder.CreateSphere(`sludge-pupil-${index}-${offset}`, { diameter: 0.16, segments: 6 }, scene)
        dot.position = new Vector3(offset, 0.34, -0.56)
        dot.material = pupil
        dot.isPickable = false
        dot.parent = monster
      }
      return monster
    })

    scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type !== PointerEventTypes.POINTERDOWN) return
      const picked = pointerInfo.pickInfo?.pickedMesh
      // 點到眼睛或身體都算點到該怪（往上找帶 sludgeIndex 的父節點）。
      let node: typeof picked = picked
      let index: number | undefined
      while (node) {
        const value = (node.metadata as { sludgeIndex?: number } | null)?.sludgeIndex
        if (typeof value === 'number') { index = value; break }
        node = node.parent as typeof picked
      }
      if (typeof index === 'number') {
        emitSceneInteraction({ kind: 'sludge', id: String(index) })
      }
    })

    // 淨化動畫：被點到的怪縮小旋轉後消失，同時噴出泡泡粒子。
    const vanishing: Array<{ monster: (typeof monsters)[number]; progress: number }> = []
    let hidden = 0
    const unsubscribe = subscribeSceneState((update) => {
      if (update.key !== 'water-purified') return
      while (hidden < update.value && hidden < monsters.length) {
        const monster = monsters[hidden]
        if (!monster.isDisposed()) {
          burstParticles(scene, { x: monster.position.x, y: monster.position.y + 0.4, z: monster.position.z }, '#7fd4e8', { reducedMotion: comfort.reducedMotion })
          if (comfort.reducedMotion) {
            monster.dispose()
          } else {
            monster.isPickable = false
            vanishing.push({ monster, progress: 0 })
          }
        }
        hidden += 1
      }
    })
    scene.onDisposeObservable.add(() => unsubscribe())

    if (!comfort.reducedMotion) {
      let elapsed = 0
      scene.onBeforeRenderObservable.add(() => {
        const deltaSeconds = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05)
        elapsed += deltaSeconds
        // 待機時輕輕晃動與擠壓，看起來活潑。
        for (const monster of monsters) {
          if (monster.isDisposed() || vanishing.some((entry) => entry.monster === monster)) continue
          const wobble = Math.sin(elapsed * 3 + monster.position.x) * 0.06
          monster.scaling.y = 1 + wobble
          monster.scaling.x = 1 - wobble * 0.5
        }
        // 淨化中的怪縮小旋轉後移除。
        for (let i = vanishing.length - 1; i >= 0; i -= 1) {
          const entry = vanishing[i]
          entry.progress += deltaSeconds / 0.4
          if (entry.progress >= 1 || entry.monster.isDisposed()) {
            if (!entry.monster.isDisposed()) entry.monster.dispose()
            vanishing.splice(i, 1)
            continue
          }
          const scale = 1 - entry.progress
          entry.monster.scaling.set(scale, scale, scale)
          entry.monster.rotation.y += deltaSeconds * 12
        }
      })
    }
  }

  const emitTracking = createTrackingEmitter(onObjectiveTracking)
  const intro = createIntroOrbit({
    key: 'water-guardian',
    center: { x: 0, z: 7 },
    disabled: comfort.reducedMotion || (typeof navigator !== 'undefined' && navigator.webdriver === true),
  })
  const spawnPosition = camera.position.clone()
  const spawnTarget = new Vector3(0, 1.3, 0)

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
    const next = integrateMovement(
      { x: camera.position.x, z: camera.position.z },
      input,
      deltaSeconds,
      4,
      camera.rotation.y,
    )
    camera.position.x = Math.max(-14, Math.min(14, next.x))
    camera.position.z = Math.max(-18, Math.min(20, next.z))
    if (objectivePosition) {
      emitTracking(computeObjectiveTracking(
        { x: camera.position.x, z: camera.position.z, yaw: camera.rotation.y },
        objectivePosition,
        4.5,
      ))
    }
  })
  return scene
}
