import { createContext, useContext, type ReactNode } from 'react'
import type { Sesion } from '@/types/usuario.types'

interface AuthContextType extends Sesion {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const value: AuthContextType = {
    user: null,
    session: null,
    loading: false,
    error: null,
    login: async () => true,
    logout: async () => {},
    isAdmin: false,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
