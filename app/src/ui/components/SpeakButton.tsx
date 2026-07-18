import { useEffect } from 'react'
import { canSpeak, speak, stopSpeaking, type VoiceProfile } from '../accessibility/speech'

interface SpeakButtonProps {
  text: string
  label?: string
  /** 角色聲線（音高、語速）。 */
  voice?: VoiceProfile
}

export function SpeakButton({ text, label = '唸給我聽', voice }: SpeakButtonProps) {
  useEffect(() => stopSpeaking, [])

  if (!canSpeak()) return null

  return (
    <button
      className="speak-button"
      type="button"
      onClick={() => speak(text, voice)}
    >
      <span aria-hidden="true">🔊</span> {label}
    </button>
  )
}
