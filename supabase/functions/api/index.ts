import { createApp } from './app.ts'
import { createServiceDb } from './_shared/db.ts'

Deno.serve(createApp(createServiceDb()).fetch)
