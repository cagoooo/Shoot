import { useEffect, useState } from 'react'
import { subscribeSpeech } from '../accessibility/speech'

interface SubtitleBarProps {
  enabled: boolean
}

/** 語音朗讀字幕列：唸給我聽／聽角色說播放時，把內容同步顯示在畫面下方。 */
export function SubtitleBar({ enabled }: SubtitleBarProps) {
  const [text, setText] = useState<string | null>(null)

  useEffect(() => subscribeSpeech(setText), [])

  if (!enabled || !text) return null

  return (
    <div className="subtitle-bar" role="status" aria-live="off">
      {text}
    </div>
  )
}
