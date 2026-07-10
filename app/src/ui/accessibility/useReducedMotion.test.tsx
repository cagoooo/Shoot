import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useReducedMotion } from './useReducedMotion'

function Probe() {
  const reduced = useReducedMotion()
  return <output>{reduced ? '減少動態' : '標準動態'}</output>
}

describe('useReducedMotion', () => {
  it('遵守作業系統的減少動態偏好', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    render(<Probe />)
    expect(screen.getByText('減少動態')).toBeVisible()
  })
})
