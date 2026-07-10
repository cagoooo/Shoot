import { Ray } from '@babylonjs/core/Culling/ray'
import type { Scene } from '@babylonjs/core/scene'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type { Vector3 } from '@babylonjs/core/Maths/math.vector'

export interface ToolHit {
  mesh: AbstractMesh
  point: Vector3 | null
  distance: number
}

const isTroubleCore = (mesh: AbstractMesh) =>
  mesh.isEnabled() && mesh.metadata?.targetKind === 'trouble-core'

export class RaycastTool {
  private readonly scene: Scene

  constructor(scene: Scene) {
    this.scene = scene
  }

  fire(
    origin: Vector3,
    direction: Vector3,
    maximumDistance = 60,
  ): ToolHit | null {
    const ray = new Ray(origin, direction.normalizeToNew(), maximumDistance)
    const result = this.scene.pickWithRay(ray, isTroubleCore)

    if (!result?.hit || !result.pickedMesh) return null
    return {
      mesh: result.pickedMesh,
      point: result.pickedPoint ?? null,
      distance: result.distance,
    }
  }

  fireScatter(
    origin: Vector3,
    directions: readonly Vector3[],
    maximumDistance = 35,
  ): ToolHit[] {
    const uniqueHits = new Map<number, ToolHit>()
    for (const direction of directions) {
      const hit = this.fire(origin, direction, maximumDistance)
      if (hit) uniqueHits.set(hit.mesh.uniqueId, hit)
    }
    return [...uniqueHits.values()]
  }
}
