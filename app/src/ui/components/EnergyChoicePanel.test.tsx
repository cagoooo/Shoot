import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EnergyChoicePanel } from './EnergyChoicePanel'

describe('EnergyChoicePanel', () => {
  it('三種方案都提供可觀察的能源與時間資料', () => {
    const onChoose = vi.fn()
    render(<EnergyChoicePanel onChoose={onChoose} />)

    expect(screen.getByText('省電慢慢修')).toBeInTheDocument()
    expect(screen.getAllByText(/能源/).length).toBeGreaterThanOrEqual(3)
    fireEvent.click(screen.getByRole('button', { name: /分區聰明修/ }))
    expect(onChoose).toHaveBeenCalledWith('zoned')
  })
})
