import { Outlet } from 'react-router'

export function AppLayout() {
  return (
    <div className="mx-auto min-h-dvh max-w-lg px-5 pt-[max(20px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))]">
      <Outlet />
    </div>
  )
}
