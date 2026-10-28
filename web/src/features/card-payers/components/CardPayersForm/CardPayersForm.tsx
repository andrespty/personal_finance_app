import { Button, EmptyState, LoadingBlock, SelectField } from '@/components/ui'
import { useAccounts } from '@/features/accounts'
import { useCategories } from '@/features/categories'

import { usePayerSetup } from '../../api/cardPayers.queries'
import type { PayerSetup } from '../../types'

import { CategoryChips } from './CategoryChips'
import { useCardPayersForm } from './useCardPayersForm'

export type CardPayersFormProps = { cardId: string; onDone: () => void }

/** Waits for accounts, categories and the current setup before showing the form. */
export function CardPayersForm({ cardId, onDone }: CardPayersFormProps) {
  const accounts = useAccounts()
  const categories = useCategories()
  const setup = usePayerSetup(cardId)
  if (accounts.isPending || categories.isPending || setup.isPending) return <LoadingBlock />
  if (!accounts.data?.some((a) => a.type !== 'credit_card')) {
    return (
      <EmptyState title="Add a checking or savings account first" body="Cards are paid from one." />
    )
  }
  return <CardPayersFields setup={setup.data!} onDone={onDone} />
}

function CardPayersFields({ setup, onDone }: { setup: PayerSetup; onDone: () => void }) {
  const form = useCardPayersForm({ setup, onDone })
  const { data: categories = [] } = useCategories()
  const payerOptions = form.payers.map((p) => ({ value: p.id, label: p.name }))

  return (
    <div className="flex flex-col gap-6">
      <SelectField
        label="Pays for everything"
        value={form.defaultPayerId}
        onChange={form.setDefaultPayerId}
        options={[{ value: '', label: 'No one yet' }, ...payerOptions]}
        hint={
          form.rules.length > 0
            ? 'Everything not covered below.'
            : 'The account that usually pays this card.'
        }
      />

      {form.rules.map((rule) => (
        <section key={rule.key} className="border-border flex flex-col gap-3 border-t pt-5">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <SelectField
                label="Also pays from"
                value={rule.payerAccountId}
                onChange={(payerAccountId) => form.updateRule(rule.key, { payerAccountId })}
                options={payerOptions}
              />
            </div>
            <Button
              variant="ghost"
              className="text-negative"
              onClick={() => form.removeRule(rule.key)}
            >
              Remove
            </Button>
          </div>
          <p className="text-muted text-sm">
            Only for these categories. A parent covers its subcategories unless one has its own
            rule.
          </p>
          {categories.length === 0 ? (
            <p className="text-muted text-sm">Add categories in Settings to use this.</p>
          ) : (
            <CategoryChips
              categories={categories}
              selected={rule.categoryIds}
              onToggle={(id) => form.toggleCategory(rule.key, id)}
              claimedBy={(id) => form.claimedBy(rule.key, id)}
            />
          )}
        </section>
      ))}

      <Button variant="secondary" onClick={form.addRule}>
        {form.rules.length === 0 ? 'Split by category' : 'Add another account'}
      </Button>

      {form.error && (
        <p role="alert" className="text-negative text-sm">
          {form.error}
        </p>
      )}
      <Button size="lg" fullWidth onClick={form.onSubmit} disabled={form.saving}>
        Save
      </Button>
    </div>
  )
}
