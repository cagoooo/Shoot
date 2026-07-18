import { describe, expect, it, vi } from 'vitest'
import {
  emitSceneInteraction,
  emitSceneState,
  subscribeSceneInteraction,
  subscribeSceneState,
} from './sceneInteraction'

describe('sceneInteraction', () => {
  it('互動事件可送出與訂閱，退訂後不再收到', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeSceneInteraction(listener)
    emitSceneInteraction({ kind: 'sludge', id: '1' })
    expect(listener).toHaveBeenCalledWith({ kind: 'sludge', id: '1' })

    unsubscribe()
    emitSceneInteraction({ kind: 'sludge', id: '2' })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('狀態同步事件帶 key、value 與可選 id', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeSceneState(listener)
    emitSceneState({ key: 'water-purified', value: 2, id: 'sludge-1' })
    expect(listener).toHaveBeenCalledWith({ key: 'water-purified', value: 2, id: 'sludge-1' })
    unsubscribe()
  })
})
