import {
  createEnemyState,
  type EnemyState,
} from '../../domain/enemies/enemyState'
import type { QualityProfile } from '../engine/qualityProfile'

export type EnemyKind = 'sticky' | 'power-thief'

export class EnemyController {
  readonly id: string
  active = false
  visible = false
  kind: EnemyKind = 'sticky'
  state: EnemyState = createEnemyState()
  private readonly cleanups = new Set<() => void>()

  constructor(id: string) {
    this.id = id
  }

  activate(kind: EnemyKind): void {
    this.active = true
    this.visible = true
    this.kind = kind
    this.state = createEnemyState()
  }

  addCleanup(cleanup: () => void): void {
    this.cleanups.add(cleanup)
  }

  deactivate(): void {
    for (const cleanup of this.cleanups) cleanup()
    this.cleanups.clear()
    this.active = false
    this.visible = false
    this.state = createEnemyState()
  }

  shouldUpdate(frame: number, quality: QualityProfile): boolean {
    if (!this.active) return false
    if (this.visible) return true
    const interval = quality === 'low' ? 6 : quality === 'medium' ? 3 : 2
    return frame % interval === 0
  }
}
