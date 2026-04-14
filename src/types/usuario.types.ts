export type RolUsuario = 'admin' | 'vendedor'

export interface User {
  id: string
  email: string
  name: string
  role: RolUsuario
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
