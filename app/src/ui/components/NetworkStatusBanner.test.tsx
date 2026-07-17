import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { InstallPrompt } from './InstallPrompt'
import { NetworkStatusBanner } from './NetworkStatusBanner'

describe('NetworkStatusBanner', () => {
  it('離線時顯示可離線遊玩提示，恢復後顯示短暫通知', () => {
    vi.useFakeTimers()
    render(<NetworkStatusBanner />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(screen.getByText(/目前離線/)).toBeInTheDocument()

    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(screen.getByText(/網路恢復了/)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(5100)
    })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    vi.useRealTimers()
  })
})

describe('InstallPrompt', () => {
  it('收到安裝事件時顯示安裝按鈕，按下後觸發原生提示', () => {
    localStorage.clear()
    render(<InstallPrompt />)
    expect(screen.queryByRole('note')).not.toBeInTheDocument()

    const prompt = vi.fn(async () => undefined)
    act(() => {
      const event = new Event('beforeinstallprompt') as Event & { prompt: typeof prompt }
      event.prompt = prompt
      window.dispatchEvent(event)
    })

    const install = screen.getByRole('button', { name: '安裝到主畫面' })
    act(() => {
      install.click()
    })
    expect(prompt).toHaveBeenCalledOnce()
  })

  it('關閉後記住不再顯示', () => {
    localStorage.clear()
    const { unmount } = render(<InstallPrompt />)
    act(() => {
      const event = new Event('beforeinstallprompt') as Event & { prompt: () => Promise<void> }
      event.prompt = async () => undefined
      window.dispatchEvent(event)
    })
    act(() => {
      screen.getByRole('button', { name: '不用了，之後再說' }).click()
    })
    expect(screen.queryByRole('note')).not.toBeInTheDocument()

    unmount()
    render(<InstallPrompt />)
    act(() => {
      const event = new Event('beforeinstallprompt') as Event & { prompt: () => Promise<void> }
      event.prompt = async () => undefined
      window.dispatchEvent(event)
    })
    expect(screen.queryByRole('note')).not.toBeInTheDocument()
  })
})
