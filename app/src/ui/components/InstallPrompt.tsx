import { useEffect, useState } from 'react'

const DISMISS_KEY = 'earth-guardian-install-hint-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
}

function isIosSafariWithoutApp(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    ('standalone' in navigator && Boolean((navigator as { standalone?: boolean }).standalone))
  return isIos && !standalone
}

function dismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === 'true'
  } catch {
    return false
  }
}

/** 「加入主畫面」安裝引導：Android/Chrome 用原生安裝提示，iOS 顯示步驟說明。 */
export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHint, setShowIosHint] = useState(false)
  const [hidden, setHidden] = useState(() => dismissed())

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    setShowIosHint(isIosSafariWithoutApp())
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  if (hidden || (!installEvent && !showIosHint)) return null

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, 'true')
    } catch {
      // 無法寫入時只隱藏本次。
    }
    setHidden(true)
  }

  return (
    <aside className="install-hint" role="note" aria-label="加入主畫面">
      <strong>📲 把地球守護隊放到主畫面</strong>
      {installEvent ? (
        <>
          <p>安裝後像 App 一樣打開，下次上課更快進入任務。</p>
          <button
            className="primary-button"
            type="button"
            onClick={() => {
              void installEvent.prompt()
              setInstallEvent(null)
            }}
          >
            安裝到主畫面
          </button>
        </>
      ) : (
        <p>用 Safari 打開，點「分享」按鈕，再選「加入主畫面」，就能像 App 一樣使用。</p>
      )}
      <button className="text-button" type="button" onClick={dismiss}>
        不用了，之後再說
      </button>
    </aside>
  )
}
