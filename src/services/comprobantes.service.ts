/**
 * Service de comprobantes (tickets de venta y pagos de cobranza).
 * SUPABASE: CRUD sobre tabla comprobantes.
 * Los datos del cliente se desnormalizan al crear (documento histórico).
 */
import { supabase, handleError } from '@/lib/supabase'
import type { Comprobante, ComprobanteVenta, ComprobantePago, ItemComprobante, VentaEnComprobante } from '@/types/comprobante.types'
import type { Venta } from '@/types/venta.types'
import type { CuentaCorriente } from '@/types/cuenta-corriente.types'
import { NOMBRE_NEGOCIO, RUC_NEGOCIO, DIRECCION_NEGOCIO, TELEFONO } from '@/config/constantes'
import { clientesService } from './clientes.service'

function mapItemsFromVenta(items: Venta['items']): ItemComprobante[] {
  return items.map(item => ({
    nombre: item.producto.nombre,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    subtotal: item.subtotal,
  }))
}

export const comprobantesService = {
  crearVenta: async (venta: Venta): Promise<ComprobanteVenta> => {
    const now = new Date()
    const hora = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })

    // Obtener datos del cliente
    const cliente = venta.cliente_id && venta.cliente_id !== 'publico'
      ? await clientesService.obtenerPorId(venta.cliente_id)
      : null

    // Generar número
    const { count } = await supabase.from('comprobantes').select('id', { count: 'exact', head: true }).eq('tipo', 'venta')
    const num = (count ?? 0) + 1
    const numero = `VTA-${String(num).padStart(5, '0')}`

    const comprobanteData = {
      numero,
      tipo: 'venta' as const,
      estado: 'activo' as const,
      cliente_id: cliente?.id ?? null,
      cliente_nombre: cliente?.nombre ?? 'Público General',
      cliente_documento: cliente?.dni_ruc ?? null,
      cliente_tipo: cliente?.tipo ?? null,
      cliente_telefono: cliente?.telefono ?? null,
      venta_id: venta.id,
      subtotal: venta.subtotal,
      descuento: venta.descuento,
      igv: venta.igv,
      total: venta.total,
      metodo_pago: venta.metodo_pago,
      vendedor_nombre: venta.vendedor_nombre,
      datos_pago: { items: mapItemsFromVenta(venta.items), efectivo: venta.total, vuelto: 0 },
      hora,
    }

    const { data, error } = await supabase
      .from('comprobantes')
      .insert(comprobanteData)
      .select()
      .single()

    handleError(error, 'Error al crear comprobante de venta')

    return {
      ...data!,
      tipo: 'venta',
      fecha: new Date(data!.fecha),
      negocio_nombre: NOMBRE_NEGOCIO,
      negocio_ruc: RUC_NEGOCIO,
      negocio_direccion: DIRECCION_NEGOCIO,
      negocio_telefono: TELEFONO,
      items: mapItemsFromVenta(venta.items),
      efectivo: venta.total,
      vuelto: 0,
    } as ComprobanteVenta
  },

  crearPago: async (
    cuenta: CuentaCorriente, ventas: Venta[], montoPagado: number,
    metodoPago: string, observaciones: string | undefined, usuarioNombre: string
  ): Promise<ComprobantePago> => {
    const now = new Date()
    const hora = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })

    const totalOriginal = ventas.reduce((s, v) => s + v.total, 0)
    const totalPagadoAnterior = ventas.reduce((s, v) => s + v.monto_pagado, 0)

    let montoRestante = montoPagado
    const ventasEnComp: VentaEnComprobante[] = ventas
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
      .map(v => {
        const saldo = v.total - v.monto_pagado
        const aplicar = Math.min(montoRestante, saldo)
        montoRestante -= aplicar
        return {
          ticket: v.ticket_numero, fecha: v.fecha,
          items: mapItemsFromVenta(v.items),
          subtotal: v.subtotal, descuento: v.descuento, igv: v.igv, total: v.total,
          monto_pagado_anterior: v.monto_pagado, monto_pagado_ahora: aplicar,
          nuevo_saldo: Math.max(0, v.total - v.monto_pagado - aplicar),
          estado: (v.monto_pagado + aplicar >= v.total ? 'pagado' : 'parcial') as 'pagado' | 'parcial',
        }
      })

    const { count } = await supabase.from('comprobantes').select('id', { count: 'exact', head: true }).eq('tipo', 'pago_cobranza')
    const num = (count ?? 0) + 1
    const numero = `CPP-${String(num).padStart(5, '0')}`

    const datosPago = {
      deuda_total_original: totalOriginal,
      total_ventas_sin_descuento: ventas.reduce((s, v) => s + v.subtotal, 0),
      total_pagado_anterior: totalPagadoAnterior,
      deuda_actual: totalOriginal - totalPagadoAnterior,
      monto_pagado: montoPagado,
      nueva_deuda: totalOriginal - totalPagadoAnterior - montoPagado,
      observaciones,
      ventas: ventasEnComp,
      ventas_pagadas_count: ventasEnComp.filter(v => v.estado === 'pagado').length,
      ventas_parciales_count: ventasEnComp.filter(v => v.estado === 'parcial').length,
    }

    const { data, error } = await supabase
      .from('comprobantes')
      .insert({
        numero, tipo: 'pago_cobranza', estado: 'activo',
        cliente_id: cuenta.cliente_id, cliente_nombre: cuenta.cliente_nombre,
        cliente_documento: cuenta.cliente_dni_ruc ?? null,
        cliente_tipo: cuenta.cliente_tipo, cliente_telefono: cuenta.cliente_telefono ?? null,
        total: montoPagado, metodo_pago: metodoPago,
        usuario_nombre: usuarioNombre, datos_pago: datosPago, hora,
      })
      .select()
      .single()

    handleError(error, 'Error al crear comprobante de pago')

    return {
      ...data!, tipo: 'pago_cobranza', fecha: new Date(data!.fecha),
      negocio_nombre: NOMBRE_NEGOCIO, negocio_ruc: RUC_NEGOCIO,
      negocio_direccion: DIRECCION_NEGOCIO, negocio_telefono: TELEFONO,
      ...datosPago,
    } as ComprobantePago
  },

  obtenerTodos: async (): Promise<Comprobante[]> => {
    const { data, error } = await supabase
      .from('comprobantes')
      .select('*')
      .order('fecha', { ascending: false })

handleError(error, 'Error al obtener comprobantes')
    return (data ?? []).map(c => {
      const fecha = c.fecha ? new Date(c.fecha) : undefined
      return {
        ...c, fecha,
        numero: c.numero ?? '',
        tipo: c.tipo ?? 'venta',
        estado: c.estado ?? 'activo',
        cliente_nombre: c.cliente_nombre ?? '',
        cliente_tipo: c.cliente_tipo ?? null,
        total: c.total ?? 0,
        negocio_nombre: NOMBRE_NEGOCIO, negocio_ruc: RUC_NEGOCIO,
        negocio_direccion: DIRECCION_NEGOCIO, negocio_telefono: TELEFONO,
      }
    }) as Comprobante[]
  },

  obtenerPorId: async (id: string): Promise<Comprobante | null> => {
    const { data, error } = await supabase
      .from('comprobantes')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    
    const fecha = data.fecha ? new Date(data.fecha) : undefined
    
    return {
      ...data,
      fecha,
      numero: data.numero ?? '',
      tipo: data.tipo ?? 'venta',
      estado: data.estado ?? 'activo',
      cliente_nombre: data.cliente_nombre ?? '',
      cliente_tipo: data.cliente_tipo ?? null,
      total: data.total ?? 0,
      negocio_nombre: NOMBRE_NEGOCIO, 
      negocio_ruc: RUC_NEGOCIO,
      negocio_direccion: DIRECCION_NEGOCIO, 
      negocio_telefono: TELEFONO,
      items: (data.datos_pago as Record<string, unknown>)?.items as ItemComprobante[] ?? [],
    } as Comprobante
  },

  obtenerPorCliente: async (clienteId: string): Promise<Comprobante[]> => {
    const { data, error } = await supabase
      .from('comprobantes')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('fecha', { ascending: false })

    handleError(error, 'Error al obtener comprobantes del cliente')
    return (data ?? []).map(c => ({
      ...c, fecha: new Date(c.fecha),
      negocio_nombre: NOMBRE_NEGOCIO, negocio_ruc: RUC_NEGOCIO,
      negocio_direccion: DIRECCION_NEGOCIO, negocio_telefono: TELEFONO,
    })) as Comprobante[]
  },

  obtenerPorTipo: async (tipo: 'venta' | 'pago_cobranza'): Promise<Comprobante[]> => {
    const { data, error } = await supabase
      .from('comprobantes')
      .select('*')
      .eq('tipo', tipo)
      .order('fecha', { ascending: false })

    handleError(error, 'Error al obtener comprobantes por tipo')
    return (data ?? []).map(c => ({ ...c, fecha: new Date(c.fecha) })) as Comprobante[]
  },

  buscar: async (termino: string): Promise<Comprobante[]> => {
    const { data, error } = await supabase
      .from('comprobantes')
      .select('*')
      .or(`numero.ilike.%${termino}%,cliente_nombre.ilike.%${termino}%`)
      .order('fecha', { ascending: false })

    handleError(error, 'Error al buscar comprobantes')
    return (data ?? []).map(c => ({ ...c, fecha: new Date(c.fecha) })) as Comprobante[]
  },
}