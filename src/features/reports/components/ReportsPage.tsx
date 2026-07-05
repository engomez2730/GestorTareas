import { useMemo, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useAllProfiles } from '../../users/hooks/useProfiles'
import { groupBy, useTaskReport } from '../hooks/useTaskReport'

function SummaryTable({ title, rows }: { title: string; rows: ReturnType<typeof groupBy> }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-700">{title}</h3>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Tareas</th>
              <th className="px-4 py-2">Horas</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-slate-100">
                <td className="px-4 py-2 font-medium text-slate-900">{row.label}</td>
                <td className="px-4 py-2">{row.taskCount}</td>
                <td className="px-4 py-2">{row.totalHours.toFixed(2)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                  Sin datos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ReportsPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const { data: rows, isLoading, error } = useTaskReport()
  const { data: allProfiles } = useAllProfiles(isAdmin)
  const [projectFilter, setProjectFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')

  const projectOptions = useMemo(
    () => groupBy(rows ?? [], (r) => r.project_id, (r) => r.projects?.name ?? '—'),
    [rows],
  )
  const userOptions = useMemo(
    () => (allProfiles ?? []).map((p) => ({ key: p.id, label: p.username })),
    [allProfiles],
  )

  const filteredRows = useMemo(
    () =>
      (rows ?? []).filter(
        (row) =>
          (!projectFilter || row.project_id === projectFilter) &&
          (!userFilter || row.user_id === userFilter),
      ),
    [rows, projectFilter, userFilter],
  )

  const byUser = useMemo(
    () => groupBy(filteredRows, (r) => r.user_id, (r) => r.profiles?.username ?? '—'),
    [filteredRows],
  )
  const byProject = useMemo(
    () => groupBy(filteredRows, (r) => r.project_id, (r) => r.projects?.name ?? '—'),
    [filteredRows],
  )

  const totalHours = filteredRows.reduce((sum, r) => sum + Number(r.time_spent), 0)

  if (isLoading) return <p className="text-slate-500">Cargando reporte...</p>
  if (error) return <p className="text-red-600">Error al cargar el reporte.</p>

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Reportes</h1>

      <div className="flex flex-wrap gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Proyecto</label>
          <select
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="">Todos</option>
            {projectOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {isAdmin && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Usuario</label>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            >
              <option value="">Todos</option>
              {userOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Total de horas</p>
          <p className="text-2xl font-semibold text-slate-900">{totalHours.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Tareas registradas</p>
          <p className="text-2xl font-semibold text-slate-900">{filteredRows.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Proyectos con actividad</p>
          <p className="text-2xl font-semibold text-slate-900">{byProject.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {isAdmin && <SummaryTable title="Horas por usuario" rows={byUser} />}
        <SummaryTable title="Horas por proyecto" rows={byProject} />
      </div>
    </div>
  )
}
