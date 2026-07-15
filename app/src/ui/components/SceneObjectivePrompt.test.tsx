import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SceneObjectivePrompt } from './SceneObjectivePrompt'

describe('SceneObjectivePrompt', () => {
  it('未靠近時顯示方向箭頭與步數', () => {
    render(
      <SceneObjectivePrompt
        label="雨水箱"
        near={false}
        observed={false}
        onObserve={vi.fn()}
        tracking={{ near: false, distance: 11.6, bearing: 90 }}
      />,
    )
    expect(screen.getByText(/前往「雨水箱」/)).toBeInTheDocument()
    expect(screen.getByText(/往箭頭方向走約 12 步/)).toBeInTheDocument()
  })

  it('靠近後顯示觀察按鈕', () => {
    const onObserve = vi.fn()
    render(
      <SceneObjectivePrompt
        label="雨水箱"
        near
        observed={false}
        onObserve={onObserve}
        tracking={{ near: true, distance: 2, bearing: 0 }}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '觀察這個地點' }))
    expect(onObserve).toHaveBeenCalled()
  })
})
