export type EstadoCuentaCorriente = 'activa' | 'bloqueada'

export interface CuentaCorriente {
  cliente_id: string
  cliente_nombre: string
  cliente_dni_ruc?: string
  cliente_telefono?: string
  cliente_tipo: import('./cliente.types').TipoCliente
  total_deuda: number
  total_pagado: number
  saldo_pendiente: number
  cantidad_ventas_pendientes: number
  total_ventas_sin_descuento: number
  ultima_venta_fecha?: Date
  ultima_venta_monto?: number
  estado: EstadoCuentaCorriente
}

export interface MovimientoCuentaCorriente {
  id: string
  tipo: 'venta' | 'pago'
  documento_id: string
  documento_tipo: string
  documento_numero: string
  monto: number
  saldo_antes: number
  saldo_despues: number
  fecha: Date
  metodo_pago?: import('./venta-pago.types').MetodoPago
  observaciones?: string
}

export interface ResumenCuentasPorCobrar {
  total_deuda: number
  total_pendiente: number
  cantidad_clientes_con_deuda: number
  cantidad_ventas_pendientes: number
  clientes_mayores_deudores: Array<{
    cliente_id: string
    cliente_nombre: string
    saldo: number
  }>
}
