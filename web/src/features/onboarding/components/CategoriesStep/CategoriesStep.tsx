import type { StepProps } from '../OnboardingFlow/stepProps'
import { StepLayout } from '../StepLayout/StepLayout'

import { CategoryChecklist } from './CategoryChecklist'
import { useCategoriesStep } from './useCategoriesStep'

export function CategoriesStep({ flow }: StepProps) {
  const step = useCategoriesStep({ onSaved: () => flow.complete() })
  const busy = step.saving || flow.saving

  return (
    <StepLayout
      index={flow.index}
      total={flow.total}
      title="Pick your categories"
      description="Untick what you don't need, tap a name to rename it, or add your own. You can change these later in Settings."
      primary={{
        label:
          step.selectedCount === 0
            ? 'Finish without categories'
            : `Add ${step.selectedCount} categories`,
        onClick: step.save,
        disabled: busy,
      }}
      error={step.error ?? flow.error}
    >
      <CategoryChecklist
        items={step.items}
        focusKey={step.focusKey}
        onToggleParent={step.toggleParent}
        onToggleChild={step.toggleChild}
        onRename={step.rename}
        onAddChild={step.addChild}
        onAddParent={step.addParent}
      />
    </StepLayout>
  )
}
