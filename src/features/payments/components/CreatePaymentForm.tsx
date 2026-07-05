import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUsers, useCreatePayment } from '../hooks/usePayments'

const schema = z.object({
  userId: z.string().uuid('Selecciona un usuario'),
  amount: z.coerce.number().positive('Debe ser mayor a 0'),
})

type FormInput = z.input<typeof schema>
type FormValues = z.output<typeof schema>

export function CreatePaymentForm() {
  const { data: users } = useUsers()
  const createPayment = useCreatePayment()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    await createPayment.mutateAsync({ userId: values.userId, amount: values.amount })
    reset()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-6"
    >
      <h2 className="text-lg font-semibold text-slate-900">Registrar pago</h2>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Usuario</label>
        <select
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          defaultValue=""
          {...register('userId')}
        >
          <option value="" disabled>
            Selecciona un usuario
          </option>
          {users?.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
        {errors.userId && <p className="mt-1 text-xs text-red-600">{errors.userId.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Monto</label>
        <input
          type="number"
          step="0.01"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register('amount')}
        />
        {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {isSubmitting ? 'Guardando...' : 'Registrar pago'}
      </button>
    </form>
  )
}
