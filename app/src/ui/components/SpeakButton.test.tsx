import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SpeakButton } from './SpeakButton'

describe('SpeakButton', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('按下後用繁中語音唸出文字', () => {
    const speak = vi.fn()
    const cancel = vi.fn()
    vi.stubGlobal('speechSynthesis', { speak, cancel })
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        text: string
        lang = ''
        rate = 1
        constructor(text: string) {
          this.text = text
        }
      },
    )

    render(<SpeakButton text="先聽懂任務。下一步：按下開始。" />)
    fireEvent.click(screen.getByRole('button', { name: /唸給我聽/ }))

    expect(cancel).toHaveBeenCalled()
    expect(speak).toHaveBeenCalledTimes(1)
    const utterance = speak.mock.calls[0][0] as SpeechSynthesisUtterance
    expect(utterance.text).toBe('先聽懂任務。下一步：按下開始。')
    expect(utterance.lang).toBe('zh-TW')
  })

  it('瀏覽器不支援語音時不顯示按鈕', () => {
    const original = window.speechSynthesis
    // @ts-expect-error 模擬沒有語音功能的瀏覽器
    delete window.speechSynthesis

    render(<SpeakButton text="任務說明" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()

    if (original) window.speechSynthesis = original
  })
})
