import { Color3 } from '@babylonjs/core/Maths/math.color'
import type { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import type { Scene } from '@babylonjs/core/scene'
import type { ToolHit } from './RaycastTool'

export interface ProjectileOptions {
  speed?: number
  lifetimeSeconds?: number
  onHit?: (hit: ToolHit) => void
}

export class ProjectileTool {
  private readonly scene: Scene

  constructor(scene: Scene) {
    this.scene = scene
  }

  launch(origin: Vector3, direction: Vector3, options: ProjectileOptions = {}) {
    const projectile = MeshBuilder.CreateSphere(
      'friendly-bubble-projectile',
      { diameter: 0.22, segments: 8 },
      this.scene,
    )
    projectile.position.copyFrom(origin)
    projectile.isPickable = false

    const material = new StandardMaterial('bubble-projectile-material', this.scene)
    material.diffuseColor = new Color3(0.35, 0.78, 1)
    material.emissiveColor = new Color3(0.08, 0.35, 0.55)
    projectile.material = material

    const velocity = direction.normalizeToNew().scale(options.speed ?? 9)
    let remaining = options.lifetimeSeconds ?? 3
    const observer = this.scene.onBeforeRenderObservable.add(() => {
      const delta = Math.min(this.scene.getEngine().getDeltaTime() / 1000, 0.05)
      remaining -= delta
      projectile.position.addInPlace(velocity.scale(delta))

      const target = this.scene.meshes.find(
        (mesh) =>
          mesh.metadata?.targetKind === 'trouble-core' &&
          mesh.isEnabled() &&
          projectile.intersectsMesh(mesh, false),
      )
      if (target) {
        options.onHit?.({ mesh: target, point: projectile.position.clone(), distance: 0 })
        remaining = 0
      }

      if (remaining <= 0) {
        this.scene.onBeforeRenderObservable.remove(observer)
        projectile.dispose()
        material.dispose()
      }
    })

    return projectile
  }
}
