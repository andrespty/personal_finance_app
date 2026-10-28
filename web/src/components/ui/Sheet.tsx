import { useEffect, useRef, type ReactNode } from 'react'

export type SheetProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * Bottom sheet built on <dialog>. Children mount only while open, so forms
 * inside start fresh each time.
 */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="sheet bg-bg text-fg fixed inset-x-0 top-auto bottom-0 m-0 mx-auto max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] p-0 backdrop:bg-black/40"
    >
      {open && (
        <div className="flex flex-col gap-5 px-5 pt-3 pb-[max(24px,env(safe-area-inset-bottom))]">
          <div className="bg-border mx-auto h-[5px] w-9 rounded-full" aria-hidden="true" />
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              onClick={onClose}
              className="text-muted focus-visible:outline-accent absolute left-0 text-[15px] focus-visible:outline-2"
            >
              Cancel
            </button>
            <h2 className="text-[15px] font-semibold">{title}</h2>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}
