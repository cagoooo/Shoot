export function normalizeBasePath(value: string): string {
  const trimmed = value.replace(/^\/+|\/+$/g, '')
  return trimmed ? `/${trimmed}/` : '/'
}
