interface MultiSelectFeedbackProps {
  selected: string[]
  required: number
  noun?: string
  message?: string
}

export function MultiSelectFeedback({
  selected,
  required,
  noun = '個選項',
  message,
}: MultiSelectFeedbackProps) {
  const remaining = Math.max(0, required - selected.length)
  const complete = remaining === 0

  return (
    <div className={`multi-select-feedback${complete ? ' is-success' : ''}`} role="status">
      <strong>已選 {selected.length}／{required} {noun}</strong>
      <span>{selected.length ? selected.map((name) => `✓ ${name}`).join('　') : '尚未選擇'}</span>
      <p>{message ?? (complete ? '選好了！請按下完成，繼續守護任務。' : `再選 ${remaining} ${noun}，每次點選都會顯示在這裡。`)}</p>
    </div>
  )
}
