import { z } from 'zod'

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name.').max(40, 'Keep it under 40 characters.'),
  parentId: z.string().transform((v) => (v === '' ? null : v)),
})
