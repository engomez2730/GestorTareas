import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Solo letras, números, punto, guion y guion bajo'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
