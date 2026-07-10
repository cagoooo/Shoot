import { useEffect, useRef } from 'react'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import { createGameEngine } from './engine/createEngine'
import { createGameScene } from './engine/createScene'
import type { ComfortSettings } from '../domain/settings/accessibility'
import { InputManager } from '../input/InputManager'
import { bindKeyboardMouseInput } from '../input/bindKeyboardMouseInput'

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
type SceneFactory = (
  engine: RuntimeEngine,
  inputManager?: InputManager,
  comfortSettings?: Partial<ComfortSettings>,
) => RuntimeScene

const defaultEngineFactory: EngineFactory = createGameEngine
const defaultSceneFactory: SceneFactory = (engine, inputManager, comfortSettings) =>
  createGameScene(engine as AbstractEngine, inputManager, comfortSettings)

interface GameCanvasProps {
  engineFactory?: EngineFactory
  sceneFactory?: SceneFactory
  inputManager?: InputManager
  comfortSettings?: Partial<ComfortSettings>
}

export function GameCanvas({
  engineFactory = defaultEngineFactory,
  sceneFactory = defaultSceneFactory,
  inputManager,
  comfortSettings,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false
    let engine: RuntimeEngine | null = null
    let scene: RuntimeScene | null = null
    const unbindInput = inputManager
      ? bindKeyboardMouseInput(window, canvas, inputManager)
      : undefined

    const handleResize = () => engine?.resize()

    void engineFactory(canvas).then((createdEngine) => {
      if (cancelled) {
        createdEngine.dispose()
        return
      }

      engine = createdEngine
      scene = sceneFactory(createdEngine, inputManager, comfortSettings)
      engine.runRenderLoop(() => scene?.render())
      window.addEventListener('resize', handleResize)
    })

    return () => {
      cancelled = true
      window.removeEventListener('resize', handleResize)
      unbindInput?.()
      engine?.stopRenderLoop()
      scene?.dispose()
      engine?.dispose()
    }
  }, [comfortSettings, engineFactory, inputManager, sceneFactory])

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      aria-label="地球守護隊 3D 任務畫面"
    />
  )
}
