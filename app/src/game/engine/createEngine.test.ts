import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import { describe, expect, it, vi } from 'vitest'
import { createGameEngine, type EngineFactory } from './createEngine'

const canvas = document.createElement('canvas')
const webGlEngine = { name: 'webgl' } as unknown as AbstractEngine
const webGpuEngine = { name: 'webgpu' } as unknown as AbstractEngine

describe('createGameEngine', () => {
  it('沒有 WebGPU 時直接使用 WebGL', async () => {
    const factory: EngineFactory = {
      createWebGpu: vi.fn(async () => webGpuEngine),
      createWebGl: vi.fn(() => webGlEngine),
    }

    await expect(createGameEngine(canvas, factory, false)).resolves.toBe(
      webGlEngine,
    )
    expect(factory.createWebGpu).not.toHaveBeenCalled()
  })

  it('WebGPU 初始化失敗時改用 WebGL', async () => {
    const factory: EngineFactory = {
      createWebGpu: vi.fn(async () => {
        throw new Error('gpu unavailable')
      }),
      createWebGl: vi.fn(() => webGlEngine),
    }

    await expect(createGameEngine(canvas, factory, true)).resolves.toBe(
      webGlEngine,
    )
    expect(factory.createWebGl).toHaveBeenCalledOnce()
  })
})
