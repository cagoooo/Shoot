import { useRef, useState, type ChangeEvent } from 'react'

interface ProgressControlsProps {
  onExport: () => void
  onImport: (serialized: string) => Promise<void>
}

export function ProgressControls({ onExport, onImport }: ProgressControlsProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      await onImport(await file.text())
      setFailed(false)
      setMessage('進度已安全載入。')
    } catch {
      setFailed(true)
      setMessage('這個進度檔無法讀取，原本的進度沒有改變。')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <section className="progress-controls" aria-label="我的進度檔">
      <button type="button" onClick={onExport}>匯出我的進度</button>
      <button type="button" onClick={() => inputRef.current?.click()}>載入我的進度</button>
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept="application/json,.json"
        aria-label="選擇進度檔"
        onChange={(event) => void importFile(event)}
      />
      {message && <p role={failed ? 'alert' : 'status'}>{message}</p>}
    </section>
  )
}
