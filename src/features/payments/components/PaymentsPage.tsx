import { useAuth } from '../../../context/AuthContext'
import { usePayments, useConfirmPayment } from '../hooks/usePayments'
import { CreatePaymentForm } from './CreatePaymentForm'

const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
}

const statusClasses: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
}

export function PaymentsPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const { data: payments, isLoading, error } = usePayments()
  const confirmPayment = useConfirmPayment()

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {isAdmin && <CreatePaymentForm />}

      <div className={isAdmin ? '' : 'lg:col-span-2'}>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {isAdmin ? 'Todos los pagos' : 'Mi historial de pagos'}
        </h2>
        {isLoading && <p className="text-slate-500">Cargando pagos...</p>}
        {error && <p className="text-red-600">Error al cargar pagos.</p>}

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {isAdmin && <th className="px-4 py-2">Usuario</th>}
                <th className="px-4 py-2">Monto</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Fecha</th>
                {isAdmin && <th className="px-4 py-2" />}
              </tr>
            </thead>
            <tbody>
              {payments?.map((payment) => (
                <tr key={payment.id} className="border-t border-slate-100">
                  {isAdmin && (
                    <td className="px-4 py-2 font-medium text-slate-900">
                      {payment.profiles?.username ?? '—'}
                    </td>
                  )}
                  <td className="px-4 py-2">${payment.amount.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses[payment.status]}`}
                    >
                      {statusLabel[payment.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-2 text-right">
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => confirmPayment.mutate(payment.id)}
                          className="text-emerald-600 hover:underline"
                        >
                          Confirmar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {payments?.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 5 : 3} className="px-4 py-6 text-center text-slate-400">
                    No hay pagos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
