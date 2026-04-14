export type MetodoPago = 'efectivo' | 'yape' | 'transferencia'

export interface VentaPago {
  id: string
  venta_id: string
  monto: number
  metodo_pago: MetodoPago
  fecha: Date
  observaciones?: string
  usuario_id: string
  usuario_nombre: string
}

export type NuevoVentaPago = Omit<VentaPago, 'id' | 'fecha' | 'usuario_nombre'>
