import { act, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DiveTransition } from './DiveTransition'

describe('DiveTransition', () => {
  it('triggerKey 改變時顯示轉場遮罩並在動畫後移除', () => {
    vi.useFakeTimers()
    const { container, rerender } = render(<DiveTransition triggerKey={1} />)
    expect(container.querySelector('.dive-transition')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(800)
    })
    expect(container.querySelector('.dive-transition')).not.toBeInTheDocument()

    rerender(<DiveTransition triggerKey={2} />)
    expect(container.querySelector('.dive-transition')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('減少動態時不顯示轉場', () => {
    const { container } = render(<DiveTransition triggerKey={1} reducedMotion />)
    expect(container.querySelector('.dive-transition')).not.toBeInTheDocument()
  })
})
