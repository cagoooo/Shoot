import { openDB, type DBSchema } from 'idb'
import { migrateSave, saveSchema, type SaveV1 } from './saveSchema'

interface GameSaveDatabase extends DBSchema {
  saves: {
    key: 'active'
    value: SaveV1
  }
}

export interface SaveRepository {
  load(): Promise<SaveV1>
  save(save: SaveV1): Promise<void>
}

export function createBrowserSaveRepository(): SaveRepository {
  const connect = () =>
    openDB<GameSaveDatabase>('earth-guardian-game', 1, {
      upgrade(database) {
        if (!database.objectStoreNames.contains('saves')) {
          database.createObjectStore('saves')
        }
      },
    })

  return {
    async load() {
      const database = await connect()
      try {
        return migrateSave(await database.get('saves', 'active'))
      } finally {
        database.close()
      }
    },

    async save(save) {
      const validated = saveSchema.parse(save)
      const database = await connect()
      try {
        await database.put('saves', validated, 'active')
      } finally {
        database.close()
      }
    },
  }
}
