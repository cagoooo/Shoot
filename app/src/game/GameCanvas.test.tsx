import { render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GameCanvas, type RuntimeEngine, type RuntimeScene } from './GameCanvas'

describe('GameCanvas', () => {
  it('掛載時啟動渲染，卸載時釋放場景與引擎', async () => {
    const scene: RuntimeScene = {
      render: vi.fn(),
      dispose: vi.fn(),
    }
    const engine: RuntimeEngine = {
      runRenderLoop: vi.fn((callback) => callback()),
      stopRenderLoop: vi.fn(),
      resize: vi.fn(),
      dispose: vi.fn(),
    }

    const view = render(
      <GameCanvas
        engineFactory={vi.fn(async () => engine)}
        sceneFactory={vi.fn(() => scene)}
      />,
    )

    await waitFor(() => expect(engine.runRenderLoop).toHaveBeenCalledOnce())
    expect(scene.render).toHaveBeenCalledOnce()

    view.unmount()

    expect(engine.stopRenderLoop).toHaveBeenCalledOnce()
    expect(scene.dispose).toHaveBeenCalledOnce()
    expect(engine.dispose).toHaveBeenCalledOnce()
  })
})
