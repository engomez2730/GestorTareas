import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabaseClient'
import { useAuth } from '../../../context/AuthContext'
import type { TaskLogFormValues } from '../schemas'

/** Regular users register worked time here; user_id always comes from the session. */
export function useCreateTaskLog() {
  const queryClient = useQueryClient()
  const { session } = useAuth()

  return useMutation({
    mutationFn: async (values: TaskLogFormValues) => {
      if (!session?.user.id) throw new Error('No hay sesión activa')
      const { error } = await supabase.from('task_logs').insert({
        task_id: values.task_id,
        worked_time: values.worked_time,
        user_id: session.user.id,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task-report'] }),
  })
}
