import type { Tables } from '@/types/database'

export type Profile = Tables<'profiles'>

export type ProfileUpdate = Partial<
  Pick<Profile, 'display_name' | 'onboarding_step' | 'pinned_account_id'>
>
