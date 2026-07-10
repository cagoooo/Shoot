import { useEffect, useState } from 'react'
import { useGameStore } from './app/gameStore'
import { loadContent } from './content/loadContent'
import type { PartContent } from './content/schema'
import { BaseScreen } from './ui/screens/BaseScreen'
import { StartScreen } from './ui/screens/StartScreen'
import { WorkbenchScreen } from './ui/screens/WorkbenchScreen'
import './App.css'

function App() {
  const { screen, mode, setMode, setScreen } = useGameStore()
  const [parts, setParts] = useState<PartContent[]>([])
  const [contentLoadFailed, setContentLoadFailed] = useState(false)

  useEffect(() => {
    if (screen !== 'workbench' || parts.length > 0) return
    setContentLoadFailed(false)
    void loadContent(import.meta.env.BASE_URL).then(
      (content) => setParts(content.parts),
      () => setContentLoadFailed(true),
    )
  }, [parts.length, screen])

  if (screen === 'start') {
    return (
      <StartScreen
        mode={mode}
        onModeChange={setMode}
        onStart={() => setScreen('base')}
      />
    )
  }

  if (screen === 'base') {
    return <BaseScreen mode={mode} onNavigate={setScreen} />
  }

  if (screen === 'workbench') {
    if (contentLoadFailed) {
      return (
        <main className="placeholder-screen">
          <p role="alert">工具資料暫時無法載入</p>
          <button className="primary-button" type="button" onClick={() => setScreen('base')}>
            回基地
          </button>
        </main>
      )
    }
    if (parts.length === 0) {
      return <main className="loading-screen" aria-live="polite">正在準備工具桌…</main>
    }
    return <WorkbenchScreen parts={parts} onBack={() => setScreen('base')} />
  }

  return (
    <main className="placeholder-screen">
      <p className="eyebrow">基地建設中</p>
      <h1>這個區域即將開放</h1>
      <button className="primary-button" type="button" onClick={() => setScreen('base')}>
        回基地
      </button>
    </main>
  )
}

export default App
