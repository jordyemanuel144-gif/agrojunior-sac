// Service para gestión de proveedores
import { PROVEEDORES_MOCK } from '@/datos-mock/proveedores.mock'
import type { Proveedor, NuevoProveedor } from '@/types/proveedor.types'
import { generarId } from '@/lib/utils'

// Estado en memoria para mock
let proveedores = [...PROVEEDORES_MOCK]

export const proveedoresService = {
  // Obtiene todos los proveedores activos
  obtenerTodos: async (): Promise<Proveedor[]> => {
    return proveedores.filter(p => p.activo)
  },

  // Obtiene un proveedor por ID
  obtenerPorId: async (id: string): Promise<Proveedor | null> => {
    return proveedores.find(p => p.id === id) ?? null
  },

  // Crea un nuevo proveedor
  crear: async (datos: NuevoProveedor): Promise<Proveedor> => {
    const nuevo: Proveedor = {
      ...datos,
      id: generarId(),
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    proveedores = [...proveedores, nuevo]
    return nuevo
  },

  // Actualiza un proveedor existente
  actualizar: async (id: string, datos: Partial<Proveedor>): Promise<Proveedor> => {
    const index = proveedores.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Proveedor no encontrado')
    proveedores[index] = { ...proveedores[index], ...datos, updated_at: new Date().toISOString() }
    return proveedores[index]
  },

  // Desactiva un proveedor (soft delete)
  eliminar: async (id: string): Promise<void> => {
    await proveedoresService.actualizar(id, { activo: false })
  },

  // Helper para obtener proveedor por ID (sin async)
  getProveedor: (id: string): Proveedor | undefined => {
    return proveedores.find(p => p.id === id)
  },
}
