import { z } from 'zod'
import { TIME_REGEX } from '../../lib/time'

const timeField = (label: string) =>
  z
    .string()
    .regex(TIME_REGEX, 'Formato HH:MM inválido')
    .refine((value) => value !== '00:00', `${label} debe ser mayor a 00:00`)

/** Admin-only: creates a task with its estimated/original time. */
export const taskSchema = z.object({
  project_id: z.string().uuid('Selecciona un proyecto'),
  description: z.string().min(3, 'Mínimo 3 caracteres'),
  original_time: timeField('El tiempo original'),
})

export type TaskFormInput = z.input<typeof taskSchema>
export type TaskFormValues = z.output<typeof taskSchema>

/** User-facing: logs time worked on an existing task. */
export const taskLogSchema = z.object({
  task_id: z.string().uuid(),
  worked_time: timeField('El tiempo trabajado'),
})

export type TaskLogFormInput = z.input<typeof taskLogSchema>
export type TaskLogFormValues = z.output<typeof taskLogSchema>
