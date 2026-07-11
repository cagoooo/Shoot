export type ApplyUpdate = () => void

const reloadFlag = 'earth-guardian-sw-reloaded'
const chunkReloadFlag = 'earth-guardian-chunk-reload-attempted'

export function isStaleChunkError(value: unknown): boolean {
  const message = value instanceof Error ? value.message : String(value ?? '')
  return /Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed/i.test(message)
}

export function registerServiceWorker(onUpdateReady: (apply: ApplyUpdate) => void): () => void {
  const isLocalPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  if (!import.meta.env.PROD || isLocalPreview || !('serviceWorker' in navigator)) return () => undefined

  let registration: ServiceWorkerRegistration | undefined
  let reloaded = false
  let refreshRequested = false
  const swUrl = `${import.meta.env.BASE_URL}sw.js`

  const applyUpdate = () => {
    if (registration?.waiting) {
      refreshRequested = true
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      return
    }
    window.location.reload()
  }

  const announce = (worker?: ServiceWorker | null) => {
    if (worker && navigator.serviceWorker.controller) onUpdateReady(applyUpdate)
  }

  const watchWorker = (worker: ServiceWorker) => {
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed') announce(worker)
    })
  }

  const checkForUpdate = () => {
    void registration?.update().catch(() => undefined)
  }

  navigator.serviceWorker.register(swUrl, {
    scope: import.meta.env.BASE_URL,
    updateViaCache: 'none',
  }).then((nextRegistration) => {
    registration = nextRegistration
    announce(nextRegistration.waiting)
    if (nextRegistration.installing) watchWorker(nextRegistration.installing)
    nextRegistration.addEventListener('updatefound', () => {
      if (nextRegistration.installing) watchWorker(nextRegistration.installing)
    })
  }).catch(() => undefined)

  const onControllerChange = () => {
    // A first install also triggers controllerchange. Only reload after the
    // player explicitly accepts a waiting update.
    if (!refreshRequested || reloaded || sessionStorage.getItem(reloadFlag) === '1') return
    reloaded = true
    sessionStorage.setItem(reloadFlag, '1')
    window.location.reload()
  }
  navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

  const onVisible = () => {
    if (document.visibilityState === 'visible') checkForUpdate()
  }
  window.addEventListener('focus', checkForUpdate)
  window.addEventListener('online', checkForUpdate)
  window.addEventListener('pageshow', checkForUpdate)
  document.addEventListener('visibilitychange', onVisible)
  const poll = window.setInterval(checkForUpdate, 3 * 60 * 1000)

  const recoverStaleChunk = (value: unknown) => {
    if (!isStaleChunkError(value) || sessionStorage.getItem(chunkReloadFlag) === '1') return
    sessionStorage.setItem(chunkReloadFlag, '1')
    checkForUpdate()
    window.setTimeout(() => window.location.reload(), 250)
  }
  const onError = (event: ErrorEvent) => recoverStaleChunk(event.error ?? event.message)
  const onRejection = (event: PromiseRejectionEvent) => recoverStaleChunk(event.reason)
  window.addEventListener('error', onError, true)
  window.addEventListener('unhandledrejection', onRejection)

  return () => {
    window.clearInterval(poll)
    navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    window.removeEventListener('focus', checkForUpdate)
    window.removeEventListener('online', checkForUpdate)
    window.removeEventListener('pageshow', checkForUpdate)
    document.removeEventListener('visibilitychange', onVisible)
    window.removeEventListener('error', onError, true)
    window.removeEventListener('unhandledrejection', onRejection)
  }
}
