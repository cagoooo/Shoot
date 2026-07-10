import { useRef } from 'react'
import {
  createEmptyInput,
  type InputSnapshot,
  type InputSourceState,
} from '../../input/actions'
import { calculateStickVector } from '../../input/PointerTouchSource'

interface TouchControlsProps {
  onInputChange: (state: InputSnapshot) => void
  leftHanded?: boolean
}

export function TouchControls({
  onInputChange,
  leftHanded = false,
}: TouchControlsProps) {
  const state = useRef(createEmptyInput())
  const stickStart = useRef<{ pointerId: number; x: number; y: number } | null>(
    null,
  )

  const emit = (patch: InputSourceState) => {
    state.current = { ...state.current, ...patch }
    onInputChange({ ...state.current })
  }

  const releaseStick = () => {
    stickStart.current = null
    emit({ moveX: 0, moveY: 0 })
  }

  return (
    <div
      className={leftHanded ? 'touch-controls touch-left-handed' : 'touch-controls'}
      aria-label="觸控操作"
    >
      <div
        className="touch-stick"
        data-testid="move-stick"
        aria-label="移動搖桿"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture?.(event.pointerId)
          stickStart.current = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
          }
        }}
        onPointerMove={(event) => {
          const start = stickStart.current
          if (!start || start.pointerId !== event.pointerId) return
          const vector = calculateStickVector(
            start.x,
            start.y,
            event.clientX,
            event.clientY,
            52,
          )
          emit({ moveX: vector.x, moveY: vector.y })
        }}
        onPointerUp={releaseStick}
        onPointerCancel={releaseStick}
      >
        <span aria-hidden="true">●</span>
      </div>

      <div className="touch-actions">
        <button
          type="button"
          data-testid="primary-use"
          onPointerDown={() => emit({ primaryUse: true })}
          onPointerUp={() => emit({ primaryUse: false })}
          onPointerCancel={() => emit({ primaryUse: false })}
        >
          使用工具
        </button>
        <button
          type="button"
          onPointerDown={() => emit({ interact: true })}
          onPointerUp={() => emit({ interact: false })}
          onPointerCancel={() => emit({ interact: false })}
        >
          互動
        </button>
      </div>
    </div>
  )
}
