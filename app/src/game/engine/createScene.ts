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
import {
  coolWeapon,
  createWeaponState,
  fireWeapon,
  type WeaponState,
} from '../../domain/combat/weaponState'
import { selectAimTarget } from '../combat/AimAssist'
import { RaycastTool } from '../combat/RaycastTool'
import { cleanseEnemy, updateEnemy } from '../../domain/enemies/enemyState'
import { EnemyPool } from '../enemies/EnemyPool'

export function createGameScene(
  engine: AbstractEngine,
  inputManager = new InputManager(),
  comfortInput: Partial<ComfortSettings> = DEFAULT_COMFORT_SETTINGS,
  onWeaponStateChange?: (state: WeaponState) => void,
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
  energyCore.metadata = { targetKind: 'protected' }

  const targetPositions = [
    new Vector3(-3, 1.5, 4),
    new Vector3(0, 1.3, 6),
    new Vector3(3, 1.7, 5),
  ]
  const enemyPool = new EnemyPool()
  const troublemakers = new Map<
    string,
    {
      controller: NonNullable<ReturnType<EnemyPool['acquire']>>
      material: StandardMaterial
    }
  >()
  for (const [index, position] of targetPositions.entries()) {
    const controller = enemyPool.acquire(index % 2 === 0 ? 'sticky' : 'power-thief')
    if (!controller) continue
    const target = MeshBuilder.CreateSphere(
      `trouble-core-${index + 1}`,
      { diameter: 0.9, segments: 12 },
      scene,
    )
    target.position = position
    target.metadata = { targetKind: 'trouble-core' }
    const targetMaterial = new StandardMaterial(
      `trouble-core-material-${index + 1}`,
      scene,
    )
    targetMaterial.diffuseColor = new Color3(0.64, 0.28, 0.75)
    targetMaterial.emissiveColor = new Color3(0.15, 0.03, 0.2)
    target.material = targetMaterial
    troublemakers.set(target.name, { controller, material: targetMaterial })
  }

  scene.onBeforeRenderObservable.add(() => {
    const elapsedMs = Math.min(engine.getDeltaTime(), 50)
    for (const { controller, material } of troublemakers.values()) {
      if (!controller.active) continue
      controller.state = updateEnemy(controller.state, {
        playerVisible: true,
        elapsedMs,
      })
      material.emissiveColor =
        controller.state.kind === 'telegraph'
          ? new Color3(0.5, 0.34, 0.02)
          : controller.state.kind === 'action'
            ? new Color3(0.38, 0.08, 0.42)
            : new Color3(0.15, 0.03, 0.2)
    }
  })

  const raycastTool = new RaycastTool(scene)
  let weaponState = createWeaponState()
  let previousPrimaryUse = false
  let hudUpdateWait = 0
  onWeaponStateChange?.({ ...weaponState })

  scene.onBeforeRenderObservable.add(() => {
    const input = inputManager.snapshot()
    const deltaSeconds = Math.min(engine.getDeltaTime() / 1000, 0.05)
    const cooled = coolWeapon(weaponState, 14 * deltaSeconds)
    if (cooled.heat !== weaponState.heat) {
      weaponState = cooled
      hudUpdateWait += deltaSeconds
      if (hudUpdateWait >= 0.1 || weaponState.heat === 0) {
        onWeaponStateChange?.({ ...weaponState })
        hudUpdateWait = 0
      }
    }

    if (input.primaryUse && !previousPrimaryUse) {
      const fired = fireWeapon(weaponState, { energyCost: 8, heat: 22 })
      if (fired !== weaponState) {
        weaponState = fired
        const forward = camera.getForwardRay().direction
        const candidates = scene.meshes
          .filter((mesh) => mesh.metadata?.targetKind)
          .map((mesh) => ({
            id: mesh.name,
            kind: mesh.metadata.targetKind as 'trouble-core' | 'protected',
            direction: mesh.getAbsolutePosition().subtract(camera.globalPosition),
            distance: Vector3.Distance(
              mesh.getAbsolutePosition(),
              camera.globalPosition,
            ),
          }))
        const assisted = selectAimTarget(forward, candidates, 8)
        const direction = assisted
          ? scene.getMeshByName(assisted.id)!
              .getAbsolutePosition()
              .subtract(camera.globalPosition)
          : forward
        const hit = raycastTool.fire(camera.globalPosition, direction)
        if (hit) {
          const troublemaker = troublemakers.get(hit.mesh.name)
          if (troublemaker) {
            troublemaker.controller.state = cleanseEnemy(
              troublemaker.controller.state,
            )
            const recycledItem = MeshBuilder.CreateBox(
              `recycled-item-${hit.mesh.name}`,
              { size: 0.35 },
              scene,
            )
            recycledItem.position.copyFrom(hit.mesh.getAbsolutePosition())
            const recycledMaterial = new StandardMaterial(
              `recycled-material-${hit.mesh.name}`,
              scene,
            )
            recycledMaterial.diffuseColor = new Color3(0.2, 0.72, 0.48)
            recycledMaterial.emissiveColor = new Color3(0.04, 0.2, 0.1)
            recycledItem.material = recycledMaterial
            hit.mesh.setEnabled(false)
            enemyPool.release(troublemaker.controller)
          }
        }
        onWeaponStateChange?.({ ...weaponState })
      }
    }
    previousPrimaryUse = input.primaryUse
  })

  return scene
}
