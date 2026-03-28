export type MetodoPago = 'efectivo' | 'yape' | 'transferencia'
export type EstadoVenta = 'completada' | 'anulada'

export interface CartItem {
  producto: import('./producto.types').Producto
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export interface ItemVenta {
  id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  total: number
}

export interface Venta {
  id: string
  ticket_numero: string
  cliente_id: string
  items: CartItem[]
  metodo_pago: MetodoPago
  subtotal: number
  descuento: number
  igv: number
  total: number
  fecha: Date
  estado: EstadoVenta
}

export type NuevaVenta = Omit<Venta, 'id' | 'fecha' | 'estado'>
