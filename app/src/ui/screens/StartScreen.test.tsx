import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StartScreen } from './StartScreen'

describe('StartScreen', () => {
  it('不支援 WebGL 的環境退回靜態背景，控制項仍完整', () => {
    const onStart = vi.fn()
    const { container } = render(
      <StartScreen
        mode="middle-assist"
        onModeChange={vi.fn()}
        onStart={onStart}
        onTeacherMode={vi.fn()}
      />,
    )

    // jsdom 沒有 WebGL，3D 背景不應出現。
    expect(container.querySelector('.start-3d-backdrop')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '地球守護隊：能量大作戰' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '開始任務' }))
    expect(onStart).toHaveBeenCalledOnce()

    // 開始畫面底部有作者署名，連到阿凱老師教育科技創新專區。
    expect(screen.getByRole('link', { name: '阿凱老師' })).toHaveAttribute('href', 'https://cagoooo.github.io/Akai/')
  })
})
