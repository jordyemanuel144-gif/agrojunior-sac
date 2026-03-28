export type EstadoCompra = 'completada' | 'anulada' | 'pendiente'

export interface ItemCompra {
  id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  total: number
}

export interface Compra {
  id: string
  numero: string
  proveedor_id: string
  usuario_id: string
  items: ItemCompra[]
  subtotal: number
  igv: number
  total: number
  estado: EstadoCompra
  notas?: string
  fecha: string
  created_at: string
}

export type NuevaCompra = Omit<Compra, 'id' | 'numero' | 'estado' | 'fecha' | 'created_at' | 'items' | 'subtotal' | 'igv' | 'total'>

export interface DatosCrearCompra {
  producto_id: string
  cantidad: number
  precio_unitario: number
}
