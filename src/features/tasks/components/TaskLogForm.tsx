import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TimeInput } from '../../../components/ui/TimeInput'
import { taskLogSchema, type TaskLogFormInput, type TaskLogFormValues } from '../schemas'
import { useCreateTaskLog } from '../hooks/useTaskLogs'

/** "Take" a task and register the time actually worked on it. */
export function TaskLogForm({ taskId }: { taskId: string }) {
  const [open, setOpen] = useState(false)
  const createTaskLog = useCreateTaskLog()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskLogFormInput, unknown, TaskLogFormValues>({
    resolver: zodResolver(taskLogSchema),
    defaultValues: { task_id: taskId, worked_time: '' },
  })

  async function onSubmit(values: TaskLogFormValues) {
    await createTaskLog.mutateAsync(values)
    reset({ task_id: taskId, worked_time: '' })
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
      >
        Registrar tiempo trabajado
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex shrink-0 items-start gap-2">
      <input type="hidden" {...register('task_id')} />
      <div>
        <TimeInput
          {...register('worked_time')}
          className="w-20 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
        {errors.worked_time && (
          <p className="mt-1 text-xs text-red-600">{errors.worked_time.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {isSubmitting ? 'Guardando...' : 'Guardar'}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="rounded-md px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700"
      >
        Cancelar
      </button>
    </form>
  )
}
