import { useState } from 'react'

import { Button } from '@/components/ui'
import { formatDay } from '@/lib/dates'
import { errorMessage } from '@/lib/errors'

import { useDeleteTransfer } from '../../api/transfers.queries'

export type TransferDetailsProps = {
  transferId: string
  title: string
  amount: string
  date: string
  note: string | null
  onDone: () => void
}

/** Transfers and payments can't be edited, only removed and re-entered. */
export function TransferDetails({
  transferId,
  title,
  amount,
  date,
  note,
  onDone,
}: TransferDetailsProps) {
  const remove = useDeleteTransfer()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onDelete() {
    if (!confirming) {
      setConfirming(true)
      return
    }
    try {
      await remove.mutateAsync(transferId)
      onDone()
    } catch (e) {
      setConfirming(false)
      setError(errorMessage(e))
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="num text-[40px] leading-none font-semibold tracking-[-0.04em]">{amount}</p>
        <p className="mt-3 text-[15px] font-medium">{title}</p>
        <p className="text-muted mt-1 text-sm">
          {[formatDay(date), note].filter(Boolean).join(' · ')}
        </p>
      </div>
      <p className="text-muted text-sm">
        To change it, delete it and enter it again. Deleting removes it from both accounts.
      </p>
      {error && (
        <p role="alert" className="text-negative text-sm">
          {error}
        </p>
      )}
      <Button
        variant="secondary"
        size="lg"
        fullWidth
        onClick={onDelete}
        disabled={remove.isPending}
        className="text-negative"
      >
        {confirming ? 'Tap again to delete' : 'Delete from both accounts'}
      </Button>
    </div>
  )
}
