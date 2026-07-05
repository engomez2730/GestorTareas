import { z } from 'zod'

export const projectSchema = z
  .object({
    name: z.string().min(2, 'Mínimo 2 caracteres'),
    start_date: z.string().min(1, 'Requerido'),
    end_date: z.string().optional().or(z.literal('')),
    price_without_tax: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
    price_with_tax: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
    project_type: z.enum(['Por Hora', 'Por Tareas']),
    min_hours: z.coerce.number().int().min(0).optional().or(z.literal('')),
    max_hours: z.coerce.number().int().min(0).optional().or(z.literal('')),
  })
  .refine(
    (data) => !data.end_date || data.end_date >= data.start_date,
    { message: 'La fecha fin no puede ser anterior a la fecha inicio', path: ['end_date'] },
  )
  .refine(
    (data) =>
      data.min_hours === '' ||
      data.max_hours === '' ||
      data.min_hours === undefined ||
      data.max_hours === undefined ||
      Number(data.max_hours) >= Number(data.min_hours),
    { message: 'Las horas máximas deben ser mayores o iguales a las mínimas', path: ['max_hours'] },
  )

export type ProjectFormInput = z.input<typeof projectSchema>
export type ProjectFormValues = z.output<typeof projectSchema>
