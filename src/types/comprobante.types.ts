import type { TipoComprobante, EstadoComprobante, TipoCliente } from './supabase.types'

export type { TipoComprobante, EstadoComprobante }

export interface ComprobanteBase {
  id: string
  numero: string
  tipo: TipoComprobante
  fecha: string
  hora?: string | null
  estado: EstadoComprobante
  
  negocio_nombre: string
  negocio_ruc: string
  negocio_direccion: string
  negocio_telefono: string
  
  cliente_id?: string | null
  cliente_nombre: string
  cliente_documento?: string | null
  cliente_tipo?: TipoCliente
  cliente_telefono?: string | null
  
  total: number
}

export interface ItemComprobante {
  nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export interface ComprobanteVenta extends ComprobanteBase {
  tipo: 'venta'
  items: ItemComprobante[]
  subtotal: number
  descuento: number
  igv: number
  metodo_pago?: string | null
  efectivo?: number
  vuelto?: number
  vendedor_nombre?: string | null
}

export interface VentaEnComprobante {
  ticket: string
  fecha: string
  items: ItemComprobante[]
  subtotal: number
  descuento: number
  igv: number
  total: number
  monto_pagado_anterior: number
  monto_pagado_ahora: number
  nuevo_saldo: number
  estado: 'pagado' | 'parcial'
}

export interface ComprobantePago extends ComprobanteBase {
  tipo: 'pago_cobranza'
  deuda_total_original: number
  total_ventas_sin_descuento: number
  total_pagado_anterior: number
  deuda_actual: number
  monto_pagado: number
  nueva_deuda: number
  metodo_pago?: string | null
  observaciones?: string | null
  ventas: VentaEnComprobante[]
  ventas_pagadas_count: number
  ventas_parciales_count: number
  usuario_nombre?: string | null
}

export type Comprobante = ComprobanteVenta | ComprobantePago