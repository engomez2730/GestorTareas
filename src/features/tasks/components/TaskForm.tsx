import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useProjects } from '../../projects/hooks/useProjects'
import { TimeInput } from '../../../components/ui/TimeInput'
import { taskSchema, type TaskFormInput, type TaskFormValues } from '../schemas'
import { useCreateTask } from '../hooks/useTasks'

/** Admin-only: creating a task also fixes its estimated/original time. */
export function TaskForm() {
  const { data: projects } = useProjects()
  const createTask = useCreateTask()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormInput, unknown, TaskFormValues>({ resolver: zodResolver(taskSchema) })

  async function onSubmit(values: TaskFormValues) {
    await createTask.mutateAsync(values)
    reset()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-6"
    >
      <h2 className="text-lg font-semibold text-slate-900">Crear tarea</h2>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Proyecto</label>
        <select
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          defaultValue=""
          {...register('project_id')}
        >
          <option value="" disabled>
            Selecciona un proyecto
          </option>
          {projects?.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {errors.project_id && (
          <p className="mt-1 text-xs text-red-600">{errors.project_id.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Descripción</label>
        <textarea
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Tiempo original (HH:MM)
        </label>
        <TimeInput {...register('original_time')} />
        {errors.original_time && (
          <p className="mt-1 text-xs text-red-600">{errors.original_time.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {isSubmitting ? 'Creando...' : 'Crear tarea'}
      </button>
    </form>
  )
}
