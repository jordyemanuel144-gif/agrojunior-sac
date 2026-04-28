import type { EstadoConteo, TipoMovimiento, MotivoMovimiento, TipoMedida } from './supabase.types'

export type { EstadoConteo, TipoMovimiento, MotivoMovimiento }

export interface MovimientoInventario {
  id: string
  producto_id: string
  tipo: TipoMovimiento
  cantidad: number
  motivo: MotivoMovimiento
  notas?: string | null
  fecha: string
  usuario_id: string
  documento_tipo?: 'venta' | 'compra' | 'conteo' | null
  documento_id?: string | null
}

export interface ItemConteo {
  producto_id: string
  stock_sistema: number
  stock_fisico: number
  diferencia: number
}

export interface ConteoInventario {
  id: string
  numero: string
  usuario_id: string
  estado: EstadoConteo
  notas?: string | null
  fecha: string
  created_at: string
}

export interface ItemStock {
  id: string
  nombre: string
  codigo: string
  stock_actual: number
  stock_minimo: number
  tipo_medida: TipoMedida
  categoria: string
  estado: 'ok' | 'bajo' | 'agotado'
}
