import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { reduceLearningEvents } from '../../learning/reducer'
import { ReportScreen } from './ReportScreen'

const report = reduceLearningEvents([
  { type: 'energy-used', amount: 55 },
  { type: 'material-recycled', category: 'paper', amount: 2 },
  { type: 'material-recycled', category: 'plastic', amount: 1 },
  { type: 'material-recycled', category: 'metal', amount: 1 },
  { type: 'machine-repaired', id: 'sorter' },
  { type: 'machine-repaired', id: 'storm-machine' },
  { type: 'protected-target', id: 'seedling' },
])

describe('ReportScreen', () => {
  it('依序顯示行動、結果與下次改良三張回顧卡', () => {
    const { container } = render(<ReportScreen report={report} onBack={vi.fn()} />)

    expect(screen.getByRole('heading', { name: '我做了什麼' })).toBeVisible()
    expect(screen.getByRole('heading', { name: '發生了什麼' })).toBeVisible()
    expect(screen.getByRole('heading', { name: '下次想怎麼改' })).toBeVisible()
    expect(screen.getByText('省電高手')).toBeVisible()
    expect(screen.queryByText(/排行榜|排名|擊敗數/)).not.toBeInTheDocument()
    expect(container.querySelector('#printable-report')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '列印學習報告' })).toHaveClass(
      'no-print',
    )
  })

  it('反思、列印與行動卡都能用按鈕操作', () => {
    const onReflection = vi.fn()
    const onPrint = vi.fn()
    const onExport = vi.fn()
    render(
      <ReportScreen
        report={report}
        onBack={vi.fn()}
        onReflection={onReflection}
        onPrint={onPrint}
        onExport={onExport}
      />,
    )

    const reflection = screen.getByRole('button', { name: '下次使用更省電的方案' })
    reflection.focus()
    expect(reflection).toHaveFocus()
    fireEvent.click(reflection)
    fireEvent.click(screen.getByRole('button', { name: '列印學習報告' }))
    fireEvent.click(screen.getByRole('button', { name: '儲存永續行動卡' }))

    expect(onReflection).toHaveBeenCalledWith('下次使用更省電的方案')
    expect(onPrint).toHaveBeenCalledOnce()
    expect(onExport).toHaveBeenCalledOnce()
  })

  it('顯示行動數據長條圖並可選「我的發現」句型', () => {
    render(<ReportScreen report={report} onBack={vi.fn()} />)

    expect(screen.getByText(/我的行動數據/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '我這次的發現' })).toBeVisible()

    const discovery = screen.getByRole('button', { name: /把 4 件材料分對類/ })
    fireEvent.click(discovery)
    expect(discovery).toHaveAttribute('aria-pressed', 'true')
  })
})
