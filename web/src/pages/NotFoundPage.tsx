import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <main className="flex flex-col gap-2">
      <h1 className="text-[28px] font-semibold tracking-tight">Page not found</h1>
      <Link to="/" className="text-accent font-medium">
        Go to Dashboard
      </Link>
    </main>
  )
}
