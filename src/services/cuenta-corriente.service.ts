/**
 * Service de cuenta corriente (cuentas por cobrar).
 * SUPABASE: Usa vista_cuentas_corrientes y RPC registrar_pago_cobranza.
 */
import { supabase, handleError } from '@/lib/supabase'
import type { CuentaCorriente, ResumenCuentasPorCobrar, MovimientoCuentaCorriente } from '@/types/cuenta-corriente.types'
import type { Venta } from '@/types/venta.types'
import type { VentaPago, NuevoVentaPago } from '@/types/venta-pago.types'
import { ventasService } from './ventas.service'

function mapCuenta(r: Record<string, unknown>): CuentaCorriente {
  return {
    cliente_id: r.cliente_id as string,
    cliente_nombre: r.cliente_nombre as string,
    cliente_dni_ruc: r.cliente_dni_ruc as string | undefined,
    cliente_telefono: r.cliente_telefono as string | undefined,
    cliente_tipo: r.cliente_tipo as CuentaCorriente['cliente_tipo'],
    total_deuda: r.total_deuda as number,
    total_pagado: r.total_pagado as number,
    saldo_pendiente: r.saldo_pendiente as number,
    cantidad_ventas_pendientes: r.cantidad_ventas_pendientes as number,
    total_ventas_sin_descuento: (r.total_ventas_sin_descuento as number) ?? 0,
    ultima_venta_fecha: r.ultima_venta_fecha ? new Date(r.ultima_venta_fecha as string) : undefined,
    ultima_venta_monto: r.ultima_venta_monto as number | undefined,
    estado: 'activa' as const,
  }
}

export const cuentaCorrienteService = {
  obtenerResumen: async (): Promise<ResumenCuentasPorCobrar> => {
    const { data } = await supabase
      .from('vista_resumen_cobranzas' as 'configuracion')
      .select('*')
      .single()

    const { data: deudores } = await supabase
      .from('vista_cuentas_corrientes' as 'configuracion')
      .select('cliente_id, cliente_nombre, saldo_pendiente')
      .order('saldo_pendiente', { ascending: false })
      .limit(5)

    const r = (data ?? {}) as Record<string, number>
    return {
      total_deuda: r.total_deuda ?? 0,
      total_pendiente: r.total_pendiente ?? 0,
      cantidad_clientes_con_deuda: r.cantidad_clientes_con_deuda ?? 0,
      cantidad_ventas_pendientes: r.cantidad_ventas_pendientes ?? 0,
      clientes_mayores_deudores: (deudores ?? []).map(d => {
        const row = d as unknown as Record<string, unknown>
        return { cliente_id: row.cliente_id as string, cliente_nombre: row.cliente_nombre as string, saldo: row.saldo_pendiente as number }
      }),
    }
  },

  obtenerTodas: async (): Promise<CuentaCorriente[]> => {
    const { data, error } = await supabase
      .from('vista_cuentas_corrientes' as 'configuracion')
      .select('*')

    handleError(error, 'Error al obtener cuentas corrientes')
    return (data ?? []).map(r => mapCuenta(r as unknown as Record<string, unknown>))
  },

  obtenerPorCliente: async (clienteId: string): Promise<CuentaCorriente | null> => {
    const { data, error } = await supabase
      .from('vista_cuentas_corrientes' as 'configuracion')
      .select('*')
      .eq('cliente_id', clienteId)
      .maybeSingle()

    if (error || !data) return null
    return mapCuenta(data as unknown as Record<string, unknown>)
  },

  obtenerVentasPendientes: async (clienteId: string): Promise<Venta[]> => {
    const ventas = await ventasService.obtenerPorCliente(clienteId)
    return ventas.filter(v => v.estado === 'completada' && v.estado_pago !== 'pagado')
  },

  registrarPago: async (
    clienteId: string,
    datos: { ventasSeleccionadas: string[]; monto: number; metodo_pago: NuevoVentaPago['metodo_pago']; observaciones?: string; usuario_id: string }
  ): Promise<VentaPago[]> => {
    const { error } = await supabase.rpc('registrar_pago_cobranza', {
      p_cliente_id: clienteId,
      p_monto: datos.monto,
      p_metodo_pago: datos.metodo_pago,
      p_observaciones: datos.observaciones ?? null,
      p_usuario_id: datos.usuario_id,
      p_ventas_ids: datos.ventasSeleccionadas,
    })

    handleError(error, 'Error al registrar pago')

    const { data: pagos } = await supabase
      .from('venta_pagos')
      .select('*, usuario:usuarios!usuario_id(name)')
      .eq('usuario_id', datos.usuario_id)
      .order('fecha', { ascending: false })
      .limit(datos.ventasSeleccionadas.length)

    return (pagos ?? []).map(p => ({
      id: p.id,
      venta_id: p.venta_id,
      monto: p.monto,
      metodo_pago: p.metodo_pago as VentaPago['metodo_pago'],
      fecha: new Date(p.fecha),
      observaciones: p.observaciones ?? undefined,
      usuario_id: p.usuario_id,
      usuario_nombre: (p.usuario as { name: string } | null)?.name ?? 'Usuario',
    }))
  },

  obtenerMovimientos: async (clienteId: string): Promise<MovimientoCuentaCorriente[]> => {
    const ventas = await ventasService.obtenerPorCliente(clienteId)
    const pendientes = ventas
      .filter(v => v.estado === 'completada' && v.estado_pago !== 'pagado')
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())

    let saldo = 0
    return pendientes.map(v => {
      saldo += v.total
      return {
        id: v.id, tipo: 'venta' as const,
        documento_id: v.id, documento_tipo: 'venta', documento_numero: v.ticket_numero,
        monto: v.total, saldo_antes: saldo - v.total, saldo_despues: saldo, fecha: v.fecha,
      }
    }).reverse()
  },
}