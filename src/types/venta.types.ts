import type { MetodoPago, EstadoVenta, EstadoPago } from './supabase.types'

export type { MetodoPago, EstadoVenta, EstadoPago }

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
  subtotal: number
}

export interface Venta {
  id: string
  ticket_numero: string
  cliente_id: string | null
  vendedor_id: string
  vendedor_nombre?: string
  items?: CartItem[]
  metodo_pago: MetodoPago
  subtotal: number
  descuento: number
  igv: number
  total: number
  monto_pagado: number
  estado_pago: EstadoPago
  fecha: string
  estado: EstadoVenta
}

export type NuevaVenta = Omit<Venta, 'id' | 'fecha' | 'estado' | 'vendedor_nombre'> & {
  monto_pagado: number
  estado_pago: EstadoPago
}
