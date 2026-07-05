import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabaseClient'
import type { Project } from '../../../types/database'
import type { ProjectFormValues } from '../schemas'

const PROJECTS_KEY = ['projects'] as const

export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

function toRow(values: ProjectFormValues) {
  return {
    name: values.name,
    start_date: values.start_date,
    end_date: values.end_date || null,
    price_without_tax: values.price_without_tax,
    price_with_tax: values.price_with_tax,
    project_type: values.project_type,
    min_hours: values.min_hours === '' || values.min_hours === undefined ? null : Number(values.min_hours),
    max_hours: values.max_hours === '' || values.max_hours === undefined ? null : Number(values.max_hours),
  }
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      const { error } = await supabase.from('projects').insert(toRow(values))
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROJECTS_KEY }),
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: ProjectFormValues }) => {
      const { error } = await supabase.from('projects').update(toRow(values)).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROJECTS_KEY }),
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROJECTS_KEY }),
  })
}
