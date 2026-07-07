export type UserRole = 'admin' | 'user'
export type ProjectType = 'Por Hora' | 'Por Tareas'
export type PaymentStatus = 'pending' | 'confirmed'

// These use `type` rather than `interface`: interfaces don't get an implicit
// index signature, which makes them fail the `Record<string, unknown>`
// structural check supabase-js uses internally and silently collapses every
// query's generic types to `never`.
export type Profile = {
  id: string
  username: string
  role: UserRole
  created_at: string
}

export type Project = {
  id: string
  name: string
  start_date: string
  end_date: string | null
  price_without_tax: number
  price_with_tax: number
  project_type: ProjectType
  min_hours: number | null
  max_hours: number | null
  created_at: string
}

export type Task = {
  id: string
  project_id: string
  description: string
  original_time: string
  created_at: string
}

export type TaskLog = {
  id: string
  task_id: string
  user_id: string
  worked_time: string
  created_at: string
}

export type Payment = {
  id: string
  user_id: string
  amount: number
  status: PaymentStatus
  confirmed_by: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & Pick<Profile, 'id' | 'username'>
        Update: Partial<Profile>
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at'> & { id?: string }
        Update: Partial<Omit<Project, 'id' | 'created_at'>>
        Relationships: []
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Task, 'id' | 'project_id' | 'created_at'>>
        Relationships: [
          {
            foreignKeyName: 'tasks_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      task_logs: {
        Row: TaskLog
        Insert: Omit<TaskLog, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<TaskLog, 'id' | 'task_id' | 'user_id' | 'created_at'>>
        Relationships: [
          {
            foreignKeyName: 'task_logs_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'task_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'created_at' | 'status' | 'confirmed_by'> & {
          id?: string
          status?: PaymentStatus
          confirmed_by?: string | null
        }
        Update: Partial<Omit<Payment, 'id' | 'created_at'>>
        Relationships: [
          {
            foreignKeyName: 'payments_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payments_confirmed_by_fkey'
            columns: ['confirmed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}
