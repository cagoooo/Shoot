import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { useGameStore } from './app/gameStore'

describe('App', () => {
  beforeEach(() => {
    useGameStore.setState({ screen: 'start' })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('顯示遊戲名稱與開始按鈕', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: '地球守護隊：能量大作戰' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '開始任務' }),
    ).toBeInTheDocument()
  })

  it('開始後顯示基地四個區域', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '開始任務' }))

    expect(screen.getByRole('button', { name: /今天任務/ })).toBeVisible()
    expect(screen.getByRole('button', { name: /工具桌/ })).toBeVisible()
    expect(screen.getByRole('button', { name: /試玩區/ })).toBeVisible()
    expect(screen.getByRole('button', { name: /我的行動紀錄/ })).toBeVisible()
  })

  it('工具資料載入失敗時顯示可理解的訊息', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 404 })),
    )
    useGameStore.setState({ screen: 'workbench' })

    render(<App />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '工具資料暫時無法載入',
    )
    await user.click(screen.getByRole('button', { name: '回基地' }))
    expect(screen.getByRole('heading', { name: '今天想先去哪裡？' })).toBeVisible()
  })
})
