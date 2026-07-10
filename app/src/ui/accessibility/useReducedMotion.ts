import { useEffect, useState } from 'react'

const query = '(prefers-reduced-motion: reduce)'

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window === 'undefined' || !window.matchMedia
      ? false
      : window.matchMedia(query).matches,
  )

  useEffect(() => {
    if (!window.matchMedia) return
    const media = window.matchMedia(query)
    const update = (event: MediaQueryListEvent) => setReduced(event.matches)
    setReduced(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reduced
}
