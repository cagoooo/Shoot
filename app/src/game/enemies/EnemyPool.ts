import { EnemyController, type EnemyKind } from './EnemyController'

interface EnemyPoolOptions {
  capacity?: number
  maximumActive?: number
}

export class EnemyPool {
  private readonly enemies: EnemyController[]
  private readonly maximumActive: number

  constructor(options: EnemyPoolOptions = {}) {
    const capacity = Math.max(1, options.capacity ?? 24)
    this.maximumActive = Math.min(
      capacity,
      Math.max(1, options.maximumActive ?? 20),
    )
    this.enemies = Array.from(
      { length: capacity },
      (_, index) => new EnemyController(`troublemaker-${index + 1}`),
    )
  }

  get size(): number {
    return this.enemies.length
  }

  get activeCount(): number {
    return this.enemies.filter((enemy) => enemy.active).length
  }

  acquire(kind: EnemyKind): EnemyController | null {
    if (this.activeCount >= this.maximumActive) return null
    const enemy = this.enemies.find((candidate) => !candidate.active)
    if (!enemy) return null
    enemy.activate(kind)
    return enemy
  }

  release(enemy: EnemyController): void {
    if (!this.enemies.includes(enemy)) return
    enemy.deactivate()
  }
}
