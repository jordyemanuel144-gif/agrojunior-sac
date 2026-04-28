/**
 * Service de categorías de productos.
 * SUPABASE: Lee de la tabla categorias.
 */
import { supabase, handleError } from '@/lib/supabase'
import type { Categoria } from '@/types/producto.types'

export const categoriasService = {
  obtenerTodos: async (): Promise<Categoria[]> => {
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre')
      .eq('activo', true)
      .order('nombre')

    handleError(error, 'Error al obtener categorías')
    return data ?? []
  },

  obtenerPorId: async (id: string): Promise<Categoria | null> => {
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre')
      .eq('id', id)
      .single()

    if (error && error.code === 'PGRST116') return null
    handleError(error, 'Error al obtener categoría')
    return data
  },
}
