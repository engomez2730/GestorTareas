import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Project } from '../../../types/database'
import { projectSchema, type ProjectFormInput, type ProjectFormValues } from '../schemas'

interface ProjectFormProps {
  initialValues?: Project
  onSubmit: (values: ProjectFormValues) => Promise<void>
  onCancel: () => void
}

function toDefaultValues(project?: Project): Partial<ProjectFormInput> {
  if (!project) return { project_type: 'Por Hora' }
  return {
    name: project.name,
    start_date: project.start_date,
    end_date: project.end_date ?? '',
    price_without_tax: project.price_without_tax,
    price_with_tax: project.price_with_tax,
    project_type: project.project_type,
    min_hours: project.min_hours ?? '',
    max_hours: project.max_hours ?? '',
  }
}

export function ProjectForm({ initialValues, onSubmit, onCancel }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormInput, unknown, ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: toDefaultValues(initialValues),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Nombre</label>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register('name')}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Fecha inicio</label>
          <input
            type="date"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register('start_date')}
          />
          {errors.start_date && (
            <p className="mt-1 text-xs text-red-600">{errors.start_date.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Fecha fin</label>
          <input
            type="date"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register('end_date')}
          />
          {errors.end_date && (
            <p className="mt-1 text-xs text-red-600">{errors.end_date.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Precio sin IVA</label>
          <input
            type="number"
            step="0.01"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register('price_without_tax')}
          />
          {errors.price_without_tax && (
            <p className="mt-1 text-xs text-red-600">{errors.price_without_tax.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Precio con IVA</label>
          <input
            type="number"
            step="0.01"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register('price_with_tax')}
          />
          {errors.price_with_tax && (
            <p className="mt-1 text-xs text-red-600">{errors.price_with_tax.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Tipo de proyecto</label>
        <select
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register('project_type')}
        >
          <option value="Por Hora">Por Hora</option>
          <option value="Por Tareas">Por Tareas</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Horas mínimas</label>
          <input
            type="number"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register('min_hours')}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Horas máximas</label>
          <input
            type="number"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register('max_hours')}
          />
          {errors.max_hours && (
            <p className="mt-1 text-xs text-red-600">{errors.max_hours.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
