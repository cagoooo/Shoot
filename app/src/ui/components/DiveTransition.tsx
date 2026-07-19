import { useEffect, useState } from 'react'

interface DiveTransitionProps {
  /** 觸發轉場的鍵；改變時播放一次「俯衝進世界」動畫。 */
  triggerKey: string | number
  reducedMotion?: boolean
}

/**
 * 從世界地圖進關時的「地球俯衝進世界」轉場：一層放大＋淡出的圓形遮罩。
 * 減少動態時直接不顯示。
 */
export function DiveTransition({ triggerKey, reducedMotion = false }: DiveTransitionProps) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (reducedMotion) return
    setActive(true)
    const timer = setTimeout(() => setActive(false), 750)
    return () => clearTimeout(timer)
  }, [triggerKey, reducedMotion])

  if (!active) return null

  return <div className="dive-transition" aria-hidden="true" />
}
