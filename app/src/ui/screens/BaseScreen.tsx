import type { GameScreen, LearningMode } from '../../app/gameStore'
import { ProgressControls } from '../components/ProgressControls'

interface BaseScreenProps {
  mode: LearningMode
  onNavigate: (screen: GameScreen) => void
  onExportProgress: () => void
  onImportProgress: (serialized: string) => Promise<void>
}

const baseZones: Array<{
  screen: GameScreen
  title: string
  description: string
  symbol: string
}> = [
  { screen: 'mission', title: '今天任務', description: '查看 SDGs 行動目標', symbol: '◎' },
  { screen: 'workbench', title: '工具桌', description: '組裝你的能量工具', symbol: '◇' },
  { screen: 'range', title: '試玩區', description: '比較力量、省電和降溫', symbol: '△' },
  { screen: 'report', title: '我的行動紀錄', description: '查看結果和改良想法', symbol: '□' },
]

export function BaseScreen({
  mode,
  onNavigate,
  onExportProgress,
  onImportProgress,
}: BaseScreenProps) {
  return (
    <main className="base-screen">
      <header className="base-header">
        <div>
          <p className="eyebrow">地球守護隊基地</p>
          <h1>今天想先去哪裡？</h1>
        </div>
        <span className="mode-badge">
          {mode === 'middle-assist' ? '中年級輔助' : '高年級標準'}
        </span>
      </header>

      <section className="base-map" aria-label="基地區域">
        {baseZones.map((zone, index) => (
          <button
            className={`base-zone zone-${index + 1}`}
            type="button"
            key={zone.screen}
            onClick={() => onNavigate(zone.screen)}
          >
            <span className="zone-symbol" aria-hidden="true">{zone.symbol}</span>
            <span>
              <strong>{zone.title}</strong>
              <small>{zone.description}</small>
            </span>
          </button>
        ))}
      </section>
      <ProgressControls
        onExport={onExportProgress}
        onImport={onImportProgress}
      />
    </main>
  )
}
