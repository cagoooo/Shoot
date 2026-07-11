import { Component, type ErrorInfo, type ReactNode } from 'react'
import { createSafeErrorLog } from './safeErrorLog'

interface ErrorBoundaryProps {
  children: ReactNode
  onReload?: () => void
  onHome?: () => void
  onExportLog?: (log: string) => void
  phase?: string
  version?: string
}

interface ErrorBoundaryState {
  failed: boolean
  error?: unknown
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { failed: true, error }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // React 仍會在開發工具記錄錯誤；畫面與匯出紀錄不保留敏感內容。
  }

  private exportLog = (): void => {
    const log = JSON.stringify(
      createSafeErrorLog(this.state.error, {
        phase: this.props.phase ?? 'unknown',
        version: this.props.version ?? '0.1.0-vertical-slice',
      }),
      null,
      2,
    )
    if (this.props.onExportLog) {
      this.props.onExportLog(log)
      return
    }
    const url = URL.createObjectURL(new Blob([log], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'earth-guardian-error.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children
    return (
      <main className="placeholder-screen" role="alert">
        <h1>任務暫時停住了</h1>
        <p>別擔心，你可以重試這個階段，或先安全回到基地。</p>
        <div className="button-row">
          <button type="button" className="primary-button" onClick={this.props.onReload}>
            重新載入目前階段
          </button>
          <button type="button" onClick={this.props.onHome}>回基地</button>
          <button type="button" onClick={this.exportLog}>匯出匿名錯誤紀錄</button>
        </div>
      </main>
    )
  }
}
