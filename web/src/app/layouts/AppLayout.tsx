import { useState } from 'react'
import { Outlet } from 'react-router'

import { PlusIcon } from '@/components/ui'
import { QuickAddSheet } from '@/features/activity'

import { TabBar } from './TabBar'

export function AppLayout() {
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-5 pt-[max(20px,env(safe-area-inset-top))] pb-40">
      <Outlet />
      <button
        type="button"
        aria-label="Add transaction"
        onClick={() => setQuickAddOpen(true)}
        className="bg-accent text-on-accent focus-visible:outline-accent fixed right-[max(20px,calc((100vw-32rem)/2+20px))] bottom-[calc(84px+env(safe-area-inset-bottom))] z-10 grid size-[52px] place-items-center rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 active:opacity-80"
      >
        <PlusIcon className="size-6" />
      </button>
      <TabBar />
      <QuickAddSheet open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  )
}
