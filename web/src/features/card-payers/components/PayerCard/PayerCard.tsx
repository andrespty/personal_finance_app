import { CreditCard, type CreditCardProps } from '@/features/accounts'

import { useCardSplit } from '../../hooks/useCardSplit'

/** A credit card showing how its balance splits between the accounts that pay it. */
export function PayerCard(props: Omit<CreditCardProps, 'split'>) {
  const split = useCardSplit(props.account.id)
  return <CreditCard {...props} split={split} />
}
