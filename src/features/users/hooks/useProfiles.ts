import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabaseClient'
import type { Profile, UserRole } from '../../../types/database'

const ALL_PROFILES_KEY = ['profiles', 'all'] as const

/** Admin-only: every profile, regardless of role (enforced by RLS). */
export function useAllProfiles(enabled = true) {
  return useQuery({
    queryKey: ALL_PROFILES_KEY,
    enabled,
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase.from('profiles').select('*').order('username')
      if (error) throw error
      return data
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALL_PROFILES_KEY })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
