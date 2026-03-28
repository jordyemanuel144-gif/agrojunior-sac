export type TipoCliente = 'minorista' | 'mayorista' | 'especial'

export interface Cliente {
  id: string
  nombre: string
  dni_ruc?: string
  telefono?: string
  tipo: TipoCliente
  created_at: string
  updated_at: string
}

export type NuevoCliente = Omit<Cliente, 'id' | 'created_at' | 'updated_at'>
