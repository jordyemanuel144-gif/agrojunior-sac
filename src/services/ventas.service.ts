import { VENTAS_MOCK } from '@/datos-mock/ventas.mock'
import { CLIENTES_MOCK } from '@/datos-mock/clientes.mock'
import type { Venta, NuevaVenta } from '@/types/venta.types'
import type { Cliente } from '@/types/cliente.types'
import { generarId } from '@/lib/utils'

let ventas = [...VENTAS_MOCK]

function getCliente(clienteId: string): Cliente {
  return CLIENTES_MOCK.find(c => c.id === clienteId) ?? CLIENTES_MOCK[0]
}

export const ventasService = {
  obtenerTodos: async (): Promise<Venta[]> => {
    return [...ventas].sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
  },

  obtenerPorId: async (id: string): Promise<Venta | null> => {
    const venta = ventas.find(v => v.id === id)
    if (!venta) return null
    return {
      ...venta,
      items: [...venta.items],
    }
  },

  obtenerPorFecha: async (fecha: Date): Promise<Venta[]> => {
    const fechaStr = fecha.toDateString()
    return ventas
      .filter(v => v.fecha.toDateString() === fechaStr)
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
  },

  crear: async (datos: NuevaVenta): Promise<Venta> => {
    const venta: Venta = {
      ...datos,
      id: generarId(),
      fecha: new Date(),
      estado: 'completada',
    }
    ventas = [...ventas, venta]
    return venta
  },

  anular: async (id: string): Promise<Venta> => {
    const index = ventas.findIndex(v => v.id === id)
    if (index === -1) throw new Error('Venta no encontrada')
    ventas[index] = { ...ventas[index], estado: 'anulada' }
    return ventas[index]
  },

  getCliente,
}
