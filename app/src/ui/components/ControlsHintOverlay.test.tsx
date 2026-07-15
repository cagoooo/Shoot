import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { ControlsHintOverlay } from './ControlsHintOverlay'

describe('ControlsHintOverlay', () => {
  beforeEach(() => {
    localStorage.clear()
    Object.defineProperty(navigator, 'webdriver', { value: false, configurable: true })
  })

  it('第一次顯示操作教學，關閉後記住不再出現', () => {
    const { unmount } = render(<ControlsHintOverlay />)
    expect(screen.getByRole('dialog', { name: '操作教學' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /我知道了/ }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    unmount()
    render(<ControlsHintOverlay />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('自動化測試環境（webdriver）不顯示浮層', () => {
    Object.defineProperty(navigator, 'webdriver', { value: true, configurable: true })
    render(<ControlsHintOverlay />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
