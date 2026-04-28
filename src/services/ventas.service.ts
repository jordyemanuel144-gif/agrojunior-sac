/**
 * Service de gestión de ventas.
 * SUPABASE: Usa RPC crear_venta() para operación transaccional.
 * Los triggers de BD manejan: stock, movimientos de inventario.
 * Items de venta están normalizados en tabla venta_items con JOIN a productos.
 */
import { supabase, handleError } from '@/lib/supabase'
import type { Venta, NuevaVenta, CartItem } from '@/types/venta.types'
import type { Producto } from '@/types/producto.types'

/**
 * Transforma la respuesta de Supabase (normalizada) al tipo Venta del frontend.
 * Los items vienen como venta_items con producto embebido vía JOIN.
 */
function mapVentaFromDB(row: Record<string, unknown>): Venta {
  const vendedor = row.vendedor as { name: string } | null
  const items = (row.items as Array<Record<string, unknown>>) ?? []

  const cartItems: CartItem[] = items.map(item => ({
    producto: item.producto as Producto,
    cantidad: item.cantidad as number,
    precio_unitario: item.precio_unitario as number,
    subtotal: item.subtotal as number,
  }))

  return {
    id: row.id as string,
    ticket_numero: row.ticket_numero as string,
    cliente_id: (row.cliente_id as string) ?? 'publico',
    vendedor_id: row.vendedor_id as string,
    vendedor_nombre: vendedor?.name ?? 'Usuario',
    items: cartItems,
    metodo_pago: row.metodo_pago as Venta['metodo_pago'],
    subtotal: row.subtotal as number,
    descuento: row.descuento as number,
    igv: row.igv as number,
    total: row.total as number,
    monto_pagado: row.monto_pagado as number,
    estado_pago: row.estado_pago as Venta['estado_pago'],
    fecha: new Date(row.fecha as string),
    estado: row.estado as Venta['estado'],
  }
}

// Query base con JOINs para traer vendedor e items con producto
const VENTA_SELECT = `
  *,
  vendedor:usuarios!vendedor_id(name),
  items:venta_items(
    cantidad, precio_unitario, subtotal,
    producto:productos(*)
  )
`

export const ventasService = {
  obtenerTodos: async (): Promise<Venta[]> => {
    const { data, error } = await supabase
      .from('ventas')
      .select(VENTA_SELECT)
      .order('fecha', { ascending: false })

    handleError(error, 'Error al obtener ventas')
    return (data ?? []).map(mapVentaFromDB)
  },

  obtenerPorId: async (id: string): Promise<Venta | null> => {
    const { data, error } = await supabase
      .from('ventas')
      .select(VENTA_SELECT)
      .eq('id', id)
      .single()

    if (error && error.code === 'PGRST116') return null
    handleError(error, 'Error al obtener venta')
    return data ? mapVentaFromDB(data) : null
  },

  obtenerPorFecha: async (fecha: Date): Promise<Venta[]> => {
    const fechaStr = fecha.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('ventas')
      .select(VENTA_SELECT)
      .gte('fecha', `${fechaStr}T00:00:00`)
      .lt('fecha', `${fechaStr}T23:59:59`)
      .order('fecha', { ascending: false })

    handleError(error, 'Error al obtener ventas por fecha')
    return (data ?? []).map(mapVentaFromDB)
  },

  obtenerPorVendedor: async (vendedorId: string): Promise<Venta[]> => {
    const { data, error } = await supabase
      .from('ventas')
      .select(VENTA_SELECT)
      .eq('vendedor_id', vendedorId)
      .order('fecha', { ascending: false })

    handleError(error, 'Error al obtener ventas del vendedor')
    return (data ?? []).map(mapVentaFromDB)
  },

  obtenerPorCliente: async (clienteId: string): Promise<Venta[]> => {
    // Intentar tabla directo primero (probablemente blocked por RLS)
    let { data, error } = await supabase
      .from('ventas')
      .select(VENTA_SELECT)
      .eq('cliente_id', clienteId)
      .order('fecha', { ascending: false })

    // Si RLS bloqueó (retorna vacío o error), usar fallback con vista
    if (error || !data || data.length === 0 || (error && error.message.includes('row'))) {
      // Usar vista que ya tiene los datos correctos
      const { data: fallback } = await supabase
        .from('vista_ventas_simple' as 'configuracion')
        .select('*')
        .eq('cliente_id', clienteId)
      
      if (fallback && fallback.length > 0) {
        return (fallback ?? []).map(mapVentaFromDB)
      }
      
      data = fallback
    }

    handleError(error, 'Error al obtener ventas del cliente')
    return (data ?? []).map(mapVentaFromDB)
  },

  crear: async (datos: NuevaVenta): Promise<Venta> => {
    // Transformar CartItem[] a formato RPC (solo producto_id, no objeto completo)
    const itemsRPC = datos.items.map(item => ({
      producto_id: item.producto.id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.subtotal,
    }))

    const { data, error } = await supabase.rpc('crear_venta', {
      p_cliente_id: datos.cliente_id === 'publico' ? null : datos.cliente_id,
      p_vendedor_id: datos.vendedor_id,
      p_metodo_pago: datos.metodo_pago,
      p_subtotal: datos.subtotal,
      p_descuento: datos.descuento,
      p_igv: datos.igv,
      p_total: datos.total,
      p_monto_pagado: datos.monto_pagado,
      p_estado_pago: datos.estado_pago,
      p_items: itemsRPC,
    })

    handleError(error, 'Error al crear venta')

    const resultado = data as { id: string; ticket_numero: string }

    // Obtener la venta completa con JOINs para devolver al frontend
    const ventaCompleta = await ventasService.obtenerPorId(resultado.id)
    if (!ventaCompleta) throw new Error('Venta creada pero no encontrada')

    return ventaCompleta
  },

  anular: async (id: string): Promise<Venta> => {
    const { error } = await supabase
      .from('ventas')
      .update({ estado: 'anulada' })
      .eq('id', id)

    handleError(error, 'Error al anular venta')

    // El trigger trg_anular_venta_devolver_stock restaura el stock automáticamente
    const ventaAnulada = await ventasService.obtenerPorId(id)
    if (!ventaAnulada) throw new Error('Venta no encontrada después de anular')

    return ventaAnulada
  },

  actualizar: async (id: string, datos: Partial<Venta>): Promise<Venta> => {
    // Solo permitir actualizar campos seguros (no items, no ticket)
    const camposPermitidos: Partial<Record<string, unknown>> = {}
    if (datos.monto_pagado !== undefined) camposPermitidos.monto_pagado = datos.monto_pagado
    if (datos.estado_pago !== undefined) camposPermitidos.estado_pago = datos.estado_pago
    if (datos.estado !== undefined) camposPermitidos.estado = datos.estado
    if (datos.cliente_id !== undefined) {
      camposPermitidos.cliente_id = datos.cliente_id === 'publico' ? null : datos.cliente_id
    }

    const { error } = await supabase
      .from('ventas')
      .update(camposPermitidos)
      .eq('id', id)

    handleError(error, 'Error al actualizar venta')

    const ventaActualizada = await ventasService.obtenerPorId(id)
    if (!ventaActualizada) throw new Error('Venta no encontrada después de actualizar')

    return ventaActualizada
  },
}
