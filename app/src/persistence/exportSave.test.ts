import { describe, expect, it } from 'vitest'
import { deserializeSave, serializeSave } from './exportSave'
import { createEmptySave } from './saveSchema'

describe('save export', () => {
  it('匯出後可載入相同進度', () => {
    const save = createEmptySave()
    save.reflections.push({
      missionId: 'recycling-storm',
      choice: '我想更省電',
      createdAt: '2026-07-10T01:00:00.000Z',
    })

    expect(deserializeSave(serializeSave(save))).toEqual(save)
  })

  it('拒絕不是 JSON 的匯入內容', () => {
    expect(() => deserializeSave('not-json')).toThrow('save_import_invalid')
  })

  it('拒絕未知版本的匯入內容', () => {
    expect(() => deserializeSave('{"version":99}')).toThrow(
      'save_import_invalid',
    )
  })
})
