import { describe, expect, it, vi } from 'vitest'
import { EnemyPool } from './EnemyPool'

describe('EnemyPool', () => {
  it('預先配置 24 隻，但同時最多啟用 20 隻', () => {
    const pool = new EnemyPool({ capacity: 24, maximumActive: 20 })
    const acquired = Array.from({ length: 21 }, () => pool.acquire('sticky'))

    expect(pool.size).toBe(24)
    expect(acquired.filter(Boolean)).toHaveLength(20)
    expect(acquired[20]).toBeNull()
  })

  it('淨化回收時清除監聽器，並可再次使用', () => {
    const pool = new EnemyPool({ capacity: 2, maximumActive: 2 })
    const enemy = pool.acquire('power-thief')!
    const cleanup = vi.fn()
    enemy.addCleanup(cleanup)

    pool.release(enemy)

    expect(cleanup).toHaveBeenCalledOnce()
    expect(enemy.active).toBe(false)
    expect(pool.acquire('sticky')?.id).toBe(enemy.id)
  })

  it('低畫質且不在視野時降低更新頻率', () => {
    const pool = new EnemyPool({ capacity: 1, maximumActive: 1 })
    const enemy = pool.acquire('sticky')!
    enemy.visible = false

    expect(enemy.shouldUpdate(5, 'low')).toBe(false)
    expect(enemy.shouldUpdate(6, 'low')).toBe(true)
  })
})
