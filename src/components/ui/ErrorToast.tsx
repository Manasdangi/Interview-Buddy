import { AlertCircle, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from './Button'

type ErrorToastProps = {
  message: string | null
}

export function ErrorToast({ message }: ErrorToastProps) {
  const [dismissedMessage, setDismissedMessage] = useState<string | null>(null)

  const visibleMessage = message && message !== dismissedMessage ? message : null

  if (!visibleMessage) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[min(420px,calc(100vw-2rem))] rounded-2xl border border-rose-500/40 bg-rose-950/95 p-4 text-rose-50 shadow-2xl backdrop-blur">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-200" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Could not start interview</p>
          <p className="mt-1 text-sm leading-6 text-rose-100">{visibleMessage}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-8 shrink-0 rounded-full p-0 text-rose-100 hover:bg-rose-900"
          onClick={() => setDismissedMessage(visibleMessage)}
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
