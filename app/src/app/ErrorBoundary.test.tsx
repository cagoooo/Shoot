import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'
import { createSafeErrorLog } from './safeErrorLog'

function BrokenScreen(): never {
  throw new Error('學生 student@example.com 的存檔 token=abc123')
}

describe('ErrorBoundary', () => {
  it('提供重新載入、回基地與匿名錯誤紀錄', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const onReload = vi.fn()
    const onHome = vi.fn()
    const onExportLog = vi.fn()
    render(
      <ErrorBoundary
        onReload={onReload}
        onHome={onHome}
        onExportLog={onExportLog}
      >
        <BrokenScreen />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('任務暫時停住了')
    expect(screen.queryByText(/student@example|abc123|stack/i)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '重新載入目前階段' }))
    fireEvent.click(screen.getByRole('button', { name: '回基地' }))
    fireEvent.click(screen.getByRole('button', { name: '匯出匿名錯誤紀錄' }))

    expect(onReload).toHaveBeenCalledOnce()
    expect(onHome).toHaveBeenCalledOnce()
    expect(onExportLog).toHaveBeenCalledWith(
      expect.not.stringMatching(/student@example|abc123|token|stack/i),
    )
  })

  it('安全錯誤紀錄只包含階段、版本與通用錯誤代碼', () => {
    const log = createSafeErrorLog(new Error('ipad@mail2.smes.tyc.edu.tw'), {
      phase: 'sorting-hall',
      version: '0.1.0',
    })

    expect(log).toMatchObject({
      errorCode: 'unexpected-game-error',
      phase: 'sorting-hall',
      version: '0.1.0',
    })
    expect(JSON.stringify(log)).not.toContain('@')
  })
})
