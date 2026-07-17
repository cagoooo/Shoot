import { useEffect, useState } from 'react'
import { subscribeSpeech, subscribeSpeechProgress } from '../accessibility/speech'

interface SubtitleBarProps {
  enabled: boolean
}

/**
 * 語音朗讀字幕列：唸給我聽／聽角色說播放時，把內容同步顯示在畫面下方；
 * 支援朗讀進度事件時，已唸到的部分會亮起（唸到哪、亮到哪）。
 */
export function SubtitleBar({ enabled }: SubtitleBarProps) {
  const [text, setText] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(
    () =>
      subscribeSpeech((next) => {
        setText(next)
        setProgress(0)
      }),
    [],
  )
  useEffect(() => subscribeSpeechProgress(setProgress), [])

  if (!enabled || !text) return null

  const spoken = text.slice(0, progress)
  const rest = text.slice(progress)

  return (
    <div className="subtitle-bar" role="status" aria-live="off">
      <span className="subtitle-spoken">{spoken}</span>
      {rest}
    </div>
  )
}
