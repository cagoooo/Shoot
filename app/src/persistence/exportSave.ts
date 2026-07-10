import { saveSchema, type SaveV1 } from './saveSchema'

export function serializeSave(save: SaveV1): string {
  return JSON.stringify(saveSchema.parse(save), null, 2)
}

export function deserializeSave(serialized: string): SaveV1 {
  try {
    return saveSchema.parse(JSON.parse(serialized))
  } catch {
    throw new Error('save_import_invalid')
  }
}
