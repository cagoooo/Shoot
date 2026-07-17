import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { campaignMissions } from '../../content/missionCatalog'
import { teacherGuides } from '../../content/teacherGuide'
import { TeacherScreen } from './TeacherScreen'

describe('teacherGuides', () => {
  it('九關都有課堂流程與至少兩題討論', () => {
    for (const mission of campaignMissions) {
      const guide = teacherGuides[mission.id]
      expect(guide.flow.length, mission.id).toBeGreaterThanOrEqual(3)
      expect(guide.discussion.length, mission.id).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('TeacherScreen', () => {
  it('可切換任務並顯示對應流程與討論題', () => {
    render(<TeacherScreen onBack={vi.fn()} />)

    expect(screen.getByRole('heading', { name: /垃圾風暴救援行動/ })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'ocean-blue' },
    })
    expect(screen.getByRole('heading', { name: /海洋藍光行動/ })).toBeInTheDocument()
    expect(screen.getByText(teacherGuides['ocean-blue'].discussion[0])).toBeInTheDocument()
  })

  it('計時器可設定並倒數，歸零顯示時間到', () => {
    vi.useFakeTimers()
    render(<TeacherScreen onBack={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: '5 分鐘' }))
    expect(screen.getByRole('timer')).toHaveTextContent('05:00')

    fireEvent.click(screen.getByRole('button', { name: '開始計時' }))
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByRole('timer')).toHaveTextContent('04:57')

    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000)
    })
    expect(screen.getByRole('timer')).toHaveTextContent('時間到！')
    vi.useRealTimers()
  })
})
