import { useEffect, useState } from 'react'

/** 離線提示與恢復連線通知：離線時常駐顯示，恢復後短暫提示。 */
export function NetworkStatusBanner() {
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )
  const [justRecovered, setJustRecovered] = useState(false)

  useEffect(() => {
    const goOffline = () => {
      setOnline(false)
      setJustRecovered(false)
    }
    const goOnline = () => {
      setOnline(true)
      setJustRecovered(true)
    }
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  useEffect(() => {
    if (!justRecovered) return
    const timer = setTimeout(() => setJustRecovered(false), 5000)
    return () => clearTimeout(timer)
  }, [justRecovered])

  if (!online) {
    return (
      <aside className="network-banner is-offline" role="status" aria-live="polite">
        📴 目前離線：已載入的關卡仍然可以玩，進度會安全存在這台裝置上。
      </aside>
    )
  }

  if (justRecovered) {
    return (
      <aside className="network-banner is-online" role="status" aria-live="polite">
        📶 網路恢復了！之後的更新會自動下載。
      </aside>
    )
  }

  return null
}
