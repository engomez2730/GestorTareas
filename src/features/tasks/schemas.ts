import { z } from 'zod'

export const taskSchema = z.object({
  id: z.string().min(1, 'Requerido'),
  project_id: z.string().uuid('Selecciona un proyecto'),
  description: z.string().min(3, 'Mínimo 3 caracteres'),
  time_spent: z.coerce.number().positive('Debe ser mayor a 0'),
})

export type TaskFormInput = z.input<typeof taskSchema>
export type TaskFormValues = z.output<typeof taskSchema>
