import type { WasteKind } from '../../domain/boss/stormMachine'

interface SortingPanelProps {
  itemName: string
  hint: string
  showHint: boolean
  onSort: (bin: WasteKind) => void
}

const bins: Array<{ id: WasteKind; name: string; clue: string }> = [
  { id: 'paper', name: '紙類', clue: '乾淨、乾燥的紙纖維' },
  { id: 'plastic', name: '塑膠類', clue: '有彈性，可清洗再利用' },
  { id: 'metal', name: '金屬類', clue: '敲起來有清脆金屬聲' },
  { id: 'general', name: '一般垃圾', clue: '被污染或不能再製' },
]

export function SortingPanel({
  itemName,
  hint,
  showHint,
  onSort,
}: SortingPanelProps) {
  return (
    <div className="sorting-panel">
      <p className="sorting-item">{itemName}</p>
      <div className="sorting-bins">
        {bins.map((bin) => (
          <button
            type="button"
            key={bin.id}
            aria-label={`放入 ${bin.name}`}
            onClick={() => onSort(bin.id)}
          >
            <strong>放入 {bin.name}</strong>
            <small>{bin.clue}</small>
          </button>
        ))}
      </div>
      {showHint && (
        <p className="learning-hint" role="status">
          觀察提示：{hint}
        </p>
      )}
    </div>
  )
}
