import type { RolUsuario } from './supabase.types'

export type { RolUsuario }

export type RolCompleto = RolUsuario | 'cliente'

export interface User {
  id: string
  email: string
  name: string
  role: RolCompleto
  active: boolean
  created_at: string
  updated_at: string
}

export type NuevoUsuario = Omit<User, 'id' | 'created_at' | 'updated_at'>

export interface Sesion {
  user: User | null
  session: unknown
  loading: boolean
  error: string | null
}
