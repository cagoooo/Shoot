import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SortingPanel } from './SortingPanel'

describe('SortingPanel', () => {
  it('顯示學生用分類名稱並回報選擇', () => {
    const onSort = vi.fn()
    render(
      <SortingPanel
        itemName="乾淨紙盒"
        hint="看看紙的纖維和乾燥程度。"
        showHint={false}
        onSort={onSort}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '放入 紙類' }))

    expect(onSort).toHaveBeenCalledWith('paper')
    expect(screen.queryByText('看看紙的纖維和乾燥程度。')).not.toBeInTheDocument()
  })

  it('中年級輔助模式可逐步顯示觀察提示', () => {
    render(
      <SortingPanel
        itemName="乾淨紙盒"
        hint="看看紙的纖維和乾燥程度。"
        showHint
        onSort={vi.fn()}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('看看紙的纖維')
  })
})
