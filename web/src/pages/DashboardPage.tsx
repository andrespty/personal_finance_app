import { Button } from '@/components/ui'
import { formatCents } from '@/lib/money'

export function DashboardPage() {
  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-[28px] font-semibold tracking-tight">Dashboard</h1>
      <section>
        <p className="text-muted text-sm">Money left</p>
        <p className="num mt-1 text-5xl leading-none font-semibold tracking-[-0.045em]">
          {formatCents(0)}
        </p>
      </section>
      <Button size="lg" fullWidth>
        Add transaction
      </Button>
    </main>
  )
}
