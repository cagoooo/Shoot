import type { PartContent } from '../../content/schema'

interface PartCardProps {
  part: PartContent
  selected: boolean
  onSelect: (part: PartContent) => void
}

export function PartCard({ part, selected, onSelect }: PartCardProps) {
  return (
    <button
      className="part-card"
      type="button"
      aria-pressed={selected}
      aria-label={`${part.name}：${part.shortDescription}`}
      onClick={() => onSelect(part)}
    >
      <span className="part-symbol" aria-hidden="true">
        {part.slot === 'energy' ? '⚡' : '◆'}
      </span>
      <span>
        <strong>{part.name}</strong>
        <small>{part.shortDescription}</small>
      </span>
    </button>
  )
}
