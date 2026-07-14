import { useEffect } from 'react'
import { canSpeak, speak, stopSpeaking } from '../accessibility/speech'

interface SpeakButtonProps {
  text: string
  label?: string
}

export function SpeakButton({ text, label = '唸給我聽' }: SpeakButtonProps) {
  useEffect(() => stopSpeaking, [])

  if (!canSpeak()) return null

  return (
    <button
      className="speak-button"
      type="button"
      onClick={() => speak(text)}
    >
      <span aria-hidden="true">🔊</span> {label}
    </button>
  )
}
