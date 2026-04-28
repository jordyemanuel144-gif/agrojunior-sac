import type { TipoMedida } from './supabase.types'

export type { TipoMedida }

export interface Categoria {
  id: string
  nombre: string
}

export interface Producto {
  id: string
  codigo: string
  nombre: string
  categoria_id: string
  tipo_medida: TipoMedida
  precio_costo: number
  precio_minorista: number
  precio_mayorista: number
  precio_especial: number
  stock_actual: number
  stock_minimo: number
  activo: boolean
  imagen_url?: string | null
  created_at: string
  updated_at: string
}

export type NuevoProducto = Omit<Producto, 'id' | 'created_at' | 'updated_at'>
