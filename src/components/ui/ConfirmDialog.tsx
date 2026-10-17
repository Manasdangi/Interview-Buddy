import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../utils/cn'
import { Button } from './Button'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Modal confirmation built on <dialog>, which provides focus trapping and Escape handling.
 * Portaled to <body> so parent layout utilities (e.g. space-y margins) can't offset it.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-3xl border border-slate-800 bg-slate-950 p-0 text-slate-100 shadow-soft backdrop:bg-slate-950/70 backdrop:backdrop-blur-sm"
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div className="space-y-4 p-6">
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-white">
          {title}
        </h2>
        <div className="text-sm leading-6 text-slate-400">{description}</div>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel} autoFocus>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className={cn(tone === 'danger' && 'bg-rose-600 hover:bg-rose-500 focus-visible:ring-rose-400')}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>,
    document.body,
  )
}
