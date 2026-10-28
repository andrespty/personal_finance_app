import type { ComponentType, SVGProps } from 'react'
import { NavLink } from 'react-router'

import { CardIcon, HomeIcon, ListIcon, SettingsIcon } from '@/components/ui'
import { cn } from '@/lib/cn'

const tabs: {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  end?: boolean
}[] = [
  { to: '/', label: 'Dashboard', icon: HomeIcon, end: true },
  { to: '/accounts', label: 'Accounts', icon: CardIcon },
  { to: '/activity', label: 'Activity', icon: ListIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export function TabBar() {
  return (
    <nav
      aria-label="Main"
      className="border-border bg-bg/95 fixed inset-x-0 bottom-0 z-10 border-t pb-[max(14px,env(safe-area-inset-bottom))] backdrop-blur-sm"
    >
      <ul className="mx-auto flex max-w-lg justify-around px-2 pt-2.5">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'focus-visible:outline-accent flex flex-col items-center gap-[3px] px-3 text-[10px] font-medium focus-visible:outline-2',
                  isActive ? 'text-fg' : 'text-muted',
                )
              }
            >
              <Icon className="size-[22px]" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
