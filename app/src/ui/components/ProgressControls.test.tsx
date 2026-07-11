import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProgressControls } from './ProgressControls'

describe('ProgressControls', () => {
  it('可匯出並選擇 JSON 進度檔載入', async () => {
    const onExport = vi.fn()
    const onImport = vi.fn(async () => undefined)
    render(<ProgressControls onExport={onExport} onImport={onImport} />)

    fireEvent.click(screen.getByRole('button', { name: '匯出我的進度' }))
    expect(onExport).toHaveBeenCalledOnce()

    const file = new File(['{"version":1}'], 'progress.json', {
      type: 'application/json',
    })
    fireEvent.change(screen.getByLabelText('選擇進度檔'), {
      target: { files: [file] },
    })
    await waitFor(() => expect(onImport).toHaveBeenCalledWith('{"version":1}'))
  })

  it('無效進度檔會顯示白話提示', async () => {
    render(
      <ProgressControls
        onExport={vi.fn()}
        onImport={vi.fn(async () => { throw new Error('invalid') })}
      />,
    )
    const file = new File(['bad'], 'bad.json', { type: 'application/json' })
    fireEvent.change(screen.getByLabelText('選擇進度檔'), {
      target: { files: [file] },
    })

    await expect(screen.findByRole('alert')).resolves.toHaveTextContent(
      '這個進度檔無法讀取，原本的進度沒有改變。',
    )
  })
})
