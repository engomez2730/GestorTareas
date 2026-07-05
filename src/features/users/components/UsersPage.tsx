import { useAuth } from '../../../context/AuthContext'
import type { UserRole } from '../../../types/database'
import { useAllProfiles, useUpdateUserRole } from '../hooks/useProfiles'

export function UsersPage() {
  const { profile: currentProfile } = useAuth()
  const { data: profiles, isLoading, error } = useAllProfiles()
  const updateUserRole = useUpdateUserRole()

  if (isLoading) return <p className="text-slate-500">Cargando usuarios...</p>
  if (error) return <p className="text-red-600">Error al cargar usuarios.</p>

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Usuarios</h1>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-2">Usuario</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Creado</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map((user) => {
              const isSelf = user.id === currentProfile?.id
              return (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-900">{user.username}</td>
                  <td className="px-4 py-2">
                    <select
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      value={user.role}
                      disabled={isSelf || updateUserRole.isPending}
                      title={isSelf ? 'No puedes cambiar tu propio rol' : undefined}
                      onChange={(e) =>
                        updateUserRole.mutate({ id: user.id, role: e.target.value as UserRole })
                      }
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              )
            })}
            {profiles?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
