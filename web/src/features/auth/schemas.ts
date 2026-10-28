import { z } from 'zod'

export const credentialsSchema = z.object({
  email: z.email('Enter a valid email.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
})
