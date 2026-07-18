import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { ErrorBoundary } from './app/ErrorBoundary'
import { useGameStore } from './app/gameStore'
import { loadContent } from './content/loadContent'
import type { PartContent } from './content/schema'
import { BaseScreen } from './ui/screens/BaseScreen'
import { StartScreen } from './ui/screens/StartScreen'
import { WorkbenchScreen } from './ui/screens/WorkbenchScreen'
import { ReportScreen } from './ui/screens/ReportScreen'
import { CampaignScreen } from './ui/screens/CampaignScreen'
import { CollectionScreen } from './ui/screens/CollectionScreen'
import { TeacherScreen } from './ui/screens/TeacherScreen'
import type { LearningEvent } from './learning/events'
import { getStoryMission } from './game/missions/storyWorld/storyMissionConfig'
import { campaignMissions } from './content/missionCatalog'
import { reduceLearningEvents } from './learning/reducer'
import { createBrowserSaveRepository } from './persistence/saveRepository'
import { deserializeSave, serializeSave } from './persistence/exportSave'
import { AudioManager, type AudioScene } from './audio/AudioManager'
import { BrowserAudioAdapter } from './audio/BrowserAudioAdapter'
import { registerServiceWorker, type ApplyUpdate } from './pwa/serviceWorker'
import { NetworkStatusBanner } from './ui/components/NetworkStatusBanner'
import { SubtitleBar } from './ui/components/SubtitleBar'

function GlobalSubtitleBar() {
  const captions = useGameStore((state) => state.comfortSettings.captions)
  return <SubtitleBar enabled={captions} />
}
import { loadAudioMuted, saveAudioMuted } from './domain/settings/settingsStorage'
import './App.css'

const RangeScreen = lazy(async () => {
  const module = await import('./ui/screens/RangeScreen')
  return { default: module.RangeScreen }
})

const MissionScreen = lazy(async () => {
  const module = await import('./ui/screens/MissionScreen')
  return { default: module.MissionScreen }
})

const WaterGuardianScreen = lazy(async () => {
  const module = await import('./ui/screens/WaterGuardianScreen')
  return { default: module.WaterGuardianScreen }
})

const GreenEnergyScreen = lazy(async () => {
  const module = await import('./ui/screens/GreenEnergyScreen')
  return { default: module.GreenEnergyScreen }
})

const StoryWorldScreen = lazy(async () => {
  const module = await import('./ui/screens/StoryWorldScreen')
  return { default: module.StoryWorldScreen }
})

