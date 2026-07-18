// 點擊拾取（scene.pick / pointerInfo.pickInfo）在模組化 Babylon 需要 Ray 支援，
// 少了這行 side-effect import，pickInfo 永遠是空的、所有 3D 點擊都靜默失效。
import '@babylonjs/core/Culling/ray'

/**
 * 3D 場景與 React 畫面之間的輕量互動橋樑：
 * - 場景端在玩家點擊可互動物件時發出 interaction 事件（例如點到泥沙怪、回收桶）。
 * - 畫面端把遊戲狀態同步回場景（例如已淨化數量），讓場景隱藏物件或播放特效。
 */

const INTERACT_EVENT = 'earth-guardian-scene-interact'
const STATE_EVENT = 'earth-guardian-scene-state'

export interface SceneInteraction {
  kind: string
  id: string
}

export interface SceneStateUpdate {
  key: string
  value: number
  id?: string
}

export function emitSceneInteraction(interaction: SceneInteraction): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(INTERACT_EVENT, { detail: interaction }))
}

export function subscribeSceneInteraction(
  listener: (interaction: SceneInteraction) => void,
): () => void {
  const handler = (event: Event) => {
    listener((event as CustomEvent<SceneInteraction>).detail)
  }
  window.addEventListener(INTERACT_EVENT, handler)
  return () => window.removeEventListener(INTERACT_EVENT, handler)
}

export function emitSceneState(update: SceneStateUpdate): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(STATE_EVENT, { detail: update }))
}

export function subscribeSceneState(
  listener: (update: SceneStateUpdate) => void,
): () => void {
  const handler = (event: Event) => {
    listener((event as CustomEvent<SceneStateUpdate>).detail)
  }
  window.addEventListener(STATE_EVENT, handler)
  return () => window.removeEventListener(STATE_EVENT, handler)
}
