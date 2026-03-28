export type EstadoConteo = 'completado' | 'anulado' | 'pendiente'

export interface ItemConteo {
  id: string
  producto_id: string
  stock_sistema: number
  stock_fisico: number
  diferencia: number
}

export interface ConteoInventario {
  id: string
  numero: string
  usuario_id: string
  items: ItemConteo[]
  estado: EstadoConteo
  notas?: string
  fecha: string
  created_at: string
}

export interface ItemStock {
  id: string
  nombre: string
  stock_actual: number
  stock_minimo: number
  categoria: string
  estado: 'ok' | 'bajo' | 'agotado'
}
