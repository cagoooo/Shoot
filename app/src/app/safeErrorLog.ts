interface ErrorContext {
  phase: string
  version: string
}

export interface SafeErrorLog extends ErrorContext {
  errorCode: 'unexpected-game-error'
  timestamp: string
}

export function createSafeErrorLog(_error: unknown, context: ErrorContext): SafeErrorLog {
  return {
    errorCode: 'unexpected-game-error',
    phase: context.phase,
    version: context.version,
    timestamp: new Date().toISOString(),
  }
}
