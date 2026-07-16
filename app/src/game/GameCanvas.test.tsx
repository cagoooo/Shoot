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

    // 銷毀在引擎生命週期 promise 鏈上執行，等它完成。
    await waitFor(() => expect(engine.dispose).toHaveBeenCalledOnce())
    expect(engine.stopRenderLoop).toHaveBeenCalledOnce()
    expect(scene.dispose).toHaveBeenCalledOnce()
  })

  it('持續低幀率時只降低一級實際渲染畫質', async () => {
    let renderFrame: (() => void) | undefined
    const engine: RuntimeEngine = {
      runRenderLoop: vi.fn((callback) => { renderFrame = callback }),
      stopRenderLoop: vi.fn(),
      resize: vi.fn(),
      dispose: vi.fn(),
      getFps: vi.fn(() => 24),
      setHardwareScalingLevel: vi.fn(),
    }
    const scene: RuntimeScene = { render: vi.fn(), dispose: vi.fn() }

    render(
      <GameCanvas
        engineFactory={vi.fn(async () => engine)}
        sceneFactory={vi.fn(() => scene)}
      />,
    )
    await waitFor(() => expect(renderFrame).toBeTypeOf('function'))
    for (let frame = 0; frame < 600; frame += 1) renderFrame?.()

    expect(engine.setHardwareScalingLevel).toHaveBeenCalledOnce()
    expect(engine.setHardwareScalingLevel).toHaveBeenCalledWith(1.5)
  })
})
