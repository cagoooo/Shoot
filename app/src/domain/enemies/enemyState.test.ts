import { describe, expect, it } from 'vitest'
import {
  cleanseEnemy,
  createEnemyState,
  updateEnemy,
} from './enemyState'

describe('nonviolent enemy state', () => {
  it('行動前一定先經過黃色預告狀態', () => {
    let state = createEnemyState('idle')
    state = updateEnemy(state, { playerVisible: true, elapsedMs: 16 })
    expect(state.kind).toBe('telegraph')
    expect(state.cue).toBe('yellow-warning')

    state = updateEnemy(state, { playerVisible: true, elapsedMs: 700 })
    expect(state.kind).toBe('action')
  })

  it('淨化後成為可回收狀態，不留下受傷或死亡文字', () => {
    const state = cleanseEnemy(createEnemyState('stunned'))

    expect(state).toMatchObject({ kind: 'cleansed', cue: 'recycle-sparkles' })
    expect(JSON.stringify(state)).not.toMatch(/dead|blood|死亡|流血/i)
  })
})
