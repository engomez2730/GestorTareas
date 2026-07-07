import { useMemo, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useProjects } from '../../projects/hooks/useProjects'
import { TaskForm } from './TaskForm'
import { TaskLogForm } from './TaskLogForm'
import { useTasks } from '../hooks/useTasks'

export function TasksPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const { data: projects } = useProjects()
  const { data: tasks, isLoading, error } = useTasks()
  const [projectFilter, setProjectFilter] = useState('')

  const filteredTasks = useMemo(
    () => (tasks ?? []).filter((task) => !projectFilter || task.project_id === projectFilter),
    [tasks, projectFilter],
  )

  return (
    <div className={isAdmin ? 'grid grid-cols-1 gap-6 lg:grid-cols-2' : 'space-y-6'}>
      {isAdmin && <TaskForm />}

      <div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Tareas</h2>
          <select
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="">Todos los proyectos</option>
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {isLoading && <p className="text-slate-500">Cargando tareas...</p>}
        {error && <p className="text-red-600">Error al cargar tareas.</p>}

        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div key={task.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400">{task.projects?.name ?? '—'}</p>
                  <p className="text-sm font-medium text-slate-900">{task.description}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Tiempo original: <span className="font-medium">{task.original_time}</span>
                  </p>
                </div>
                <TaskLogForm taskId={task.id} />
              </div>
            </div>
          ))}
          {filteredTasks.length === 0 && !isLoading && (
            <p className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-slate-400">
              No hay tareas disponibles.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
