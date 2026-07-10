import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptySave } from './saveSchema'
import { createBrowserSaveRepository } from './saveRepository'

describe('browser save repository', () => {
  beforeEach(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('earth-guardian-game')
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      request.onblocked = () => resolve()
    })
  })

  it('沒有資料時回傳安全預設值', async () => {
    const repository = createBrowserSaveRepository()

    await expect(repository.load()).resolves.toEqual(createEmptySave())
  })

  it('儲存後可從 IndexedDB 讀回', async () => {
    const repository = createBrowserSaveRepository()
    const save = createEmptySave()
    save.unlockedParts.push('solar-box')

    await repository.save(save)

    await expect(repository.load()).resolves.toEqual(save)
  })
})
