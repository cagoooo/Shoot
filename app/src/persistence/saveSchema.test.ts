import { describe, expect, it } from 'vitest'
import { createEmptySave, migrateSave } from './saveSchema'

describe('saveSchema', () => {
  it('建立版本一存檔且不含姓名或電子郵件', () => {
    const save = createEmptySave()
    const serialized = JSON.stringify(save)

    expect(save.version).toBe(1)
    expect(serialized).not.toMatch(/studentName|email/i)
  })

  it('保留有效的版本一資料', () => {
    const save = createEmptySave()
    save.completedMissions.push('recycling-storm')

    expect(migrateSave(save)).toEqual(save)
  })

  it('損壞或未知版本回到安全預設值', () => {
    expect(migrateSave({ version: 99 })).toEqual(createEmptySave())
    expect(migrateSave('broken')).toEqual(createEmptySave())
  })
})
