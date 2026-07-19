import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import type { GameScreen, LearningMode, MissionId } from '../../app/gameStore'
import { GameCanvas, type SceneFactory } from '../../game/GameCanvas'
import { buildBaseScene } from '../../game/base/buildBaseScene'
import { canRenderTitle3D } from '../../game/title/buildTitleScene'
import { subscribeSceneInteraction } from '../../game/missions/sceneInteraction'
import { playSfx } from '../../audio/soundEffects'
import { getWeeklyQuest } from '../../domain/weekly/weeklyQuest'
import { ProgressControls } from '../components/ProgressControls'
import { InstallPrompt } from '../components/InstallPrompt'

interface BaseScreenProps {
  mode: LearningMode
  reducedMotion?: boolean
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
  { screen: 'collection', title: '成就收藏冊', description: '九大世界完成與完美結局圖鑑', symbol: '☆' },
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
  reducedMotion = false,
}: BaseScreenProps) {
  const show3D = useMemo(() => canRenderTitle3D(), [])
  const weeklyQuest = useMemo(() => getWeeklyQuest(), [])
  // 3D 模式預設收合面板，讓村落完整露出可點；展開後回到完整選單。
  const [menuOpen, setMenuOpen] = useState(false)
  const showFullPanels = !show3D || menuOpen
  const sceneFactory = useCallback<SceneFactory>(
    (engine) => buildBaseScene(engine as AbstractEngine, { reducedMotion }),
    [reducedMotion],
  )

  // 點 3D 建築直接前往該區（DOM 卡片保留為鍵盤與無障礙路徑）。
  useEffect(
    () =>
      subscribeSceneInteraction((interaction) => {
        if (interaction.kind === 'base-zone') {
          playSfx('select')
          onNavigate(interaction.id as GameScreen)
        }
      }),
    [onNavigate],
  )

  return (
    <main className={`base-screen${show3D ? ' has-3d' : ''}`}>
      {show3D && (
        <div className="base-3d-backdrop" aria-hidden="true">
          <GameCanvas sceneFactory={sceneFactory} />
        </div>
      )}
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

      <aside className="weekly-quest" aria-label="本週守護任務">
        <div className="weekly-quest-world">
          <span aria-hidden="true">{weeklyQuest.missionIcon}</span>
          <div>
            <strong>本週重點世界：{weeklyQuest.missionTitle}</strong>
            <p>🌱 生活挑戰：{weeklyQuest.action}</p>
          </div>
        </div>
        <button className="secondary-button" type="button" onClick={() => onNavigate('campaign')}>
          看看這個世界 →
        </button>
      </aside>

      {show3D && !menuOpen && (
        <>
          <p className="base-hint">👆 直接點村落裡的建築就能前往！</p>
          <nav className="base-chip-bar" aria-label="基地快速選單">
            <button type="button" onClick={() => setMenuOpen(true)}>🗺️ 今天任務清單</button>
            <button type="button" onClick={() => onNavigate('workbench')}>🔧 工具桌</button>
            <button type="button" onClick={() => onNavigate('range')}>🎯 試玩區</button>
            <button type="button" onClick={() => onNavigate('report')}>📒 行動紀錄</button>
            <button type="button" onClick={() => onNavigate('collection')}>⭐ 收藏冊</button>
          </nav>
        </>
      )}
      {showFullPanels && (
      <>
      {show3D && (
        <button className="secondary-button base-collapse-button" type="button" onClick={() => setMenuOpen(false)}>
          👀 收合選單，看看 3D 基地
        </button>
      )}
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
      <InstallPrompt />
      </>
      )}
    </main>
  )
}
