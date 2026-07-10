import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import { Engine } from '@babylonjs/core/Engines/engine'

export interface EngineFactory {
  createWebGpu(canvas: HTMLCanvasElement): Promise<AbstractEngine>
  createWebGl(canvas: HTMLCanvasElement): AbstractEngine
}

const browserEngineFactory: EngineFactory = {
  async createWebGpu(canvas) {
    const { WebGPUEngine } = await import(
      '@babylonjs/core/Engines/webgpuEngine'
    )
    const engine = new WebGPUEngine(canvas)
    await engine.initAsync()
    return engine
  },

  createWebGl(canvas) {
    return new Engine(canvas, true, {
      preserveDrawingBuffer: false,
      stencil: false,
    })
  },
}

export async function createGameEngine(
  canvas: HTMLCanvasElement,
  factory: EngineFactory = browserEngineFactory,
  webGpuAvailable = typeof navigator !== 'undefined' && 'gpu' in navigator,
): Promise<AbstractEngine> {
  if (webGpuAvailable) {
    try {
      return await factory.createWebGpu(canvas)
    } catch {
      // 使用下方 WebGL 路徑，學生不需要處理技術錯誤。
    }
  }
  return factory.createWebGl(canvas)
}
