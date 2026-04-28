import type { EstadoCompra } from './supabase.types'

export type { EstadoCompra }

export interface ItemCompra {
  id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export interface Compra {
  id: string
  numero: string
  proveedor_id: string
  usuario_id: string
  subtotal: number
  igv: number
  total: number
  estado: EstadoCompra
  notas?: string | null
  fecha: string
  created_at: string
}

export type NuevaCompra = Omit<Compra, 'id' | 'numero' | 'estado' | 'fecha' | 'created_at' | 'subtotal' | 'igv' | 'total'>

export interface DatosCrearCompra {
  producto_id: string
  cantidad: number
  precio_unitario: number
}
