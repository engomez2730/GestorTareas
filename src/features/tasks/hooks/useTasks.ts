import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabaseClient'
import { useAuth } from '../../../context/AuthContext'
import type { Task } from '../../../types/database'
import type { TaskFormValues } from '../schemas'

export type TaskWithProject = Task & { projects: { name: string } | null }

const TASKS_KEY = ['tasks'] as const

/** Own tasks for regular users; every task (via RLS) for admins. */
export function useTasks() {
  return useQuery({
    queryKey: TASKS_KEY,
    queryFn: async (): Promise<TaskWithProject[]> => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, projects(name)')
        .order('registration_date', { ascending: false })
      if (error) throw error
      return data as unknown as TaskWithProject[]
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  const { session } = useAuth()

  return useMutation({
    mutationFn: async (values: TaskFormValues) => {
      if (!session?.user.id) throw new Error('No hay sesión activa')
      const { error } = await supabase.from('tasks').insert({
        id: values.id,
        project_id: values.project_id,
        description: values.description,
        time_spent: values.time_spent,
        user_id: session.user.id, // taken from the session, never from the form
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}
