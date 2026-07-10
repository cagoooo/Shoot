import { InputManager } from './InputManager'
import { KeyboardMouseSource } from './KeyboardMouseSource'

const SOURCE_ID = 'keyboard-mouse'

export function bindKeyboardMouseInput(
  keyTarget: EventTarget,
  pointerTarget: EventTarget,
  manager: InputManager,
): () => void {
  const source = new KeyboardMouseSource()
  const publish = () => manager.updateSource(SOURCE_ID, source.snapshot())

  const handleKeyDown = (event: Event) => {
    source.handleKey((event as KeyboardEvent).code, true)
    publish()
  }
  const handleKeyUp = (event: Event) => {
    source.handleKey((event as KeyboardEvent).code, false)
    publish()
  }
  const handlePointerDown = (event: Event) => {
    source.handlePointerButton((event as PointerEvent).button, true)
    publish()
  }
  const handlePointerUp = (event: Event) => {
    source.handlePointerButton((event as PointerEvent).button, false)
    publish()
  }
  const handleBlur = () => {
    source.reset()
    publish()
  }
  const preventContextMenu = (event: Event) => event.preventDefault()

  keyTarget.addEventListener('keydown', handleKeyDown)
  keyTarget.addEventListener('keyup', handleKeyUp)
  keyTarget.addEventListener('blur', handleBlur)
  pointerTarget.addEventListener('pointerdown', handlePointerDown)
  pointerTarget.addEventListener('pointerup', handlePointerUp)
  pointerTarget.addEventListener('pointercancel', handlePointerUp)
  pointerTarget.addEventListener('contextmenu', preventContextMenu)

  return () => {
    keyTarget.removeEventListener('keydown', handleKeyDown)
    keyTarget.removeEventListener('keyup', handleKeyUp)
    keyTarget.removeEventListener('blur', handleBlur)
    pointerTarget.removeEventListener('pointerdown', handlePointerDown)
    pointerTarget.removeEventListener('pointerup', handlePointerUp)
    pointerTarget.removeEventListener('pointercancel', handlePointerUp)
    pointerTarget.removeEventListener('contextmenu', preventContextMenu)
    manager.removeSource(SOURCE_ID)
  }
}
