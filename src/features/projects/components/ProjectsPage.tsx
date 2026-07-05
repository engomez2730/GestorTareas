import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { Modal } from '../../../components/ui/Modal'
import type { Project } from '../../../types/database'
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from '../hooks/useProjects'
import { ProjectForm } from './ProjectForm'
import type { ProjectFormValues } from '../schemas'

export function ProjectsPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const { data: projects, isLoading, error } = useProjects()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()

  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  async function handleCreate(values: ProjectFormValues) {
    await createProject.mutateAsync(values)
    setIsCreating(false)
  }

  async function handleUpdate(values: ProjectFormValues) {
    if (!editingProject) return
    await updateProject.mutateAsync({ id: editingProject.id, values })
    setEditingProject(null)
  }

  async function handleDelete(project: Project) {
    if (!confirm(`¿Eliminar el proyecto "${project.name}"?`)) return
    await deleteProject.mutateAsync(project.id)
  }

  if (isLoading) return <p className="text-slate-500">Cargando proyectos...</p>
  if (error) return <p className="text-red-600">Error al cargar proyectos.</p>

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Proyectos</h1>
        {isAdmin && (
          <button
            onClick={() => setIsCreating(true)}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Nuevo proyecto
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Inicio</th>
              <th className="px-4 py-2">Fin</th>
              <th className="px-4 py-2">Precio con IVA</th>
              {isAdmin && <th className="px-4 py-2" />}
            </tr>
          </thead>
          <tbody>
            {projects?.map((project) => (
              <tr key={project.id} className="border-t border-slate-100">
                <td className="px-4 py-2 font-medium text-slate-900">{project.name}</td>
                <td className="px-4 py-2">{project.project_type}</td>
                <td className="px-4 py-2">{project.start_date}</td>
                <td className="px-4 py-2">{project.end_date ?? '—'}</td>
                <td className="px-4 py-2">${project.price_with_tax.toFixed(2)}</td>
                {isAdmin && (
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => setEditingProject(project)}
                      className="mr-3 text-slate-600 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(project)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {projects?.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="px-4 py-6 text-center text-slate-400">
                  No hay proyectos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isCreating && (
        <Modal title="Nuevo proyecto" onClose={() => setIsCreating(false)}>
          <ProjectForm onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />
        </Modal>
      )}

      {editingProject && (
        <Modal title="Editar proyecto" onClose={() => setEditingProject(null)}>
          <ProjectForm
            initialValues={editingProject}
            onSubmit={handleUpdate}
            onCancel={() => setEditingProject(null)}
          />
        </Modal>
      )}
    </div>
  )
}
