/**
 * Service de gestión de compras a proveedores.
 * SUPABASE: Usa RPC crear_compra() para operación transaccional.
 * Los triggers de BD manejan: stock, movimientos de inventario.
 */
import { supabase, handleError } from '@/lib/supabase'
import type { Compra, NuevaCompra, ItemCompra } from '@/types/compra.types'

const COMPRA_SELECT = `
  *,
  items:compra_items(*)
`

function mapCompraFromDB(row: Record<string, unknown>): Compra {
  return {
    id: row.id as string,
    numero: row.numero as string,
    proveedor_id: row.proveedor_id as string,
    usuario_id: row.usuario_id as string,
    items: (row.items as ItemCompra[]) ?? [],
    subtotal: row.subtotal as number,
    igv: row.igv as number,
    total: row.total as number,
    estado: row.estado as Compra['estado'],
    notas: row.notas as string | undefined,
    fecha: row.fecha as string,
    created_at: row.created_at as string,
  }
}

export const comprasService = {
  obtenerTodos: async (): Promise<Compra[]> => {
    const { data, error } = await supabase
      .from('compras')
      .select(COMPRA_SELECT)
      .order('fecha', { ascending: false })

    handleError(error, 'Error al obtener compras')
    return (data ?? []).map(mapCompraFromDB)
  },

  obtenerPorId: async (id: string): Promise<Compra | null> => {
    const { data, error } = await supabase
      .from('compras')
      .select(COMPRA_SELECT)
      .eq('id', id)
      .single()

    if (error && error.code === 'PGRST116') return null
    handleError(error, 'Error al obtener compra')
    return data ? mapCompraFromDB(data) : null
  },

  crear: async (
    datos: NuevaCompra,
    items: Array<{ producto_id: string; cantidad: number; precio_unitario: number }>
  ): Promise<Compra> => {
    const subtotal = items.reduce((sum, i) => sum + i.cantidad * i.precio_unitario, 0)
    // IGV se calcula en el frontend antes de llamar
    const igv = 0
    const total = subtotal + igv

    const itemsRPC = items.map(i => ({
      producto_id: i.producto_id,
      cantidad: i.cantidad,
      precio_unitario: i.precio_unitario,
      total: i.cantidad * i.precio_unitario,
    }))

    const { data, error } = await supabase.rpc('crear_compra', {
      p_proveedor_id: datos.proveedor_id,
      p_usuario_id: datos.usuario_id,
      p_subtotal: subtotal,
      p_igv: igv,
      p_total: total,
      p_notas: datos.notas ?? null,
      p_items: itemsRPC,
    })

    handleError(error, 'Error al crear compra')

    const resultado = data as { id: string; numero: string }
    const compraCompleta = await comprasService.obtenerPorId(resultado.id)
    if (!compraCompleta) throw new Error('Compra creada pero no encontrada')

    return compraCompleta
  },

  anular: async (id: string): Promise<Compra> => {
    const { error } = await supabase
      .from('compras')
      .update({ estado: 'anulada' })
      .eq('id', id)

    handleError(error, 'Error al anular compra')

    const compraAnulada = await comprasService.obtenerPorId(id)
    if (!compraAnulada) throw new Error('Compra no encontrada después de anular')

    return compraAnulada
  },

  obtenerPorProveedor: async (proveedorId: string): Promise<Compra[]> => {
    const { data, error } = await supabase
      .from('compras')
      .select(COMPRA_SELECT)
      .eq('proveedor_id', proveedorId)
      .order('fecha', { ascending: false })

    handleError(error, 'Error al obtener compras del proveedor')
    return (data ?? []).map(mapCompraFromDB)
  },

  getProveedor: async (proveedorId: string): Promise<string> => {
    const { data } = await supabase
      .from('proveedores')
      .select('nombre')
      .eq('id', proveedorId)
      .single()

    return data?.nombre ?? 'Proveedor no encontrado'
  },

  getProductoInfo: async (productoId: string): Promise<{ nombre: string; unidad: string }> => {
    const { data } = await supabase
      .from('productos')
      .select('nombre, tipo_medida')
      .eq('id', productoId)
      .single()

    return {
      nombre: data?.nombre ?? 'Producto no encontrado',
      unidad: data?.tipo_medida ?? 'unidad',
    }
  },

  generarNumero: async (): Promise<string> => {
    // El número se genera automáticamente por la secuencia en la BD
    // Este helper ya no es necesario, pero se mantiene por compatibilidad
    return 'C-XXXXX'
  },
}
