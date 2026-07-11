interface CommandBase {
  id: string
  playerId: string
  tick: number
}

export type GameCommand =
  | (CommandBase & { kind: 'move'; x: number; z: number })
  | (CommandBase & {
      kind: 'use-tool'
      toolId: string
      targetId?: string
    })
  | (CommandBase & { kind: 'repair'; targetId: string })
  | (CommandBase & { kind: 'interact'; targetId: string })

export interface MultiplayerPort {
  readonly mode: 'offline' | 'online'
  readonly localPlayerId: string
  send(command: GameCommand): void
  subscribe(listener: (command: GameCommand) => void): () => void
  disconnect(): Promise<void>
}

export function createOfflineMultiplayerPort(localPlayerId: string): MultiplayerPort {
  const listeners = new Set<(command: GameCommand) => void>()
  return {
    mode: 'offline',
    localPlayerId,
    send(command) {
      if (command.playerId !== localPlayerId) return
      for (const listener of listeners) listener(command)
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    async disconnect() {
      listeners.clear()
    },
  }
}
