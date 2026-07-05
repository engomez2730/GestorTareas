import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.',
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

/**
 * Supabase Auth is email-based. The app exposes a username-only UX, so we
 * derive a stable, non-guessable email from the username under a fixed
 * fake domain. The real username lives in `profiles.username`.
 */
export const FAKE_EMAIL_DOMAIN = 'projectmanager.local'

export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${FAKE_EMAIL_DOMAIN}`
}
