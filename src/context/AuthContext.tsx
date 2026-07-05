import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, usernameToEmail } from '../lib/supabaseClient'
import type { Profile } from '../types/database'

interface AuthContextValue {
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<void>
  signUp: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession)
      },
    )

    return () => subscription.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const userId = session?.user.id
    if (!userId) {
      setProfile(null)
      return
    }

    let cancelled = false
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (!cancelled) setProfile(data)
      })

    return () => {
      cancelled = true
    }
  }, [session?.user.id])

  async function signIn(username: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    })
    if (error) throw error
  }

  async function signUp(username: string, password: string) {
    const { error } = await supabase.auth.signUp({
      email: usernameToEmail(username),
      password,
      options: { data: { username, role: 'user' } },
    })
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{ session, profile, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
