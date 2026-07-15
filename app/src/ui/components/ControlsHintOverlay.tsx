import { useState } from 'react'

const STORAGE_KEY = 'earth-guardian-controls-hint-seen'

function alreadySeen(): boolean {
  if (typeof navigator !== 'undefined' && navigator.webdriver) return true
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

/** 第一次進入 3D 世界時的操作教學浮層，看過一次就不再出現。 */
export function ControlsHintOverlay() {
  const [visible, setVisible] = useState(() => !alreadySeen())

  if (!visible) return null

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // 無法寫入時，本次遊玩仍可關閉浮層。
    }
    setVisible(false)
  }

  return (
    <div className="controls-hint-overlay" role="dialog" aria-label="操作教學">
      <div className="controls-hint-card">
        <strong>怎麼在 3D 世界移動？</strong>
        <ul>
          <li>🖥️ 電腦：<b>WASD</b> 或方向鍵移動，<b>按住滑鼠拖曳</b>轉視角</li>
          <li>📱 平板手機：<b>左邊搖桿</b>移動，<b>右半畫面滑動</b>轉視角</li>
          <li>🎯 跟著<b>發光光柱</b>與<b>方向箭頭</b>走，靠近後按「觀察」</li>
        </ul>
        <button className="primary-button" type="button" onClick={dismiss}>
          我知道了，開始探索
        </button>
      </div>
    </div>
  )
}
