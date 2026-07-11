import { describe, expect, it, vi } from 'vitest'
import { createOfflineMultiplayerPort, type GameCommand } from './multiplayerPort'

describe('多人合作預留介面', () => {
  it('移動、工具與修理都轉成可序列化的明確指令', () => {
    const commands: GameCommand[] = [
      { id: 'cmd-1', playerId: 'local-1', tick: 10, kind: 'move', x: 0.5, z: 1 },
      { id: 'cmd-2', playerId: 'local-1', tick: 11, kind: 'use-tool', toolId: 'light-rifle', targetId: 'core-1' },
      { id: 'cmd-3', playerId: 'local-1', tick: 12, kind: 'repair', targetId: 'sorter-1' },
    ]

    expect(JSON.parse(JSON.stringify(commands))).toEqual(commands)
    expect(new Set(commands.map((command) => command.id)).size).toBe(3)
  })

  it('首版離線連線埠保留相同送出與訂閱契約', () => {
    const received = vi.fn()
    const port = createOfflineMultiplayerPort('local-1')
    const unsubscribe = port.subscribe(received)
    port.send({ id: 'cmd-1', playerId: 'local-1', tick: 1, kind: 'interact', targetId: 'gate-1' })

    expect(port.mode).toBe('offline')
    expect(received).toHaveBeenCalledOnce()
    unsubscribe()
    port.send({ id: 'cmd-2', playerId: 'local-1', tick: 2, kind: 'interact', targetId: 'gate-2' })
    expect(received).toHaveBeenCalledOnce()
  })
})
