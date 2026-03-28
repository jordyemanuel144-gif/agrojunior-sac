export interface Proveedor {
  id: string
  nombre: string
  ruc: string
  telefono?: string
  email?: string
  direccion?: string
  contacto?: string
  activo: boolean
  created_at: string
  updated_at: string
}

export type NuevoProveedor = Omit<Proveedor, 'id' | 'created_at' | 'updated_at'>
