import type { MetodoPago } from './supabase.types'

export type { MetodoPago }

export interface VentaPago {
  id: string
  venta_id: string
  monto: number
  metodo_pago: MetodoPago
  fecha: string
  observaciones?: string | null
  usuario_id: string
}

export type NuevoVentaPago = Omit<VentaPago, 'id' | 'fecha'>
