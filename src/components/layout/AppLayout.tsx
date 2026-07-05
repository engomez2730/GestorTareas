import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`

export function AppLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const isAdmin = profile?.role === 'admin'

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={linkClasses}>
              Reportes
            </NavLink>
            <NavLink to="/projects" className={linkClasses}>
              Proyectos
            </NavLink>
            <NavLink to="/tasks" className={linkClasses}>
              Tareas
            </NavLink>
            <NavLink to="/payments" className={linkClasses}>
              Pagos
            </NavLink>
            {isAdmin && (
              <NavLink to="/users" className={linkClasses}>
                Usuarios
              </NavLink>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {profile?.username} {isAdmin && <span className="text-slate-400">(admin)</span>}
            </span>
            <button
              onClick={handleSignOut}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
