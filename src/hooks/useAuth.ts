import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

type UserRole = 'admin' | 'vendedor'

interface AuthState {
  user: (User & { role?: UserRole }) | null
  session: Session | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })

  const fetchUserProfile = useCallback(async (userId: string, session: Session) => {
    const { data: profile, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      setState({
        user: { ...session.user, role: 'vendedor' as UserRole },
        session,
        loading: false,
        error: null,
      })
    } else {
      setState({
        user: { ...session.user, role: profile.role },
        session,
        loading: false,
        error: null,
      })
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session)
      } else {
        setState({ user: null, session: null, loading: false, error: null })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session)
      } else {
        setState({ user: null, session: null, loading: false, error: null })
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUserProfile])

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }))
      return false
    }

    if (data.user) {
      await fetchUserProfile(data.user.id, data.session!)
    }

    return true
  }, [fetchUserProfile])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setState({ user: null, session: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    login,
    logout,
  }
}
