interface SceneObjectivePromptProps {
  label: string
  near: boolean
  observed: boolean
  onObserve: () => void
}

export function SceneObjectivePrompt({
  label,
  near,
  observed,
  onObserve,
}: SceneObjectivePromptProps) {
  if (observed) {
    return <div className="scene-objective-prompt is-complete" role="status">✓ 已觀察「{label}」：右側任務已解鎖</div>
  }

  return <div className="scene-objective-prompt" role="status">
    <strong>{near ? `已靠近「${label}」` : `前往「${label}」`}</strong>
    <span>{near ? '按下觀察，確認你找到正確的任務地點。' : '使用方向鍵、WASD 或搖桿靠近發光標記。'}</span>
    {near && <button className="scene-observe-button" type="button" onClick={onObserve}>觀察這個地點</button>}
  </div>
}
