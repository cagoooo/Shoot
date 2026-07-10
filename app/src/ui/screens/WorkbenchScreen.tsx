import { useMemo, useState } from 'react'
import type { PartContent } from '../../content/schema'
import { calculateTool } from '../../domain/tools/calculateTool'
import type { ToolPart, ToolSlot } from '../../domain/tools/types'
import { PartCard } from '../components/PartCard'
import { StatDots } from '../components/StatDots'

interface WorkbenchScreenProps {
  parts: PartContent[]
  onBack: () => void
}

const statLabels = [
  ['power', '力量'],
  ['saving', '省電'],
  ['range', '距離'],
  ['aim', '好瞄'],
  ['cooling', '降溫'],
  ['lightness', '輕巧'],
  ['earthCare', '愛地球'],
] as const

function toToolPart(part: PartContent): ToolPart {
  return { id: part.id, slot: part.slot as ToolSlot, stats: part.stats }
}

export function WorkbenchScreen({ parts, onBack }: WorkbenchScreenProps) {
  const [selectedBySlot, setSelectedBySlot] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        parts.map((part) => [part.slot, part.id]),
      ),
  )
  const [focusedPart, setFocusedPart] = useState(parts[0] ?? null)
  const [showWhy, setShowWhy] = useState(false)

  const selectedParts = useMemo(
    () =>
      Object.values(selectedBySlot)
        .map((id) => parts.find((part) => part.id === id))
        .filter((part): part is PartContent => Boolean(part)),
    [parts, selectedBySlot],
  )
  const result = selectedParts.length
    ? calculateTool(selectedParts.map(toToolPart))
    : null

  const selectPart = (part: PartContent) => {
    setSelectedBySlot((current) => ({ ...current, [part.slot]: part.id }))
    setFocusedPart(part)
    setShowWhy(false)
  }

  return (
    <main className="workbench-screen">
      <header className="workbench-header">
        <button className="text-button" type="button" onClick={onBack}>← 回基地</button>
        <div>
          <p className="eyebrow">守護隊工具桌</p>
          <h1>組裝小光能量槍</h1>
        </div>
      </header>

      <div className="workbench-layout">
        <section className="parts-tray" aria-labelledby="parts-title">
          <h2 id="parts-title">選擇零件</h2>
          <div className="parts-list">
            {parts.map((part) => (
              <PartCard
                key={part.id}
                part={part}
                selected={selectedBySlot[part.slot] === part.id}
                onSelect={selectPart}
              />
            ))}
          </div>
        </section>

        <section className="tool-board" aria-labelledby="tool-title">
          <div className="tool-silhouette" aria-hidden="true">
            <span className="tool-core">⚡</span>
            <span className="tool-body" />
            <span className="tool-grip" />
          </div>

          <h2 id="tool-title">現在的能力</h2>
          <div className="stats-grid">
            {result && statLabels.map(([key, label]) => (
              <StatDots key={key} label={label} value={result.studentStats[key]} />
            ))}
          </div>

          {focusedPart && (
            <div className="part-explanation">
              <strong>{focusedPart.name}</strong>
              <p>{focusedPart.shortDescription}</p>
              <button type="button" onClick={() => setShowWhy((shown) => !shown)}>
                為什麼？
              </button>
              {showWhy && <p className="why-answer">{focusedPart.why}</p>}
            </div>
          )}

          <div className="workbench-actions">
            <button className="secondary-button" type="button">試一試</button>
            <button className="primary-button" type="button">帶去任務</button>
          </div>
        </section>
      </div>
    </main>
  )
}
