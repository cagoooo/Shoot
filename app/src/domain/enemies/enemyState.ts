export type EnemyStateKind =
  | 'idle'
  | 'notice'
  | 'telegraph'
  | 'action'
  | 'stunned'
  | 'cleansed'

export type EnemyCue =
  | 'none'
  | 'yellow-warning'
  | 'soft-pulse'
  | 'stars'
  | 'recycle-sparkles'

export interface EnemyState {
  kind: EnemyStateKind
  elapsedMs: number
  cue: EnemyCue
}

export interface EnemyUpdate {
  playerVisible: boolean
  elapsedMs: number
}

const cueFor = (kind: EnemyStateKind): EnemyCue => {
  if (kind === 'telegraph') return 'yellow-warning'
  if (kind === 'action') return 'soft-pulse'
  if (kind === 'stunned') return 'stars'
  if (kind === 'cleansed') return 'recycle-sparkles'
  return 'none'
}

export function createEnemyState(kind: EnemyStateKind = 'idle'): EnemyState {
  return { kind, elapsedMs: 0, cue: cueFor(kind) }
}

export function updateEnemy(
  state: EnemyState,
  update: EnemyUpdate,
): EnemyState {
  if (state.kind === 'cleansed') return state

  if (state.kind === 'idle' && update.playerVisible) {
    return createEnemyState('telegraph')
  }

  const elapsedMs = state.elapsedMs + Math.max(0, update.elapsedMs)
  if (state.kind === 'telegraph' && elapsedMs >= 600) {
    return createEnemyState('action')
  }
  if (state.kind === 'action' && elapsedMs >= 400) {
    return createEnemyState('idle')
  }
  if (state.kind === 'stunned' && elapsedMs >= 800) {
    return createEnemyState('idle')
  }

  return { ...state, elapsedMs }
}

export function stunEnemy(state: EnemyState): EnemyState {
  return state.kind === 'cleansed' ? state : createEnemyState('stunned')
}

export function cleanseEnemy(_state: EnemyState): EnemyState {
  return createEnemyState('cleansed')
}
