import { useEffect, useState } from 'react'
import { campaignMissions, type CampaignMissionId } from '../../content/missionCatalog'
import { teacherGuides } from '../../content/teacherGuide'

interface TeacherScreenProps {
  onBack: () => void
}

const timerPresets = [5, 12, 18, 20] as const

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/** 教師課堂模式：投影用大字引導、計時器與討論題；單機、不需登入。 */
export function TeacherScreen({ onBack }: TeacherScreenProps) {
  const [missionId, setMissionId] = useState<CampaignMissionId>('recycling-storm')
  const [remaining, setRemaining] = useState(12 * 60)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const timer = setInterval(
      () => setRemaining((value) => Math.max(0, value - 1)),
      1000,
    )
    return () => clearInterval(timer)
  }, [running])

  useEffect(() => {
    if (remaining === 0) setRunning(false)
  }, [remaining])

  const mission = campaignMissions.find((item) => item.id === missionId)!
  const guide = teacherGuides[missionId]

  return (
    <main className="teacher-screen">
      <header className="mission-header">
        <button className="text-button" type="button" onClick={onBack}>← 回開始頁</button>
        <div>
          <p className="eyebrow">教師課堂模式・投影用</p>
          <h1>地球守護隊 課堂引導</h1>
        </div>
      </header>

      <label className="teacher-mission-picker">
        <span>今天的任務</span>
        <select
          value={missionId}
          onChange={(event) => setMissionId(event.currentTarget.value as CampaignMissionId)}
        >
          {campaignMissions.map((item) => (
            <option key={item.id} value={item.id}>
              第 {item.order} 關 {item.title}
            </option>
          ))}
        </select>
      </label>

      <div className="teacher-layout">
        <section className="teacher-panel" aria-label="課堂流程">
          <h2>{mission.icon} {mission.title}</h2>
          <p className="teacher-sdgs">{mission.sdgs}</p>
          <ol className="teacher-flow">
            {guide.flow.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="teacher-panel teacher-timer" aria-label="課堂計時器">
          <h2>⏱️ 課堂計時</h2>
          <p
            className={`teacher-timer-display${remaining === 0 ? ' is-finished' : ''}`}
            role="timer"
            aria-live="off"
          >
            {remaining === 0 ? '時間到！' : formatTime(remaining)}
          </p>
          <div className="teacher-timer-presets">
            {timerPresets.map((minutes) => (
              <button
                key={minutes}
                className="secondary-button"
                type="button"
                onClick={() => {
                  setRemaining(minutes * 60)
                  setRunning(false)
                }}
              >
                {minutes} 分鐘
              </button>
            ))}
          </div>
          <div className="teacher-timer-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => setRunning((value) => !value)}
              disabled={remaining === 0}
            >
              {running ? '暫停' : '開始計時'}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setRemaining(12 * 60)
                setRunning(false)
              }}
            >
              重設
            </button>
          </div>
        </section>

        <section className="teacher-panel" aria-label="討論題">
          <h2>💬 玩完之後聊一聊</h2>
          <ol className="teacher-discussion">
            {guide.discussion.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        </section>
      </div>

      <p className="panel-note">
        建議流程：開場說明 5 分鐘 → 遊玩 12–18 分鐘 → 討論分享 5 分鐘。詳細觀察表見 docs/testing/classroom-pilot-guide.md。
      </p>
    </main>
  )
}
