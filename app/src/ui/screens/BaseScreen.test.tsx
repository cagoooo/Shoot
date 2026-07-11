import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BaseScreen } from './BaseScreen'

describe('BaseScreen', () => {
  it('學生可在基地切換背景音樂，且按鈕清楚說明目前狀態', async () => {
    const user = userEvent.setup()
    const onAudioMutedChange = vi.fn()
    render(
      <BaseScreen
        mode="middle-assist"
        audioMuted={false}
        onAudioMutedChange={onAudioMutedChange}
        onNavigate={vi.fn()}
        onExportProgress={vi.fn()}
        onImportProgress={vi.fn(async () => undefined)}
      />,
    )

    const button = screen.getByRole('button', { name: '關閉背景音樂' })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    await user.click(button)
    expect(onAudioMutedChange).toHaveBeenCalledWith(true)
  })
})
