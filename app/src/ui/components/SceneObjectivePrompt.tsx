import { useEffect } from 'react'
import type { ObjectiveTracking } from '../../game/missions/objectiveTracking'

interface SceneObjectivePromptProps {
  label: string
  near: boolean
  observed: boolean
  onObserve: () => void
  tracking?: ObjectiveTracking | null
}

export function SceneObjectivePrompt({
  label,
  near,
  observed,
  onObserve,
  tracking,
}: SceneObjectivePromptProps) {
  useEffect(() => {
    if (!near || observed) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'e' && event.key !== 'E') return
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      onObserve()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [near, observed, onObserve])

  if (observed) {
    return <div className="scene-objective-prompt is-complete" role="status">✓ 已觀察「{label}」：右側任務已解鎖</div>
  }

  const steps = tracking ? Math.max(1, Math.round(tracking.distance)) : null

  return <div className="scene-objective-prompt" role="status">
    <strong>{near ? `已靠近「${label}」` : `前往「${label}」`}</strong>
    {!near && tracking && (
      <span className="objective-compass" aria-hidden="true">
        <span
          className="objective-compass-arrow"
          style={{ transform: `rotate(${Math.round(tracking.bearing) - 90}deg)` }}
        >
          ➤
        </span>
        往箭頭方向走約 {steps} 步
      </span>
    )}
    <span>{near ? '按下觀察（鍵盤可按 E），確認你找到正確的任務地點。' : '跟著發光光柱走，使用方向鍵、WASD 或搖桿。'}</span>
    {near && <button className="scene-observe-button" type="button" onClick={onObserve}>觀察這個地點</button>}
  </div>
}
