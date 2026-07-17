import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { speak } from '../accessibility/speech'
import { SceneObjectivePrompt } from './SceneObjectivePrompt'
import { SubtitleBar } from './SubtitleBar'

describe('SubtitleBar', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('朗讀時顯示字幕，結束後隱藏；關閉字幕時不顯示', () => {
    let capturedUtterance: { onend?: () => void } | null = null
    vi.stubGlobal('speechSynthesis', { speak: vi.fn(), cancel: vi.fn() })
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        text: string
        lang = ''
        rate = 1
        onend?: () => void
        onerror?: () => void
        constructor(text: string) {
          this.text = text
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          capturedUtterance = this
        }
      },
    )

    const { rerender } = render(<SubtitleBar enabled />)
    act(() => {
      speak('先聽懂任務，再出發。')
    })
    expect(screen.getByText('先聽懂任務，再出發。')).toBeInTheDocument()

    act(() => {
      capturedUtterance?.onend?.()
    })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    rerender(<SubtitleBar enabled={false} />)
    act(() => {
      speak('這句不該出現。')
    })
    expect(screen.queryByText('這句不該出現。')).not.toBeInTheDocument()
  })
})

describe('SceneObjectivePrompt 鍵盤互動', () => {
  it('靠近目標時按 E 觸發觀察', () => {
    const onObserve = vi.fn()
    render(
      <SceneObjectivePrompt label="雨水箱" near observed={false} onObserve={onObserve} />,
    )
    fireEvent.keyDown(window, { key: 'e' })
    expect(onObserve).toHaveBeenCalledOnce()
  })

  it('未靠近時按 E 不觸發', () => {
    const onObserve = vi.fn()
    render(
      <SceneObjectivePrompt label="雨水箱" near={false} observed={false} onObserve={onObserve} />,
    )
    fireEvent.keyDown(window, { key: 'e' })
    expect(onObserve).not.toHaveBeenCalled()
  })
})
