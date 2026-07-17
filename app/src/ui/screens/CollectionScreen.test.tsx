import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CollectionScreen } from './CollectionScreen'

describe('CollectionScreen', () => {
  it('顯示完成數、完美結局數與行動紀錄', () => {
    render(
      <CollectionScreen
        completedMissions={['recycling-storm', 'water-guardian', 'seed-forest']}
        missionEndings={{ 'seed-forest': 'perfect', 'water-guardian': 'learned' }}
        onBack={vi.fn()}
      />,
    )

    expect(screen.getByText('3／9')).toBeInTheDocument()
    expect(screen.getByText('⭐ 1')).toBeInTheDocument()
    expect(screen.getByText('⭐ 完美結局')).toBeInTheDocument()
    expect(screen.getByText(/我讓回收站重新運轉/)).toBeInTheDocument()
    expect(screen.queryByText(/我清走海廢/)).not.toBeInTheDocument()
  })

  it('未完成的世界顯示待挑戰且不洩漏圖示', () => {
    render(
      <CollectionScreen completedMissions={[]} missionEndings={{}} onBack={vi.fn()} />,
    )
    expect(screen.getAllByText('待挑戰')).toHaveLength(9)
    expect(screen.getAllByText('❓')).toHaveLength(9)
    expect(screen.getByText(/完成第一個任務後/)).toBeInTheDocument()
  })
})
