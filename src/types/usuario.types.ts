export type RolUsuario = 'admin' | 'empleado'

export interface User {
  id: string
  email: string
  name: string
  role: RolUsuario
  active: boolean
  created_at: string
  updated_at: string
}

export interface Sesion {
  user: User | null
  session: unknown
  loading: boolean
  error: string | null
}
