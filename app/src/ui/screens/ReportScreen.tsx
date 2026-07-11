import { badgeDetails, calculateBadges } from '../../learning/badges'
import { createActionCardSvg } from '../../learning/exportActionCard'
import type { LearningReport } from '../../learning/events'

interface ReportScreenProps {
  report: LearningReport
  onBack: () => void
  onReplay?: () => void
  onNextMission?: () => void
  nextMissionAvailable?: boolean
  onReflection?: (choice: string) => void
  onPrint?: () => void
  onExport?: () => void
}

const reflectionChoices = [
  '下次使用更省電的方案',
  '下次先觀察再選擇工具',
  '下次更快找出可回收材料',
]

export function ReportScreen({
  report,
  onBack,
  onReplay,
  onNextMission,
  nextMissionAvailable = false,
  onReflection,
  onPrint,
  onExport,
}: ReportScreenProps) {
  const badges = calculateBadges(report)
  const recycledTotal = Object.values(report.recycledByCategory).reduce(
    (sum, amount) => sum + amount,
    0,
  )

  const exportCard = () => {
    if (onExport) {
      onExport()
      return
    }
    const svg = createActionCardSvg(report, badges)
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '我的永續行動卡.svg'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="report-screen" id="printable-report">
      <header className="report-header">
        <button className="text-button no-print" type="button" onClick={onBack}>
          ← 回基地
        </button>
        <div>
          <p className="eyebrow">只記錄學習行動，不記錄個人身分</p>
          <h1>我的永續行動紀錄</h1>
        </div>
      </header>

      <section className="reflection-grid" aria-label="任務學習回顧">
        <article className="reflection-card action-card pdf-section">
          <span className="card-number">01</span>
          <h2>我做了什麼</h2>
          <ul>
            <li>整理了 {recycledTotal} 件回收材料</li>
            <li>修好了 {report.repairedMachines.length} 項設備</li>
            <li>保護了 {report.protectedTargets.length} 個重要目標</li>
          </ul>
        </article>

        <article className="reflection-card result-card pdf-section">
          <span className="card-number">02</span>
          <h2>發生了什麼</h2>
          <p>這次使用了 {report.energyUsed} 單位能源。</p>
          <div className="earned-badges" aria-label="獲得的學習徽章">
            {badges.length > 0 ? (
              badges.map((badge) => (
                <div key={badge}>
                  <strong>{badgeDetails[badge].name}</strong>
                  <small>{badgeDetails[badge].reason}</small>
                </div>
              ))
            ) : (
              <p>再完成一次任務，就能發現新的學習徽章。</p>
            )}
          </div>
        </article>

        <article className="reflection-card improve-card pdf-section">
          <span className="card-number">03</span>
          <h2>下次想怎麼改</h2>
          <div className="reflection-options">
            {reflectionChoices.map((choice) => (
              <button
                type="button"
                key={choice}
                className="no-print"
                aria-pressed={report.reflections.includes(choice)}
                onClick={() => onReflection?.(choice)}
              >
                {choice}
              </button>
            ))}
          </div>
          <p className="print-only">
            我的選擇：{report.reflections.at(-1) ?? '下次使用更省電的方案'}
          </p>
        </article>
      </section>

      <section className="report-privacy pdf-avoid" aria-label="隱私說明">
        <strong>安心分享</strong>
        <span>行動卡不包含真實姓名、電子郵件、IP 或裝置識別資料。</span>
      </section>

      <div className="report-actions no-print">
        {onReplay && (
          <button className="secondary-button" type="button" onClick={onReplay}>
            再挑戰本關
          </button>
        )}
        {onNextMission && nextMissionAvailable && (
          <button className="primary-button" type="button" onClick={onNextMission}>
            前往下一關：水滴守護行動
          </button>
        )}
        <button
          className="secondary-button no-print"
          type="button"
          onClick={onPrint ?? (() => window.print())}
        >
          列印學習報告
        </button>
        <button className="primary-button" type="button" onClick={exportCard}>
          儲存永續行動卡
        </button>
      </div>
    </main>
  )
}
