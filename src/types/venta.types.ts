export type MetodoPago = 'efectivo' | 'yape' | 'transferencia'
export type EstadoVenta = 'completada' | 'anulada'
export type EstadoPago = 'pagado' | 'parcial' | 'pendiente'

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
  vendedor_id: string
  vendedor_nombre: string
  items: CartItem[]
  metodo_pago: MetodoPago
  subtotal: number
  descuento: number
  igv: number
  total: number
  monto_pagado: number
  estado_pago: EstadoPago
  fecha: Date
  estado: EstadoVenta
}

export type NuevaVenta = Omit<Venta, 'id' | 'fecha' | 'estado' | 'vendedor_nombre' | 'monto_pagado' | 'estado_pago'> & {
  monto_pagado: number
  estado_pago: EstadoPago
}
