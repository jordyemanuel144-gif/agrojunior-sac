/**
 * Service de gestión de proveedores.
 * SUPABASE: CRUD sobre tabla proveedores con soft delete.
 */
import { supabase, handleError } from '@/lib/supabase'
import type { Proveedor, NuevoProveedor } from '@/types/proveedor.types'

export const proveedoresService = {
  obtenerTodos: async (): Promise<Proveedor[]> => {
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .eq('activo', true)
      .order('nombre')

    handleError(error, 'Error al obtener proveedores')
    return data ?? []
  },

  obtenerPorId: async (id: string): Promise<Proveedor | null> => {
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code === 'PGRST116') return null
    handleError(error, 'Error al obtener proveedor')
    return data
  },

  crear: async (datos: NuevoProveedor): Promise<Proveedor> => {
    const { data, error } = await supabase
      .from('proveedores')
      .insert({ ...datos, activo: true })
      .select()
      .single()

    handleError(error, 'Error al crear proveedor')
    return data!
  },

  actualizar: async (id: string, datos: Partial<Proveedor>): Promise<Proveedor> => {
    const { data, error } = await supabase
      .from('proveedores')
      .update(datos)
      .eq('id', id)
      .select()
      .single()

    handleError(error, 'Error al actualizar proveedor')
    return data!
  },

  eliminar: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('proveedores')
      .update({ activo: false })
      .eq('id', id)

    handleError(error, 'Error al desactivar proveedor')
  },

  getProveedor: (_id: string): undefined => {
    // Helper síncrono: necesita cache local.
    // Se usa en compras.service para obtener nombre rápido.
    // En Supabase, preferir obtenerPorId (async).
    return undefined
  },
}
