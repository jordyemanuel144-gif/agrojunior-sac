/**
 * Service de gestión de proveedores.
 * SUPABASE: CRUD sobre tabla proveedores con soft delete.
 */
import { supabase, handleError } from '@/lib/supabase'
import type { Proveedor, NuevoProveedor } from '@/types/proveedor.types'

let cacheProveedores: Proveedor[] = []
let cacheCargado = false

export const proveedoresService = {
  obtenerTodos: async (): Promise<Proveedor[]> => {
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .order('nombre')

    handleError(error, 'Error al obtener proveedores')
    cacheProveedores = data ?? []
    cacheCargado = true
    return cacheProveedores
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

  obtenerProveedorSync: (_id: string): Proveedor | undefined => {
    return cacheProveedores.find(p => p.id === _id)
  },

  obtenerProveedorActivoSync: (_id: string): Proveedor | undefined => {
    return cacheProveedores.find(p => p.id === _id && p.activo)
  },

  obtenerProveedorDelCache: (_id: string): Proveedor | undefined => {
    return cacheProveedores.find(p => p.id === _id)
  },

  getProveedor: (_id: string): undefined => {
    return cacheProveedores.find(p => p.id === _id)
  },
}
