import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabaseClient'
import type { Task } from '../../../types/database'
import type { TaskFormValues } from '../schemas'

export type TaskWithProject = Task & { projects: { name: string } | null }

const TASKS_KEY = ['tasks'] as const

/** Every task is readable by any authenticated user (enforced by RLS). */
export function useTasks() {
  return useQuery({
    queryKey: TASKS_KEY,
    queryFn: async (): Promise<TaskWithProject[]> => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, projects(name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as TaskWithProject[]
    },
  })
}

/** RLS rejects this insert unless the caller is an admin. */
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: TaskFormValues) => {
      const { error } = await supabase.from('tasks').insert({
        project_id: values.project_id,
        description: values.description,
        original_time: values.original_time,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}
