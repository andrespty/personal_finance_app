import { useState } from 'react'

import { SegmentedControl, Sheet } from '@/components/ui'
import { TransactionForm } from '@/features/transactions'
import { TransferForm } from '@/features/transfers'

export type QuickAddMode = 'transaction' | 'transfer'

export type QuickAddSheetProps = {
  open: boolean
  onClose: () => void
  initialMode?: QuickAddMode
  defaultAccountId?: string
  /** For transfers: preselect the destination, e.g. the card being paid. */
  defaultToId?: string
}

export function QuickAddSheet({ open, onClose, ...rest }: QuickAddSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={rest.initialMode === 'transfer' ? 'Move money' : 'New transaction'}
    >
      <QuickAddBody onClose={onClose} {...rest} />
    </Sheet>
  )
}

function QuickAddBody({
  onClose,
  initialMode = 'transaction',
  defaultAccountId,
  defaultToId,
}: Omit<QuickAddSheetProps, 'open'>) {
  const [mode, setMode] = useState<QuickAddMode>(initialMode)
  return (
    <div className="flex flex-col gap-5">
      <SegmentedControl
        label="What to add"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'transaction', label: 'Transaction' },
          { value: 'transfer', label: 'Transfer or payment' },
        ]}
      />
      {mode === 'transaction' ? (
        <TransactionForm defaultAccountId={defaultAccountId} onDone={onClose} />
      ) : (
        <TransferForm
          defaultFromId={defaultToId ? undefined : defaultAccountId}
          defaultToId={defaultToId}
          onDone={onClose}
        />
      )}
    </div>
  )
}
