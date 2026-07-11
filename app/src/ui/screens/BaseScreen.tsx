import type { GameScreen, LearningMode, MissionId } from '../../app/gameStore'
import { ProgressControls } from '../components/ProgressControls'

interface BaseScreenProps {
  mode: LearningMode
  audioMuted: boolean
  onAudioMutedChange: (muted: boolean) => void
  onNavigate: (screen: GameScreen) => void
  completedMissions?: string[]
  onMissionSelect?: (mission: MissionId) => void
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
  audioMuted,
  onAudioMutedChange,
  onNavigate,
  completedMissions = [],
  onMissionSelect = () => undefined,
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
        <button
          className="secondary-button"
          type="button"
          aria-pressed={audioMuted}
          onClick={() => onAudioMutedChange(!audioMuted)}
        >
          {audioMuted ? '開啟背景音樂' : '關閉背景音樂'}
        </button>
      </header>

      <section className="base-map" aria-label="基地區域">
        {baseZones.map((zone, index) => zone.screen === 'mission' ? (
          <div className="base-zone zone-1 mission-zone-group" key={zone.screen}>
            <span className="zone-symbol" aria-hidden="true">🗺️</span>
            <span className="mission-zone-list">
              <strong>今天任務</strong>
              <button aria-label="今天任務：垃圾風暴救援行動" type="button" onClick={() => { onMissionSelect('recycling-storm'); onNavigate('mission') }}>
                <b>垃圾風暴救援行動</b>
                <small>SDG 7・12・13｜已完成也可以再挑戰</small>
              </button>
              <button
                type="button"
                disabled={!completedMissions.includes('recycling-storm')}
                onClick={() => { onMissionSelect('water-guardian'); onNavigate('mission') }}
              >
                <b>水滴守護行動</b>
                <small>{completedMissions.includes('recycling-storm') ? 'SDG 6｜已解鎖' : '完成第一關後解鎖'}</small>
              </button>
              <button className="mission-map-link" type="button" onClick={() => onNavigate('campaign')}>
                查看九大世界任務地圖 →
              </button>
            </span>
          </div>
        ) : (
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