function AppContent() {
  const {
    screen,
    mode,
    activeMission,
    learningEvents,
    comfortSettings,
    setMode,
    setActiveMission,
    setScreen,
    recordLearningEvents,
    setComfortSettings,
  } = useGameStore()
  const [parts, setParts] = useState<PartContent[]>([])
  const [completedMissions, setCompletedMissions] = useState<string[]>([])
  const [missionEndings, setMissionEndings] = useState<Record<string, 'perfect' | 'learned'>>({})
  const [contentLoadFailed, setContentLoadFailed] = useState(false)
  const [audioMuted, setAudioMuted] = useState(() => loadAudioMuted())
  const saveRepository = useMemo(() => createBrowserSaveRepository(), [])
  const audioAdapter = useMemo(
    () => new BrowserAudioAdapter(import.meta.env.BASE_URL),
    [],
  )
  const audio = useMemo(() => new AudioManager(audioAdapter), [audioAdapter])
  const transitionAudio = useMemo(() => audio.transitionTo.bind(audio), [audio])
  const currentMission = campaignMissions.find((mission) => mission.id === activeMission)
  const nextMission = currentMission
    ? campaignMissions.find((mission) => mission.order === currentMission.order + 1)
    : undefined
  const storyMission = getStoryMission(activeMission)

  useEffect(() => {
    void audioAdapter.initialize()
  }, [audioAdapter])

  useEffect(() => {
    audio.setMuted(audioMuted)
    saveAudioMuted(audioMuted)
  }, [audio, audioMuted])

  useEffect(() => {
    audio.setMusicVolume(comfortSettings.musicVolume)
  }, [audio, comfortSettings.musicVolume])

  useEffect(() => {
    document.body.dataset.colorAssist = String(comfortSettings.colorAssist)
  }, [comfortSettings.colorAssist])

  useEffect(() => {
    const sceneByScreen: Record<typeof screen, AudioScene> = {
      start: 'base',
      base: 'base',
      workbench: 'base',
      campaign: 'base',
      collection: 'base',
      teacher: 'base',
      range: 'exploration',
      mission: 'exploration',
      report: 'report',
    }
    audio.transitionTo(sceneByScreen[screen])
  }, [audio, screen])

  useEffect(() => {
    const onVisibilityChange = () => {
      void audio.setPageHidden(document.hidden)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [audio])

  useEffect(() => {
    void saveRepository.load().then((save) => {
      setMode(save.mode)
      setCompletedMissions(save.completedMissions)
      setMissionEndings(save.missionEndings)
    })
  }, [saveRepository, setMode])

  const completeMission = (missionId: string, events: LearningEvent[]) => {
    recordLearningEvents(events)
    setCompletedMissions((missions) => Array.from(new Set([...missions, missionId])))
    const ending = events.find(
      (event): event is Extract<LearningEvent, { type: 'mission-ending' }> =>
        event.type === 'mission-ending',
    )
    if (ending) setMissionEndings((current) => ({ ...current, [missionId]: ending.ending }))
    void saveRepository.load().then((save) =>
      saveRepository.save({
        ...save,
        completedMissions: Array.from(new Set([...save.completedMissions, missionId])),
        missionEndings: ending
          ? { ...save.missionEndings, [missionId]: ending.ending }
          : save.missionEndings,
      }),
    )
    setScreen('report')
  }

  const saveMode = (nextMode: typeof mode) => {
    setMode(nextMode)
    void saveRepository.load().then((save) =>
      saveRepository.save({ ...save, mode: nextMode }),
    )
  }

  const exportProgress = () => {
    void saveRepository.load().then((save) => {
      const url = URL.createObjectURL(
        new Blob([serializeSave(save)], { type: 'application/json' }),
      )
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'earth-guardian-progress.json'
      anchor.click()
      URL.revokeObjectURL(url)
    })
  }

  const importProgress = async (serialized: string) => {
    const save = deserializeSave(serialized)
    await saveRepository.save(save)
    setMode(save.mode)
    setCompletedMissions(save.completedMissions)
  }

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
        onModeChange={saveMode}
        onStart={() => {
          void audio.unlockFromUserGesture()
          setScreen('base')
        }}
        onTeacherMode={() => setScreen('teacher')}
        reducedMotion={comfortSettings.reducedMotion}
      />
    )
  }

  if (screen === 'teacher') {
    return <TeacherScreen onBack={() => setScreen('start')} />
  }

  if (screen === 'base') {
    return (
      <BaseScreen
        mode={mode}
        audioMuted={audioMuted}
        onAudioMutedChange={setAudioMuted}
        onNavigate={setScreen}
        completedMissions={completedMissions}
        onMissionSelect={setActiveMission}
        onExportProgress={exportProgress}
        onImportProgress={importProgress}
      />
    )
  }

  if (screen === 'campaign') {
    return (
      <CampaignScreen
        completedMissions={completedMissions}
        onBack={() => setScreen('base')}
        onMissionSelect={(mission) => {
          setActiveMission(mission)
          setScreen('mission')
        }}
      />
    )
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

  if (screen === 'range') {
    return (
      <Suspense fallback={<main className="loading-screen">正在準備 3D 試玩區…</main>}>
        <RangeScreen
          comfortSettings={comfortSettings}
          onComfortSettingsChange={setComfortSettings}
          onBack={() => setScreen('base')}
        />
      </Suspense>
    )
  }

  if (screen === 'mission') {
    return (
      <Suspense fallback={<main className="loading-screen">正在打開垃圾風暴任務…</main>}>
        {storyMission ? (
          <StoryWorldScreen
            mission={storyMission}
            learningMode={mode}
            comfortSettings={comfortSettings}
            onComfortSettingsChange={setComfortSettings}
            onBack={() => setScreen('base')}
            onAudioSceneChange={transitionAudio}
            onMissionComplete={(events) => completeMission(storyMission.id, events)}
          />
        ) : activeMission === 'green-energy-community' ? (
          <GreenEnergyScreen
            learningMode={mode}
            comfortSettings={comfortSettings}
            onComfortSettingsChange={setComfortSettings}
            onBack={() => setScreen('base')}
            onAudioSceneChange={transitionAudio}
            onMissionComplete={(events) => completeMission('green-energy-community', events)}
          />
        ) : activeMission === 'water-guardian' ? (
          <WaterGuardianScreen
            learningMode={mode}
            comfortSettings={comfortSettings}
            onComfortSettingsChange={setComfortSettings}
            onBack={() => setScreen('base')}
            onAudioSceneChange={transitionAudio}
            onMissionComplete={(events) => completeMission('water-guardian', events)}
          />
        ) : (
        <MissionScreen
          learningMode={mode}
          comfortSettings={comfortSettings}
          onComfortSettingsChange={setComfortSettings}
          onBack={() => setScreen('base')}
          onAudioSceneChange={transitionAudio}
          onMissionComplete={(events) => completeMission('recycling-storm', events)}
        />
        )}
      </Suspense>
    )
  }

  if (screen === 'collection') {
    return (
      <CollectionScreen
        completedMissions={completedMissions}
        missionEndings={missionEndings}
        onBack={() => setScreen('base')}
      />
    )
  }

  if (screen === 'report') {
    return (
      <ReportScreen
        report={reduceLearningEvents(learningEvents)}
        onBack={() => setScreen('base')}
        onReplay={() => setScreen('mission')}
        nextMissionAvailable={Boolean(nextMission && completedMissions.includes(activeMission))}
        nextMissionLabel={nextMission ? `前往下一關：${nextMission.title}` : undefined}
        onNextMission={() => {
          if (nextMission) {
            setActiveMission(nextMission.id)
            setScreen('mission')
          }
        }}
        onReflection={(choice) => {
          recordLearningEvents([{ type: 'reflection-chosen', choice }])
          void saveRepository.load().then((save) =>
            saveRepository.save({
              ...save,
              reflections: [
                ...save.reflections,
                {
                  missionId: activeMission,
                  choice,
                  createdAt: new Date().toISOString(),
                },
              ],
            }),
          )
        }}
      />
    )
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

function App() {
  const setScreen = useGameStore((state) => state.setScreen)
  const [boundaryKey, setBoundaryKey] = useState(0)
  const [applyUpdate, setApplyUpdate] = useState<ApplyUpdate | null>(null)

  const restartBoundary = () => setBoundaryKey((key) => key + 1)

  useEffect(() => registerServiceWorker((apply) => setApplyUpdate(() => apply)), [])

  return (
    <>
      <ErrorBoundary
        key={boundaryKey}
        phase={useGameStore.getState().screen}
        onReload={restartBoundary}
        onHome={() => {
          setScreen('base')
          restartBoundary()
        }}
      >
        <AppContent />
      </ErrorBoundary>
      <NetworkStatusBanner />
      <GlobalSubtitleBar />
      {applyUpdate && (
        <aside className="update-banner" role="status" aria-live="polite">
          <span>新版本已準備好，重新整理後就能使用。</span>
          <button className="primary-button" type="button" onClick={applyUpdate}>
            立即更新
          </button>
          <button type="button" aria-label="稍後再更新" onClick={() => setApplyUpdate(null)}>
            稍後
          </button>
        </aside>
      )}
    </>
  )
}

export default App
