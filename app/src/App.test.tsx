import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('顯示遊戲名稱與開始按鈕', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: '地球守護隊：能量大作戰' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '開始任務' }),
    ).toBeInTheDocument()
  })
})
