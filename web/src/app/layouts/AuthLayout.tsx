import { Outlet } from 'react-router'

export function AuthLayout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5 py-[max(32px,env(safe-area-inset-top))]">
      <Outlet />
    </div>
  )
}
