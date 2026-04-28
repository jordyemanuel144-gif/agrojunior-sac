/**
 * Service de gestión de productos.
 * SUPABASE: CRUD sobre tabla productos.
 * Los precios mayorista/especial se calculan automáticamente
 * desde el precio minorista usando los descuentos de configuración.
 * El trigger trg_producto_precio_historial registra cambios de precio.
 */
import { supabase, handleError } from '@/lib/supabase'
import type { Producto, NuevoProducto, Categoria } from '@/types/producto.types'
import { configuracionService } from './configuracion.service'

function calcularPrecios(precioBase: number): { precio_mayorista: number; precio_especial: number } {
  const descuentos = configuracionService.getDescuentos()
  return {
    precio_mayorista: Number((precioBase * (1 - descuentos.mayorista / 100)).toFixed(2)),
    precio_especial: Number((precioBase * (1 - descuentos.especial / 100)).toFixed(2)),
  }
}

export const productosService = {
  obtenerTodos: async (): Promise<Producto[]> => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('nombre')

    handleError(error, 'Error al obtener productos')
    return data ?? []
  },

  obtenerTodosIncluyendoInactivos: async (): Promise<Producto[]> => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('nombre')

    handleError(error, 'Error al obtener todos los productos')
    return data ?? []
  },

  obtenerPorId: async (id: string): Promise<Producto | null> => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code === 'PGRST116') return null
    handleError(error, 'Error al obtener producto')
    return data
  },

  crear: async (datos: NuevoProducto): Promise<Producto> => {
    const preciosCalculados = calcularPrecios(datos.precio_minorista)

    const { data, error } = await supabase
      .from('productos')
      .insert({
        ...datos,
        precio_mayorista: preciosCalculados.precio_mayorista,
        precio_especial: preciosCalculados.precio_especial,
      })
      .select()
      .single()

    handleError(error, 'Error al crear producto')
    return data!
  },

  actualizar: async (id: string, datos: Partial<Producto>): Promise<Producto> => {
    let datosActualizar = { ...datos }

    if (datos.precio_minorista) {
      const preciosCalculados = calcularPrecios(datos.precio_minorista)
      datosActualizar = {
        ...datosActualizar,
        precio_mayorista: datos.precio_mayorista ?? preciosCalculados.precio_mayorista,
        precio_especial: datos.precio_especial ?? preciosCalculados.precio_especial,
      }
    }

    const { id: _, created_at: __, updated_at: ___, ...datosLimpios } = datosActualizar as Producto

    const { data, error } = await supabase
      .from('productos')
      .update(datosLimpios)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleError(error, 'Error al actualizar producto')
    }

    if (!data) {
      const existing = await supabase.from('productos').select('*').eq('id', id).single()
      handleError(existing.error, 'Error al verificar producto actualizado')
      return existing.data
    }

    return data
  },

  eliminar: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('productos')
      .update({ activo: false })
      .eq('id', id)

    handleError(error, 'Error al desactivar producto')
  },

  getProducto: async (id: string): Promise<string> => {
    const producto = await productosService.obtenerPorId(id)
    return producto?.nombre ?? 'Producto no encontrado'
  },

  getCategoria: async (categoriaId: string): Promise<string> => {
    const { data } = await supabase
      .from('categorias')
      .select('nombre')
      .eq('id', categoriaId)
      .single()

    return data?.nombre ?? categoriaId
  },

  obtenerCategorias: async (): Promise<Categoria[]> => {
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre')
      .eq('activo', true)
      .order('nombre')

    handleError(error, 'Error al obtener categorías')
    return data ?? []
  },

  obtenerDestacados: async (): Promise<Producto[]> => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .eq('destacado', true)
      .order('nombre')

    handleError(error, 'Error al obtener productos destacados')
    return data ?? []
  },
}
