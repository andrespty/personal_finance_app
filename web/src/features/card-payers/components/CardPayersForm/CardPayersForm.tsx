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
      {form.rules.map((rule) => (
        <section key={rule.key} className="flex flex-col gap-3">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <SelectField
                label="Pays for these categories"
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
            Tap a category to include all of it, or pick only some subcategories.
          </p>
          {categories.length === 0 ? (
            <p className="text-muted text-sm">Add categories in Settings to use this.</p>
          ) : (
            <CategoryChips
              categories={categories}
              picked={rule.categoryIds}
              onChange={(ids) => form.setRuleCategories(rule.key, ids)}
              claimedBy={(id) => form.claimedBy(rule.key, id)}
            />
          )}
        </section>
      ))}

      <Button variant="secondary" onClick={form.addRule}>
        {form.rules.length === 0
          ? 'Split some categories to another account'
          : 'Add another account'}
      </Button>

      <SelectField
        label={form.rules.length > 0 ? 'Everything else is paid by' : 'Paid by'}
        value={form.defaultPayerId}
        onChange={form.setDefaultPayerId}
        placeholder="Choose an account"
        options={payerOptions}
        hint={
          form.rules.length > 0
            ? 'Covers every category not picked above.'
            : 'The account that pays this card.'
        }
      />

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
