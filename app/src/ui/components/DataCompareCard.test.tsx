import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DataCompareCard } from './DataCompareCard'

describe('DataCompareCard', () => {
  it('顯示標題、數值與說明，最大值長條為 100%', () => {
    const { container } = render(
      <DataCompareCard
        title="未來三天雨量預報"
        note="明天的雨量最大。"
        bars={[
          { label: '今天', value: 30, unit: 'mm' },
          { label: '明天', value: 120, unit: 'mm' },
        ]}
      />,
    )

    expect(screen.getByText(/未來三天雨量預報/)).toBeInTheDocument()
    expect(screen.getByText('120 mm')).toBeInTheDocument()
    expect(screen.getByText('明天的雨量最大。')).toBeInTheDocument()
    const fills = container.querySelectorAll<HTMLElement>('.data-compare-fill')
    expect(fills[1].style.width).toBe('100%')
    expect(fills[0].style.width).toBe('25%')
  })
})
