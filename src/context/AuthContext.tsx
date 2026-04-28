// AuthContext.tsx
import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types/usuario.types'
import type { Cliente } from '@/types/cliente.types'

interface AuthContextType {
  user: User | null
  clienteData: Cliente | null
  setClienteData: (data: Cliente | null) => void
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  loginCliente: (email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  actualizarUser: (datos: Partial<User>) => void
  isAdmin: boolean
  isVendedor: boolean
  isCliente: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [clienteData, setClienteData] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Evita que login() y onAuthStateChange corran cargarPerfil al mismo tiempo
  const isHandlingAuth = useRef(false)

  async function cargarPerfilUsuario(authId: string): Promise<boolean> {
    try {
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authId)
        .single()

      if (error || !usuario) {
        // No crear admin temporal — simplemente indicar que no es usuario staff
        return false
      }

      setUser({
        id: usuario.id,
        email: usuario.email,
        name: usuario.name,
        role: usuario.role,
        active: usuario.active,
        created_at: usuario.created_at,
        updated_at: usuario.updated_at,
      })
      setClienteData(null)
      return true
    } catch (err) {
      console.error('Error en cargarPerfilUsuario:', err)
      return false
    }
  }

  async function cargarPerfilCliente(email?: string | null): Promise<boolean> {
    if (!email) return false
    try {
      const { data: cliente, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !cliente) return false

      // Si el cliente no tiene auth_user_id, actualizarlo
      if (!cliente.auth_user_id) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('clientes')
            .update({ auth_user_id: user.id })
            .eq('id', cliente.id)
          cliente.auth_user_id = user.id
        }
      }

      setUser({
        id: cliente.id,
        email: cliente.email || '',
        name: cliente.nombre,
        role: 'cliente',
        active: cliente.activo ?? true,
        created_at: cliente.created_at,
        updated_at: cliente.updated_at,
      })
      setClienteData(cliente)
      return true
    } catch (err) {
      console.error('Error en cargarPerfilCliente:', err)
      return false
    }
  }

  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!isMounted) return

        if (session?.user) {
          // Intentar cargar como staff primero, luego como cliente
          const esStaff = await cargarPerfilUsuario(session.user.id)
          if (!esStaff) {
            await cargarPerfilCliente(session.user.email)
          }
        } else {
          setUser(null)
          setClienteData(null)
        }
      } catch (err) {
        console.error('Error en initAuth:', err)
        if (isMounted) {
          setUser(null)
          setClienteData(null)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      console.log('[onAuthStateChange] event:', event, 'isHandling:', isHandlingAuth.current)

      // Solo manejar cierre de sesión — todo lo demás lo maneja initAuth o login()
      if (event !== 'SIGNED_OUT') return
      if (!isMounted) return

      setUser(null)
      setClienteData(null)
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    isHandlingAuth.current = true // Bloquear onAuthStateChange

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError || !data.user) {
        setError('Credenciales incorrectas')
        return false
      }

      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (usuarioError || !usuario) {
        setError('No tienes permisos de administrador')
        await supabase.auth.signOut()
        return false
      }

      setUser({
        id: usuario.id,
        email: usuario.email,
        name: usuario.name,
        role: usuario.role,
        active: usuario.active,
        created_at: usuario.created_at,
        updated_at: usuario.updated_at,
      })
      setClienteData(null)
      return true
    } catch {
      setError('Error al iniciar sesión')
      return false
    } finally {
      isHandlingAuth.current = false // Liberar el bloqueo
      setLoading(false)
    }
  }

  const loginCliente = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    isHandlingAuth.current = true

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError || !data.user) {
        setError('Credenciales incorrectas')
        return false
      }

      const { data: cliente, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('email', data.user.email)
        .single()

      if (error || !cliente) {
        setError('Cliente no encontrado')
        await supabase.auth.signOut()
        return false
      }

      // Si el cliente no tiene auth_user_id, actualizarlo
      if (!cliente.auth_user_id) {
        await supabase
          .from('clientes')
          .update({ auth_user_id: data.user.id })
          .eq('id', cliente.id)
      }

      setUser({
        id: cliente.id,
        email: cliente.email || '',
        name: cliente.nombre,
        role: 'cliente',
        active: cliente.activo ?? true,
        created_at: cliente.created_at,
        updated_at: cliente.updated_at,
      })
      setClienteData(cliente)
      return true
    } catch {
      setError('Error al iniciar sesión')
      return false
    } finally {
      isHandlingAuth.current = false
      setLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setClienteData(null)
  }

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        console.error('Error con Google:', error.message)
      }
    } catch (err) {
      console.error('Error en loginWithGoogle:', err)
    }
  }

  const actualizarUser = (datos: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...datos } : null)
  }

  const value: AuthContextType = {
    user,
    clienteData,
    setClienteData,
    loading,
    error,
    login,
    loginCliente,
    loginWithGoogle,
    logout,
    actualizarUser,
    isAdmin: user?.role === 'admin',
    isVendedor: user?.role === 'vendedor',
    isCliente: user?.role === 'cliente',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}