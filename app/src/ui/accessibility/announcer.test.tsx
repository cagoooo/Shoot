import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AccessibilityAnnouncer } from './announcer'

describe('AccessibilityAnnouncer', () => {
  it('用禮貌、不打斷操作的方式公告任務訊息', () => {
    render(<AccessibilityAnnouncer message="分類正確，下一個是鋁罐" />)

    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveAttribute('aria-atomic', 'true')
    expect(status).toHaveTextContent('分類正確，下一個是鋁罐')
  })
})
