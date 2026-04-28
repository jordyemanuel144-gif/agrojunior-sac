/**
 * Service de inventario.
 * SUPABASE: Usa vista_stock para estado de stock, tablas para movimientos/conteos.
 * El stock se actualiza automáticamente por triggers en ventas y compras.
 * Los conteos usan RPC completar_conteo() para ajustes transaccionales.
 */
import { supabase, handleError } from '@/lib/supabase'
import type {
  ItemStock, MovimientoInventario,
  ConteoInventario, ItemConteo, EstadoConteo,
} from '@/types/inventario.types'

function mapMovimiento(row: Record<string, unknown>): MovimientoInventario {
  return {
    ...row as Omit<MovimientoInventario, 'fecha' | 'producto_nombre'>,
    producto_nombre: (row.producto as { nombre: string } | null)?.nombre ?? 'Desconocido',
    fecha: new Date(row.fecha as string),
  }
}

export const inventarioService = {
  obtenerStock: async (): Promise<ItemStock[]> => {
    const { data, error } = await supabase
      .from('vista_stock' as 'productos')
      .select('*')

    handleError(error, 'Error al obtener stock')
    return (data ?? []) as unknown as ItemStock[]
  },

  obtenerStockPorId: async (id: string): Promise<ItemStock | null> => {
    const { data, error } = await supabase
      .from('vista_stock' as 'productos')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code === 'PGRST116') return null
    handleError(error, 'Error al obtener stock del producto')
    return data as unknown as ItemStock
  },

  obtenerMovimientosPorProducto: async (productoId: string): Promise<MovimientoInventario[]> => {
    const { data, error } = await supabase
      .from('movimientos_inventario')
      .select('*, producto:productos!producto_id(nombre)')
      .eq('producto_id', productoId)
      .order('fecha', { ascending: false })

    handleError(error, 'Error al obtener movimientos')
    return (data ?? []).map(mapMovimiento)
  },

  obtenerTodosLosMovimientos: async (): Promise<MovimientoInventario[]> => {
    const { data, error } = await supabase
      .from('movimientos_inventario')
      .select('*, producto:productos!producto_id(nombre)')
      .order('fecha', { ascending: false })
      .limit(500)

    handleError(error, 'Error al obtener movimientos')
    return (data ?? []).map(mapMovimiento)
  },

  registrarMovimiento: async (datos: Omit<MovimientoInventario, 'id'>): Promise<MovimientoInventario> => {
    const { data, error } = await supabase
      .from('movimientos_inventario')
      .insert({
        producto_id: datos.producto_id,
        tipo: datos.tipo,
        cantidad: datos.cantidad,
        motivo: datos.motivo,
        notas: datos.notas,
        usuario_id: datos.usuario_id,
        documento_tipo: datos.documento_tipo,
        documento_id: datos.documento_id,
      })
      .select('*, producto:productos!producto_id(nombre)')
      .single()

    handleError(error, 'Error al registrar movimiento')
    return mapMovimiento(data!)
  },

  // ─── Conteos de inventario ─────────────────────────────

  obtenerConteos: async (): Promise<ConteoInventario[]> => {
    const { data, error } = await supabase
      .from('conteos_inventario')
      .select(`
        *,
        usuario:usuarios!usuario_id(name),
        items:conteo_items(
          producto_id, stock_sistema, stock_fisico, diferencia,
          producto:productos!producto_id(nombre)
        )
      `)
      .order('fecha', { ascending: false })

    handleError(error, 'Error al obtener conteos')

    return (data ?? []).map(row => ({
      id: row.id,
      numero: row.numero,
      usuario_id: row.usuario_id,
      usuario_nombre: (row.usuario as { name: string } | null)?.name,
      items: ((row.items as Array<Record<string, unknown>>) ?? []).map(item => ({
        producto_id: item.producto_id as string,
        producto_nombre: (item.producto as { nombre: string } | null)?.nombre ?? 'Desconocido',
        stock_sistema: item.stock_sistema as number,
        stock_fisico: item.stock_fisico as number,
        diferencia: item.diferencia as number,
      })),
      estado: row.estado as EstadoConteo,
      notas: row.notas ?? undefined,
      fecha: row.fecha,
      created_at: row.created_at,
    }))
  },

  obtenerConteoPorId: async (id: string): Promise<ConteoInventario | null> => {
    const { data, error } = await supabase
      .from('conteos_inventario')
      .select(`
        *,
        usuario:usuarios!usuario_id(name),
        items:conteo_items(
          producto_id, stock_sistema, stock_fisico, diferencia,
          producto:productos!producto_id(nombre)
        )
      `)
      .eq('id', id)
      .single()

    if (error && error.code === 'PGRST116') return null
    handleError(error, 'Error al obtener conteo')

    return {
      id: data!.id,
      numero: data!.numero,
      usuario_id: data!.usuario_id,
      usuario_nombre: (data!.usuario as { name: string } | null)?.name,
      items: ((data!.items as Array<Record<string, unknown>>) ?? []).map(item => ({
        producto_id: item.producto_id as string,
        producto_nombre: (item.producto as { nombre: string } | null)?.nombre ?? 'Desconocido',
        stock_sistema: item.stock_sistema as number,
        stock_fisico: item.stock_fisico as number,
        diferencia: item.diferencia as number,
      })),
      estado: data!.estado as EstadoConteo,
      notas: data!.notas ?? undefined,
      fecha: data!.fecha,
      created_at: data!.created_at,
    }
  },

  crearConteo: async (
    datos: { items: { producto_id: string; stock_fisico: number }[] },
    usuarioId: string,
    _usuarioNombre: string
  ): Promise<ConteoInventario> => {
    // Obtener stock actual del sistema para cada producto
    const productIds = datos.items.map(i => i.producto_id)
    const { data: productos } = await supabase
      .from('productos')
      .select('id, nombre, stock_actual')
      .in('id', productIds)

    const productoMap = new Map(
      (productos ?? []).map(p => [p.id, p])
    )

    // Crear conteo
    const { data: conteo, error: conteoError } = await supabase
      .from('conteos_inventario')
      .insert({ usuario_id: usuarioId })
      .select()
      .single()

    handleError(conteoError, 'Error al crear conteo')

    // Crear items
    const itemsInsert = datos.items.map(item => {
      const prod = productoMap.get(item.producto_id)
      return {
        conteo_id: conteo!.id,
        producto_id: item.producto_id,
        stock_sistema: prod?.stock_actual ?? 0,
        stock_fisico: item.stock_fisico,
      }
    })

    const { error: itemsError } = await supabase
      .from('conteo_items')
      .insert(itemsInsert)

    handleError(itemsError, 'Error al crear items de conteo')

    const conteoCompleto = await inventarioService.obtenerConteoPorId(conteo!.id)
    return conteoCompleto!
  },

  anConteo: async (id: string): Promise<ConteoInventario> => {
    const { error } = await supabase
      .from('conteos_inventario')
      .update({ estado: 'anulado' })
      .eq('id', id)

    handleError(error, 'Error al anular conteo')

    const conteo = await inventarioService.obtenerConteoPorId(id)
    return conteo!
  },

  actualizarConteo: async (id: string, datos: Partial<ConteoInventario>): Promise<ConteoInventario> => {
    const { error } = await supabase
      .from('conteos_inventario')
      .update({ notas: datos.notas })
      .eq('id', id)

    handleError(error, 'Error al actualizar conteo')

    const conteo = await inventarioService.obtenerConteoPorId(id)
    return conteo!
  },

  actualizarItemConteo: async (conteoId: string, productoId: string, stockFisico: number): Promise<ConteoInventario> => {
    const { error } = await supabase
      .from('conteo_items')
      .update({ stock_fisico: stockFisico })
      .eq('conteo_id', conteoId)
      .eq('producto_id', productoId)

    handleError(error, 'Error al actualizar item de conteo')

    const conteo = await inventarioService.obtenerConteoPorId(conteoId)
    return conteo!
  },

  completarConteo: async (id: string, usuarioId: string): Promise<ConteoInventario> => {
    const { error } = await supabase.rpc('completar_conteo', {
      p_conteo_id: id,
      p_usuario_id: usuarioId,
    })

    handleError(error, 'Error al completar conteo')

    const conteo = await inventarioService.obtenerConteoPorId(id)
    return conteo!
  },
}
