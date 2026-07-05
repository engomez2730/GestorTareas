import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabaseClient'
import { useAuth } from '../../../context/AuthContext'
import type { Payment, Profile } from '../../../types/database'

export type PaymentWithUser = Payment & { profiles: { username: string } | null }

const PAYMENTS_KEY = ['payments'] as const
const USERS_KEY = ['users'] as const

/** Own payments for regular users; every payment (via RLS) for admins. */
export function usePayments() {
  return useQuery({
    queryKey: PAYMENTS_KEY,
    queryFn: async (): Promise<PaymentWithUser[]> => {
      const { data, error } = await supabase
        .from('payments')
        .select('*, profiles!payments_user_id_fkey(username)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as PaymentWithUser[]
    },
  })
}

/** Admin-only: list of regular users to create payments for. */
export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'user')
        .order('username')
      if (error) throw error
      return data
    },
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      const { error } = await supabase.from('payments').insert({
        user_id: userId,
        amount,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY }),
  })
}

export function useConfirmPayment() {
  const queryClient = useQueryClient()
  const { session } = useAuth()

  return useMutation({
    mutationFn: async (paymentId: string) => {
      if (!session?.user.id) throw new Error('No hay sesión activa')
      const { error } = await supabase
        .from('payments')
        .update({ status: 'confirmed', confirmed_by: session.user.id })
        .eq('id', paymentId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY }),
  })
}
