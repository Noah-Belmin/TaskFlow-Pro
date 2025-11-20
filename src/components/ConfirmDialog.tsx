import { Button } from './ui/button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={onCancel}
      >
        {/* Dialog */}
        <div
          className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              {variant === 'destructive' && (
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              )}
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-slate-600 dark:text-slate-400">{message}</p>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button variant={variant} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
