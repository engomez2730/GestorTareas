import { TaskForm } from './TaskForm'
import { useTasks } from '../hooks/useTasks'

export function TasksPage() {
  const { data: tasks, isLoading, error } = useTasks()

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <TaskForm />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Mis tareas</h2>
        {isLoading && <p className="text-slate-500">Cargando tareas...</p>}
        {error && <p className="text-red-600">Error al cargar tareas.</p>}

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Proyecto</th>
                <th className="px-4 py-2">Descripción</th>
                <th className="px-4 py-2">Horas</th>
              </tr>
            </thead>
            <tbody>
              {tasks?.map((task) => (
                <tr key={`${task.project_id}-${task.id}`} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-900">{task.id}</td>
                  <td className="px-4 py-2">{task.projects?.name ?? '—'}</td>
                  <td className="px-4 py-2">{task.description}</td>
                  <td className="px-4 py-2">{task.time_spent}</td>
                </tr>
              ))}
              {tasks?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    No hay tareas registradas.
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
