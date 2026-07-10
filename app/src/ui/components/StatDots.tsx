interface StatDotsProps {
  label: string
  value: number
}

export function StatDots({ label, value }: StatDotsProps) {
  return (
    <div className="stat-dots" aria-label={`${label} ${value} / 5`}>
      <span className="stat-label">{label}</span>
      <span className="dots" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            className={index < value ? 'dot dot-filled' : 'dot'}
            key={index}
          />
        ))}
      </span>
    </div>
  )
}
