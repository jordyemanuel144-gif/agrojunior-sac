// Service para gestión de compras
import { COMPRAS_MOCK } from '@/datos-mock/compras.mock'
import { proveedoresService } from './proveedores.service'
import { productosService } from './productos.service'
import { configuracionService } from './configuracion.service'
import { inventarioService } from './inventario.service'
import type { Compra, NuevaCompra, ItemCompra } from '@/types/compra.types'
import { generarId } from '@/lib/utils'

let compras = [...COMPRAS_MOCK]

export const comprasService = {
  obtenerTodos: async (): Promise<Compra[]> => {
    return [...compras].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  },

  obtenerPorId: async (id: string): Promise<Compra | null> => {
    return compras.find(c => c.id === id) ?? null
  },

  crear: async (
    datos: NuevaCompra,
    items: Array<{ producto_id: string; cantidad: number; precio_unitario: number }>
  ): Promise<Compra> => {
    const numeroCorrelativo = String(compras.length + 1).padStart(5, '0')

    const itemsCompra: ItemCompra[] = items.map(item => ({
      id: generarId(),
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      total: item.cantidad * item.precio_unitario,
    }))

    const subtotal = itemsCompra.reduce((sum, item) => sum + item.total, 0)
    const igvConfig = configuracionService.getIGV()
    const igv = igvConfig.activo ? subtotal * (igvConfig.porcentaje / 100) : 0
    const total = subtotal + igv

    const nueva: Compra = {
      ...datos,
      id: generarId(),
      numero: `C-${numeroCorrelativo}`,
      items: itemsCompra,
      subtotal,
      igv,
      total,
      estado: 'completada',
      fecha: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }

    for (const item of items) {
      const producto = await productosService.obtenerPorId(item.producto_id)
      if (producto) {
        await productosService.actualizar(item.producto_id, {
          stock_actual: producto.stock_actual + item.cantidad,
        })
      }
    }

    for (const item of itemsCompra) {
      const producto = await productosService.obtenerPorId(item.producto_id)
      await inventarioService.registrarMovimiento({
        producto_id: item.producto_id,
        producto_nombre: producto?.nombre ?? 'Desconocido',
        tipo: 'entrada',
        cantidad: item.cantidad,
        motivo: 'compra',
        fecha: new Date(),
        usuario_id: datos.usuario_id,
        documento_tipo: 'compra',
        documento_id: nueva.id,
      })
    }

    compras = [...compras, nueva]
    return nueva
  },

  // Anula una compra
  anular: async (id: string): Promise<Compra> => {
    const index = compras.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Compra no encontrada')
    
    const compra = compras[index]
    if (compra.estado === 'anulada') {
      throw new Error('La compra ya está anulada')
    }

    for (const item of compra.items) {
      const producto = await productosService.obtenerPorId(item.producto_id)
      await inventarioService.registrarMovimiento({
        producto_id: item.producto_id,
        producto_nombre: producto?.nombre ?? 'Desconocido',
        tipo: 'salida',
        cantidad: item.cantidad,
        motivo: 'correccion',
        notas: `Anulación de compra ${compra.numero}`,
        fecha: new Date(),
        usuario_id: compra.usuario_id,
        documento_tipo: 'compra',
        documento_id: compra.id,
      })
    }

    compras[index] = { ...compras[index], estado: 'anulada' }
    return compras[index]
  },

  // Obtiene todas las compras de un proveedor específico
  obtenerPorProveedor: async (proveedorId: string): Promise<Compra[]> => {
    return compras
      .filter(c => c.proveedor_id === proveedorId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  },

  // Helper para obtener nombre de proveedor
  getProveedor: (proveedorId: string): string => {
    const prov = proveedoresService.getProveedor(proveedorId)
    return prov?.nombre ?? 'Proveedor no encontrado'
  },

  getProductoInfo: async (productoId: string): Promise<{ nombre: string; unidad: string }> => {
    const producto = await productosService.obtenerPorId(productoId)
    return {
      nombre: producto?.nombre ?? 'Producto no encontrado',
      unidad: producto?.tipo_medida ?? 'unidad',
    }
  },

  // Genera número correlativo para nueva compra
  generarNumero: (): string => {
    const numeroCorrelativo = String(compras.length + 1).padStart(5, '0')
    return `C-${numeroCorrelativo}`
  },
}
