export type StarterCategory = { name: string; children: string[] }

/** Offered during guided setup. Nothing is created until the person picks. */
export const starterCategories: StarterCategory[] = [
  { name: 'Food', children: ['Groceries', 'Restaurants', 'Coffee'] },
  { name: 'Shopping', children: ['Clothing', 'Electronics', 'Home'] },
  { name: 'Transport', children: ['Gas', 'Rideshare', 'Parking'] },
  { name: 'Bills', children: ['Rent', 'Utilities', 'Phone', 'Internet', 'Subscriptions'] },
  { name: 'Entertainment', children: ['Gaming', 'Movies', 'Events'] },
  { name: 'Health', children: ['Pharmacy', 'Doctor', 'Fitness'] },
  { name: 'Travel', children: ['Flights', 'Hotels'] },
  { name: 'Income', children: ['Salary', 'Other Income'] },
  { name: 'Other', children: [] },
]
