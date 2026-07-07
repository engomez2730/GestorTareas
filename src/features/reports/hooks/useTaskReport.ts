import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabaseClient'
import { minutesToTime, timeToMinutes } from '../../../lib/time'

export interface ReportRow {
  id: string
  task_id: string
  user_id: string
  worked_time: string
  created_at: string
  profiles: { username: string } | null
  tasks: {
    project_id: string
    description: string
    original_time: string
    projects: { name: string } | null
  } | null
}

/** Raw task_log rows (with project/user names) for the current scope — own
 * logs for regular users, every log for admins, enforced by RLS. */
export function useTaskReport() {
  return useQuery({
    queryKey: ['task-report'],
    queryFn: async (): Promise<ReportRow[]> => {
      const { data, error } = await supabase
        .from('task_logs')
        .select(
          'id, task_id, user_id, worked_time, created_at, profiles(username), tasks(project_id, description, original_time, projects(name))',
        )
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as ReportRow[]
    },
  })
}

export interface GroupTotal {
  key: string
  label: string
  totalTime: string
  taskCount: number
}

export function groupBy(
  rows: ReportRow[],
  keyOf: (row: ReportRow) => string,
  labelOf: (row: ReportRow) => string,
): GroupTotal[] {
  const totals = new Map<string, { label: string; minutes: number; count: number }>()
  for (const row of rows) {
    const key = keyOf(row)
    const minutes = timeToMinutes(row.worked_time)
    const existing = totals.get(key)
    if (existing) {
      existing.minutes += minutes
      existing.count += 1
    } else {
      totals.set(key, { label: labelOf(row), minutes, count: 1 })
    }
  }
  return Array.from(totals.entries())
    .map(([key, { label, minutes, count }]) => ({
      key,
      label,
      totalTime: minutesToTime(minutes),
      taskCount: count,
    }))
    .sort((a, b) => timeToMinutes(b.totalTime) - timeToMinutes(a.totalTime))
}

export interface TaskTotal {
  key: string
  taskLabel: string
  projectLabel: string
  originalTime: string
  workedTime: string
  paymentTime: string
  paymentMinutes: number
}

/** One row per task: original estimate vs. time actually logged against it (by
 * everyone in scope), and the resulting payment time — capped at the original
 * estimate, since overruns aren't billed beyond what was quoted. */
export function groupByTask(rows: ReportRow[]): TaskTotal[] {
  const totals = new Map<
    string,
    { taskLabel: string; projectLabel: string; originalMinutes: number; workedMinutes: number }
  >()
  for (const row of rows) {
    const key = row.task_id
    const workedMinutes = timeToMinutes(row.worked_time)
    const existing = totals.get(key)
    if (existing) {
      existing.workedMinutes += workedMinutes
    } else {
      totals.set(key, {
        taskLabel: row.tasks?.description ?? '—',
        projectLabel: row.tasks?.projects?.name ?? '—',
        originalMinutes: timeToMinutes(row.tasks?.original_time ?? '00:00'),
        workedMinutes,
      })
    }
  }
  return Array.from(totals.entries())
    .map(([key, { taskLabel, projectLabel, originalMinutes, workedMinutes }]) => {
      const paymentMinutes = Math.min(originalMinutes, workedMinutes)
      return {
        key,
        taskLabel,
        projectLabel,
        originalTime: minutesToTime(originalMinutes),
        workedTime: minutesToTime(workedMinutes),
        paymentTime: minutesToTime(paymentMinutes),
        paymentMinutes,
      }
    })
    .sort((a, b) => a.taskLabel.localeCompare(b.taskLabel))
}
