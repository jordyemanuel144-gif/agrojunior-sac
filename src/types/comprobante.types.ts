export type TipoComprobante = 'venta' | 'pago_cobranza'
export type EstadoComprobante = 'activo' | 'anulado'

export interface ComprobanteBase {
  id: string
  numero: string
  tipo: TipoComprobante
  fecha: Date
  estado: EstadoComprobante
  
  negocio_nombre: string
  negocio_ruc: string
  negocio_direccion: string
  negocio_telefono: string
  
  cliente_id?: string
  cliente_nombre: string
  cliente_documento?: string
  
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
  metodo_pago: string
  efectivo?: number
  vuelto?: number
  vendedor_nombre: string
}

export interface VentaEnComprobante {
  ticket: string
  fecha: Date
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
  total_pagado_anterior: number
  deuda_actual: number
  monto_pagado: number
  nueva_deuda: number
  metodo_pago: string
  observaciones?: string
  ventas: VentaEnComprobante[]
  ventas_pagadas_count: number
  ventas_parciales_count: number
  usuario_nombre: string
}

export type Comprobante = ComprobanteVenta | ComprobantePago