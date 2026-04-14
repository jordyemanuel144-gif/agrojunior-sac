import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { usuariosService } from '@/services/usuarios.service'
import type { User } from '@/types/usuario.types'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  actualizarUser: (datos: Partial<User>) => void
  isAdmin: boolean
  isVendedor: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'samjose_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
      } catch {}
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const usuario = await usuariosService.login(email, password)
      if (usuario) {
        setUser(usuario)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario))
        setLoading(false)
        return true
      } else {
        setError('Credenciales incorrectas')
        setLoading(false)
        return false
      }
    } catch {
      setError('Error al iniciar sesión')
      setLoading(false)
      return false
    }
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const actualizarUser = (datos: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null
      const actualizado = { ...prev, ...datos }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizado))
      return actualizado
    })
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    actualizarUser,
    isAdmin: user?.role === 'admin',
    isVendedor: user?.role === 'vendedor',
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
