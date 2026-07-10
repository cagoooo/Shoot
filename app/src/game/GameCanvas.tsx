import { useEffect, useRef } from 'react'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import { createGameEngine } from './engine/createEngine'
import { createGameScene } from './engine/createScene'

export interface RuntimeEngine {
  runRenderLoop(callback: () => void): void
  stopRenderLoop(): void
  resize(): void
  dispose(): void
}

export interface RuntimeScene {
  render(): void
  dispose(): void
}

type EngineFactory = (canvas: HTMLCanvasElement) => Promise<RuntimeEngine>
type SceneFactory = (engine: RuntimeEngine) => RuntimeScene

const defaultEngineFactory: EngineFactory = createGameEngine
const defaultSceneFactory: SceneFactory = (engine) =>
  createGameScene(engine as AbstractEngine)

interface GameCanvasProps {
  engineFactory?: EngineFactory
  sceneFactory?: SceneFactory
}

export function GameCanvas({
  engineFactory = defaultEngineFactory,
  sceneFactory = defaultSceneFactory,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false
    let engine: RuntimeEngine | null = null
    let scene: RuntimeScene | null = null

    const handleResize = () => engine?.resize()

    void engineFactory(canvas).then((createdEngine) => {
      if (cancelled) {
        createdEngine.dispose()
        return
      }

      engine = createdEngine
      scene = sceneFactory(createdEngine)
      engine.runRenderLoop(() => scene?.render())
      window.addEventListener('resize', handleResize)
    })

    return () => {
      cancelled = true
      window.removeEventListener('resize', handleResize)
      engine?.stopRenderLoop()
      scene?.dispose()
      engine?.dispose()
    }
  }, [engineFactory, sceneFactory])

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      aria-label="地球守護隊 3D 任務畫面"
    />
  )
}
