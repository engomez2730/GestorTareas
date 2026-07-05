import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabaseClient'

export interface ReportRow {
  project_id: string
  user_id: string
  time_spent: number
  projects: { name: string } | null
  profiles: { username: string } | null
}

/** Raw task rows (with project/user names) for the current scope — own tasks
 * for regular users, every task for admins, enforced by RLS. */
export function useTaskReport() {
  return useQuery({
    queryKey: ['task-report'],
    queryFn: async (): Promise<ReportRow[]> => {
      const { data, error } = await supabase
        .from('tasks')
        .select('project_id, user_id, time_spent, projects(name), profiles(username)')
      if (error) throw error
      return data as unknown as ReportRow[]
    },
  })
}

export interface GroupTotal {
  key: string
  label: string
  totalHours: number
  taskCount: number
}

export function groupBy(
  rows: ReportRow[],
  keyOf: (row: ReportRow) => string,
  labelOf: (row: ReportRow) => string,
): GroupTotal[] {
  const groups = new Map<string, GroupTotal>()
  for (const row of rows) {
    const key = keyOf(row)
    const existing = groups.get(key)
    if (existing) {
      existing.totalHours += Number(row.time_spent)
      existing.taskCount += 1
    } else {
      groups.set(key, { key, label: labelOf(row), totalHours: Number(row.time_spent), taskCount: 1 })
    }
  }
  return Array.from(groups.values()).sort((a, b) => b.totalHours - a.totalHours)
}
