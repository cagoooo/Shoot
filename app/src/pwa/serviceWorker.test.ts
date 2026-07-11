import { describe, expect, it } from 'vitest'
import { isStaleChunkError } from './serviceWorker'

describe('PWA 過期資源自救', () => {
  it('辨識 Vite 延遲載入的舊 chunk 錯誤', () => {
    expect(isStaleChunkError(new Error('Failed to fetch dynamically imported module'))).toBe(true)
    expect(isStaleChunkError(new Error('ChunkLoadError: Loading chunk failed'))).toBe(true)
  })

  it('不把一般錯誤誤判為需要重整', () => {
    expect(isStaleChunkError(new Error('network unavailable'))).toBe(false)
  })
})
