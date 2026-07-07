import { useMemo, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useAllProfiles } from '../../users/hooks/useProfiles'
import { useProjects } from '../../projects/hooks/useProjects'
import { groupBy, groupByTask, useTaskReport, type ReportRow } from '../hooks/useTaskReport'
import { minutesToTime, timeToMinutes } from '../../../lib/time'

function SummaryTable({ title, rows }: { title: string; rows: ReturnType<typeof groupBy> }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-700">{title}</h3>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Registros</th>
              <th className="px-4 py-2">Tiempo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-slate-100">
                <td className="px-4 py-2 font-medium text-slate-900">{row.label}</td>
                <td className="px-4 py-2">{row.taskCount}</td>
                <td className="px-4 py-2">{row.totalTime}</td>
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

function TaskTable({ rows }: { rows: ReturnType<typeof groupByTask> }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-700">Tiempo por tarea</h3>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-2">Tarea</th>
              <th className="px-4 py-2">Proyecto</th>
              <th className="px-4 py-2">Tiempo original</th>
              <th className="px-4 py-2">Tiempo trabajado</th>
              <th className="px-4 py-2">Tiempo de pago</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-slate-100">
                <td className="px-4 py-2 font-medium text-slate-900">{row.taskLabel}</td>
                <td className="px-4 py-2">{row.projectLabel}</td>
                <td className="px-4 py-2">{row.originalTime}</td>
                <td className="px-4 py-2">{row.workedTime}</td>
                <td className="px-4 py-2 font-medium text-slate-900">{row.paymentTime}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
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

function DetailTable({ rows, isAdmin }: { rows: ReportRow[]; isAdmin: boolean }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-700">Registros de tiempo</h3>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              {isAdmin && <th className="px-4 py-2">Usuario</th>}
              <th className="px-4 py-2">Proyecto</th>
              <th className="px-4 py-2">Tarea</th>
              <th className="px-4 py-2">Tiempo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-4 py-2 text-slate-500">
                  {new Date(row.created_at).toLocaleString('es', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </td>
                {isAdmin && (
                  <td className="px-4 py-2 font-medium text-slate-900">
                    {row.profiles?.username ?? '—'}
                  </td>
                )}
                <td className="px-4 py-2">{row.tasks?.projects?.name ?? '—'}</td>
                <td className="px-4 py-2">{row.tasks?.description ?? '—'}</td>
                <td className="px-4 py-2">{row.worked_time}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="px-4 py-6 text-center text-slate-400">
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
  const { data: projects } = useProjects()
  const [projectFilter, setProjectFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')

  const userOptions = useMemo(
    () => (allProfiles ?? []).map((p) => ({ key: p.id, label: p.username })),
    [allProfiles],
  )

  const filteredRows = useMemo(
    () =>
      (rows ?? []).filter(
        (row) =>
          (!projectFilter || row.tasks?.project_id === projectFilter) &&
          (!userFilter || row.user_id === userFilter),
      ),
    [rows, projectFilter, userFilter],
  )

  const byUser = useMemo(
    () => groupBy(filteredRows, (r) => r.user_id, (r) => r.profiles?.username ?? '—'),
    [filteredRows],
  )
  const byProject = useMemo(
    () =>
      groupBy(
        filteredRows,
        (r) => r.tasks?.project_id ?? '—',
        (r) => r.tasks?.projects?.name ?? '—',
      ),
    [filteredRows],
  )

  const taskTotals = useMemo(() => groupByTask(filteredRows), [filteredRows])

  const totalMinutes = filteredRows.reduce((sum, r) => sum + timeToMinutes(r.worked_time), 0)
  const totalOriginalMinutes = taskTotals.reduce((sum, t) => sum + timeToMinutes(t.originalTime), 0)
  const totalPaymentMinutes = taskTotals.reduce((sum, t) => sum + t.paymentMinutes, 0)

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
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Tiempo original</p>
          <p className="text-2xl font-semibold text-slate-900">
            {minutesToTime(totalOriginalMinutes)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Tiempo trabajado</p>
          <p className="text-2xl font-semibold text-slate-900">{minutesToTime(totalMinutes)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Tiempo de pago</p>
          <p className="text-2xl font-semibold text-slate-900">
            {minutesToTime(totalPaymentMinutes)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Registros de tiempo</p>
          <p className="text-2xl font-semibold text-slate-900">{filteredRows.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Proyectos con actividad</p>
          <p className="text-2xl font-semibold text-slate-900">{byProject.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {isAdmin && <SummaryTable title="Tiempo por usuario" rows={byUser} />}
        <SummaryTable title="Tiempo por proyecto" rows={byProject} />
      </div>

      <TaskTable rows={taskTotals} />

      <DetailTable rows={filteredRows} isAdmin={isAdmin} />
    </div>
  )
}
