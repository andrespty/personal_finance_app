import { PageHeader } from '@/components/ui'
import { ActivityList } from '@/features/activity'

export function ActivityPage() {
  return (
    <main className="flex flex-col gap-2">
      <PageHeader title="Activity" />
      <ActivityList limit={200} groupByDay emptyText="Tap + to add your first transaction." />
    </main>
  )
}
