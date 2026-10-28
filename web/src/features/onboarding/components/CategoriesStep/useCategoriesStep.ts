import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { categoryKeys } from '@/features/categories'
import { errorMessage } from '@/lib/errors'

import { addCategories } from '../../api/onboarding.api'
import { starterCategories } from '../../data/starterCategories'
import {
  addChild,
  addParent,
  countSelected,
  fromStarter,
  rename,
  toggleChild,
  toggleParent,
  toPayload,
  type SelectionItem,
} from '../../utils/categorySelection'

export function useCategoriesStep({ onSaved }: { onSaved: () => Promise<void> }) {
  const queryClient = useQueryClient()
  const [items, setItems] = useState<SelectionItem[]>(() => fromStarter(starterCategories))
  const [focusKey, setFocusKey] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setError(null)
    setSaving(true)
    try {
      const payload = toPayload(items)
      if (payload.length > 0) await addCategories(payload)
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      await onSaved()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return {
    items,
    focusKey,
    selectedCount: countSelected(items),
    toggleParent: (key: string) => setItems((current) => toggleParent(current, key)),
    toggleChild: (parentKey: string, childKey: string) =>
      setItems((current) => toggleChild(current, parentKey, childKey)),
    rename: (key: string, name: string) => setItems((current) => rename(current, key, name)),
    addParent: () => {
      const result = addParent(items)
      setItems(result.items)
      setFocusKey(result.key)
    },
    addChild: (parentKey: string) => {
      const result = addChild(items, parentKey)
      setItems(result.items)
      setFocusKey(result.key)
    },
    save,
    saving,
    error,
  }
}
