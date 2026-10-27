import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  throw new Error(
    `Missing or invalid environment variables. Copy web/.env.example to web/.env.local.\n${z.prettifyError(parsed.error)}`,
  )
}

export const env = parsed.data
