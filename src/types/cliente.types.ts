import type { TipoCliente } from './supabase.types'

export type { TipoCliente }

export interface Cliente {
  id: string
  nombre: string
  dni_ruc?: string
  telefono?: string
  tipo: TipoCliente
  pendiente_aprobacion: boolean
  created_at: string
  updated_at: string
  email?: string
  activo?: boolean
  auth_user_id?: string | null
}

export type NuevoCliente = Omit<Cliente, 'id' | 'created_at' | 'updated_at' | 'pendiente_aprobacion'>
export type NuevoClienteConCuenta = Omit<Cliente, 'id' | 'created_at' | 'updated_at' | 'pendiente_aprobacion'>

export interface ClienteFormData {
  nombre: string
  dni_ruc: string
  telefono: string
}

export interface ClientePasswordData {
  actual: string
  nueva: string
  confirmar: string
}
