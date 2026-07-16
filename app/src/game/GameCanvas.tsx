import { useEffect, useRef } from 'react'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import { createGameEngine } from './engine/createEngine'
import { createGameScene } from './engine/createScene'
import type { ComfortSettings } from '../domain/settings/accessibility'
import { InputManager } from '../input/InputManager'
import { bindKeyboardMouseInput } from '../input/bindKeyboardMouseInput'
import type { WeaponState } from '../domain/combat/weaponState'
import {
  createPerformanceMonitor,
  feedPerformanceSample,
} from './engine/performanceMonitor'

export interface RuntimeEngine {
  runRenderLoop(callback: () => void): void
  stopRenderLoop(): void
  resize(): void
  dispose(): void
  getFps?(): number
  setHardwareScalingLevel?(level: number): void
}

export interface RuntimeScene {
  render(): void
  dispose(): void
}

type EngineFactory = (canvas: HTMLCanvasElement) => Promise<RuntimeEngine>
export type SceneFactory = (
  engine: RuntimeEngine,
  inputManager?: InputManager,
  comfortSettings?: Partial<ComfortSettings>,
  onWeaponStateChange?: (state: WeaponState) => void,
  onProximityChange?: (near: boolean) => void,
) => RuntimeScene

const defaultEngineFactory: EngineFactory = createGameEngine

// 引擎依 canvas 快取重用：WebGPU 引擎在同一個 canvas 上 dispose 後無法再建立
// 第二顆（context 已被前一顆佔用），所以任務階段切換只重建場景、不重建引擎；
// canvas 真正從畫面移除後才釋放引擎。
const engineCache = new WeakMap<HTMLCanvasElement, Promise<RuntimeEngine>>()
const defaultSceneFactory: SceneFactory = (
  engine,
  inputManager,
  comfortSettings,
  onWeaponStateChange,
) =>
  createGameScene(
    engine as AbstractEngine,
    inputManager,
    comfortSettings,
    onWeaponStateChange,
  )

interface GameCanvasProps {
  engineFactory?: EngineFactory
  sceneFactory?: SceneFactory
  inputManager?: InputManager
  comfortSettings?: Partial<ComfortSettings>
  onWeaponStateChange?: (state: WeaponState) => void
  onProximityChange?: (near: boolean) => void
}

export function GameCanvas({
  engineFactory = defaultEngineFactory,
  sceneFactory = defaultSceneFactory,
  inputManager,
  comfortSettings,
  onWeaponStateChange,
  onProximityChange,
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

    const enginePromise = engineCache.get(canvas) ?? engineFactory(canvas)
    engineCache.set(canvas, enginePromise)

    void enginePromise.then((sharedEngine) => {
      if (cancelled) return
      engine = sharedEngine
      try {
        scene = sceneFactory(
          sharedEngine,
          inputManager,
          comfortSettings,
          onWeaponStateChange,
          onProximityChange,
        )
      } catch (error) {
        console.error('3D 場景建立失敗', error)
        return
      }
      const performance = createPerformanceMonitor('high')
      sharedEngine.runRenderLoop(() => {
        scene?.render()
        if (!engine?.getFps) return
        const decision = feedPerformanceSample(performance, engine.getFps())
        if (decision.reason !== 'sustained-low-fps') return
        engine.setHardwareScalingLevel?.(
          decision.profile === 'medium' ? 1.5 : 2,
        )
      })
      window.addEventListener('resize', handleResize)
    })

    return () => {
      cancelled = true
      void enginePromise.then((sharedEngine) => {
        window.removeEventListener('resize', handleResize)
        unbindInput?.()
        sharedEngine.stopRenderLoop()
        scene?.dispose()
        // 等一個 tick：StrictMode 重掛載與階段切換時 canvas 仍在畫面上，
        // 引擎要留給下一個場景重用；只有 canvas 真的被移除才釋放。
        setTimeout(() => {
          if (!canvas.isConnected) {
            sharedEngine.dispose()
            engineCache.delete(canvas)
          }
        }, 0)
      })
    }
  }, [
    comfortSettings,
    engineFactory,
    inputManager,
    onWeaponStateChange,
    onProximityChange,
    sceneFactory,
  ])

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      aria-label="地球守護隊 3D 任務畫面"
    />
  )
}
