import type { Cliente, NuevoCliente } from '@/types/cliente.types'
import { CLIENTES_MOCK } from '@/datos-mock/clientes.mock'
import { generarId } from '@/lib/utils'

let clientes: Cliente[] = [...CLIENTES_MOCK]

export const clientesService = {
  obtenerTodos: async (): Promise<Cliente[]> => {
    return clientes
  },

  obtenerPorId: async (id: string): Promise<Cliente | null> => {
    return clientes.find(c => c.id === id) ?? null
  },

  crear: async (datos: NuevoCliente): Promise<Cliente> => {
    const now = new Date().toISOString()
    const nuevo: Cliente = {
      ...datos,
      id: generarId(),
      pendiente_aprobacion: true,
      created_at: now,
      updated_at: now,
    }
    clientes = [nuevo, ...clientes]
    return nuevo
  },

  obtenerPendientes: async (): Promise<Cliente[]> => {
    return clientes.filter(c => c.pendiente_aprobacion)
  },

  aprobarCliente: async (id: string, tipo: Cliente['tipo']): Promise<Cliente> => {
    clientes = clientes.map(c =>
      c.id === id 
        ? { ...c, tipo, pendiente_aprobacion: false, updated_at: new Date().toISOString() }
        : c
    )
    return clientes.find(c => c.id === id)!
  },

  actualizar: async (id: string, datos: Partial<Cliente>): Promise<Cliente> => {
    clientes = clientes.map(c =>
      c.id === id ? { ...c, ...datos, updated_at: new Date().toISOString() } : c
    )
    return clientes.find(c => c.id === id)!
  },

  eliminar: async (id: string): Promise<void> => {
    clientes = clientes.filter(c => c.id !== id)
  },

  getCliente: (id: string): string => {
    const cliente = clientes.find(c => c.id === id)
    return cliente?.nombre ?? 'Cliente no encontrado'
  },
}
