interface AccessibilityAnnouncerProps {
  message: string
  assertive?: boolean
}

export function AccessibilityAnnouncer({
  message,
  assertive = false,
}: AccessibilityAnnouncerProps) {
  return (
    <div
      className="sr-only"
      role="status"
      aria-live={assertive ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      {message}
    </div>
  )
}
