import { VENTAS_MOCK } from '@/datos-mock/ventas.mock'
import { CLIENTES_MOCK } from '@/datos-mock/clientes.mock'
import { USUARIOS_MOCK } from '@/datos-mock/usuarios.mock'
import type { Venta, NuevaVenta } from '@/types/venta.types'
import type { Cliente } from '@/types/cliente.types'
import { generarId, generarNumeroTicket } from '@/lib/utils'
import { inventarioService } from './inventario.service'

export let ventas = [...VENTAS_MOCK]

function getCliente(clienteId: string): Cliente {
  return CLIENTES_MOCK.find(c => c.id === clienteId) ?? CLIENTES_MOCK[0]
}

function getVendedor(vendedorId: string): string {
  const vendedor = USUARIOS_MOCK.find(u => u.id === vendedorId)
  return vendedor?.name ?? 'Usuario'
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

  obtenerPorVendedor: async (vendedorId: string): Promise<Venta[]> => {
    return ventas
      .filter(v => v.vendedor_id === vendedorId)
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
  },

  obtenerPorCliente: async (clienteId: string): Promise<Venta[]> => {
    return ventas
      .filter(v => v.cliente_id === clienteId)
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
  },

  crear: async (datos: NuevaVenta): Promise<Venta> => {
    const venta: Venta = {
      ...datos,
      id: generarId(),
      ticket_numero: generarNumeroTicket(),
      vendedor_nombre: getVendedor(datos.vendedor_id),
      fecha: new Date(),
      estado: 'completada',
    }
    ventas = [venta, ...ventas]

    for (const item of datos.items) {
      await inventarioService.registrarMovimiento({
        producto_id: item.producto.id,
        producto_nombre: item.producto.nombre,
        tipo: 'salida',
        cantidad: item.cantidad,
        motivo: 'venta',
        fecha: venta.fecha,
        usuario_id: datos.vendedor_id,
        documento_tipo: 'venta',
        documento_id: venta.id,
      })
    }

    return venta
  },

  anular: async (id: string): Promise<Venta> => {
    const index = ventas.findIndex(v => v.id === id)
    if (index === -1) throw new Error('Venta no encontrada')
    
    const venta = ventas[index]
    if (venta.estado === 'anulada') {
      throw new Error('La venta ya está anulada')
    }

    for (const item of venta.items) {
      await inventarioService.registrarMovimiento({
        producto_id: item.producto.id,
        producto_nombre: item.producto.nombre,
        tipo: 'entrada',
        cantidad: item.cantidad,
        motivo: 'correccion',
        notas: `Anulación de venta ${venta.ticket_numero}`,
        fecha: new Date(),
        usuario_id: venta.vendedor_id,
        documento_tipo: 'venta',
        documento_id: venta.id,
      })
    }

    ventas[index] = { ...ventas[index], estado: 'anulada' }
    return ventas[index]
  },

  getCliente,

  actualizar: async (id: string, datos: Partial<Venta>): Promise<Venta> => {
    const index = ventas.findIndex(v => v.id === id)
    if (index === -1) throw new Error('Venta no encontrada')
    
    ventas[index] = { ...ventas[index], ...datos }
    return ventas[index]
  },
}
