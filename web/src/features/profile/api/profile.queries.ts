import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/features/auth'

import type { Profile, ProfileUpdate } from '../types'

import { fetchProfile, updateProfile } from './profile.api'
import { profileKeys } from './profile.keys'

export function useProfile() {
  const { user } = useAuth()
  return useQuery({
    queryKey: profileKeys.byUser(user?.id ?? ''),
    queryFn: () => fetchProfile(user!.id),
    enabled: Boolean(user),
  })
}

export function useUpdateProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (update: ProfileUpdate) => updateProfile(user!.id, update),
    // Apply right away so redirects that read the profile see the new value.
    onSuccess: (_, update) => {
      if (!user) return
      queryClient.setQueryData<Profile>(profileKeys.byUser(user.id), (current) =>
        current ? { ...current, ...update } : current,
      )
    },
  })
}
