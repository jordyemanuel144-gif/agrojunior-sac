export type EstadoConteo = 'borrador' | 'completado' | 'anulado'

export type TipoMovimiento = 'entrada' | 'salida'
export type MotivoMovimiento = 'merma' | 'regalo' | 'correccion' | 'ajuste' | 'compra' | 'venta'

export interface MovimientoInventario {
  id: string
  producto_id: string
  producto_nombre: string
  tipo: TipoMovimiento
  cantidad: number
  motivo: MotivoMovimiento
  notas?: string
  fecha: Date
  usuario_id: string
  documento_tipo?: 'venta' | 'compra' | 'conteo'
  documento_id?: string
}

export interface ItemConteo {
  producto_id: string
  producto_nombre: string
  stock_sistema: number
  stock_fisico: number
  diferencia: number
}

export interface ConteoInventario {
  id: string
  numero: string
  usuario_id: string
  usuario_nombre?: string
  items: ItemConteo[]
  estado: EstadoConteo
  notas?: string
  fecha: string
  created_at: string
}

export interface ItemStock {
  id: string
  nombre: string
  codigo?: string
  stock_actual: number
  stock_minimo: number
  tipo_medida: 'kg' | 'unidad'
  categoria: string
  estado: 'ok' | 'bajo' | 'agotado'
}
