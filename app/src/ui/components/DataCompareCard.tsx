interface DataCompareCardProps {
  title: string
  note?: string
  bars: ReadonlyArray<{ label: string; value: number; unit: string }>
}

/** 科學資料判讀卡：用長條圖呈現數據，長度以最大值為 100%。 */
export function DataCompareCard({ title, note, bars }: DataCompareCardProps) {
  const maxValue = Math.max(1, ...bars.map((bar) => bar.value))

  return (
    <div className="data-compare-card" role="img" aria-label={`${title}：${bars.map((bar) => `${bar.label} ${bar.value} ${bar.unit}`).join('，')}`}>
      <strong>📊 {title}</strong>
      <div className="data-compare-bars" aria-hidden="true">
        {bars.map((bar) => (
          <div className="data-compare-row" key={bar.label}>
            <span className="data-compare-label">{bar.label}</span>
            <span className="data-compare-track">
              <span
                className="data-compare-fill"
                style={{ width: `${Math.round((bar.value / maxValue) * 100)}%` }}
              />
            </span>
            <span className="data-compare-value">{bar.value} {bar.unit}</span>
          </div>
        ))}
      </div>
      {note && <p className="data-compare-note">{note}</p>}
    </div>
  )
}
