import type { ItemStock, MovimientoInventario, ConteoInventario, ItemConteo, EstadoConteo } from '@/types/inventario.types'
import { MOVIMIENTOS_MOCK, CONTEOS_MOCK } from '@/datos-mock/inventario.mock'
import { productosService } from './productos.service'
import { generarId } from '@/lib/utils'

let stockItems: ItemStock[] = []
let movimientos: MovimientoInventario[] = [...MOVIMIENTOS_MOCK]
let conteos: ConteoInventario[] = [...CONTEOS_MOCK]

async function calcularStock(): Promise<ItemStock[]> {
  const productos = await productosService.obtenerTodosIncluyendoInactivos()
  
  return productos.map(p => {
    let estado: 'ok' | 'bajo' | 'agotado'
    if (p.stock_actual === 0) {
      estado = 'agotado'
    } else if (p.stock_actual <= p.stock_minimo) {
      estado = 'bajo'
    } else {
      estado = 'ok'
    }

    return {
      id: p.id,
      nombre: p.nombre,
      codigo: p.codigo,
      stock_actual: p.stock_actual,
      stock_minimo: p.stock_minimo,
      tipo_medida: p.tipo_medida,
      categoria: productosService.getCategoria(p.categoria_id),
      estado,
    }
  })
}

function generarNumeroConteo(): string {
  const num = conteos.length + 1
  return `INV-${num.toString().padStart(4, '0')}`
}

function calcularMovimientosDelProducto(productoId: string): MovimientoInventario[] {
  return movimientos
    .filter(m => m.producto_id === productoId)
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
}

export const inventarioService = {
  obtenerStock: async (): Promise<ItemStock[]> => {
    stockItems = await calcularStock()
    return stockItems
  },

  obtenerStockPorId: async (id: string): Promise<ItemStock | null> => {
    if (stockItems.length === 0) {
      stockItems = await calcularStock()
    }
    return stockItems.find(s => s.id === id) ?? null
  },

  obtenerMovimientosPorProducto: async (productoId: string): Promise<MovimientoInventario[]> => {
    return calcularMovimientosDelProducto(productoId)
  },

  obtenerTodosLosMovimientos: async (): Promise<MovimientoInventario[]> => {
    return [...movimientos].sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
  },

  registrarMovimiento: async (datos: Omit<MovimientoInventario, 'id'>): Promise<MovimientoInventario> => {
    const movimiento: MovimientoInventario = {
      ...datos,
      id: generarId(),
    }
    movimientos.push(movimiento)

    const producto = await productosService.obtenerPorId(datos.producto_id)
    if (producto) {
      const nuevoStock = datos.tipo === 'entrada'
        ? producto.stock_actual + datos.cantidad
        : producto.stock_actual - datos.cantidad
      
      await productosService.actualizar(producto.id, { stock_actual: nuevoStock })
      stockItems = await calcularStock()
    }

    return movimiento
  },

  obtenerConteos: async (): Promise<ConteoInventario[]> => {
    return [...conteos].sort((a, b) => b.fecha.localeCompare(a.fecha))
  },

  obtenerConteoPorId: async (id: string): Promise<ConteoInventario | null> => {
    return conteos.find(c => c.id === id) ?? null
  },

  crearConteo: async (datos: { items: { producto_id: string; stock_fisico: number }[] }, usuarioId: string, usuarioNombre: string): Promise<ConteoInventario> => {
    const productos = await productosService.obtenerTodosIncluyendoInactivos()
    
    const itemsConteo: ItemConteo[] = datos.items.map(item => {
      const producto = productos.find(p => p.id === item.producto_id)
      const stockSistema = producto?.stock_actual ?? 0
      return {
        producto_id: item.producto_id,
        producto_nombre: producto?.nombre ?? 'Desconocido',
        stock_sistema: stockSistema,
        stock_fisico: item.stock_fisico,
        diferencia: item.stock_fisico - stockSistema,
      }
    })

    const conteo: ConteoInventario = {
      id: generarId(),
      numero: generarNumeroConteo(),
      usuario_id: usuarioId,
      usuario_nombre: usuarioNombre,
      items: itemsConteo,
      estado: 'borrador',
      fecha: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }

    conteos.push(conteo)

    return conteo
  },

  anConteo: async (id: string): Promise<ConteoInventario> => {
    const index = conteos.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Conteo no encontrado')
    conteos[index] = { ...conteos[index], estado: 'anulado' }
    return conteos[index]
  },

  actualizarConteo: async (id: string, datos: Partial<ConteoInventario>): Promise<ConteoInventario> => {
    const index = conteos.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Conteo no encontrado')
    
    const conteoActual = conteos[index]
    if (conteoActual.estado !== 'borrador') {
      throw new Error('Solo se pueden editar conteos en estado borrador')
    }

    const conteoActualizado = { ...conteoActual, ...datos }
    conteos[index] = conteoActualizado
    return conteoActualizado
  },

  actualizarItemConteo: async (conteoId: string, productoId: string, stockFisico: number): Promise<ConteoInventario> => {
    const index = conteos.findIndex(c => c.id === conteoId)
    if (index === -1) throw new Error('Conteo no encontrado')
    
    const conteo = conteos[index]
    if (conteo.estado !== 'borrador') {
      throw new Error('Solo se pueden editar conteos en estado borrador')
    }

    const itemsActualizados = conteo.items.map(item => {
      if (item.producto_id === productoId) {
        return {
          ...item,
          stock_fisico: stockFisico,
          diferencia: stockFisico - item.stock_sistema,
        }
      }
      return item
    })

    conteos[index] = { ...conteo, items: itemsActualizados }
    return conteos[index]
  },

  completarConteo: async (id: string, _usuarioId: string): Promise<ConteoInventario> => {
    const index = conteos.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Conteo no encontrado')
    
    const conteo = conteos[index]
    if (conteo.estado !== 'borrador') {
      throw new Error('Solo se pueden completar conteos en estado borrador')
    }

    const conteoActualizado = { ...conteo, estado: 'completado' as EstadoConteo }

    for (const item of conteo.items) {
      if (item.diferencia !== 0) {
        const tipo: 'entrada' | 'salida' = item.diferencia > 0 ? 'entrada' : 'salida'
        
        const producto = await productosService.obtenerPorId(item.producto_id)
        if (producto) {
          const nuevoStock = tipo === 'entrada' 
            ? producto.stock_actual + Math.abs(item.diferencia)
            : producto.stock_actual - Math.abs(item.diferencia)
          
          await productosService.actualizar(producto.id, { stock_actual: nuevoStock })

          movimientos.push({
            id: generarId(),
            producto_id: item.producto_id,
            producto_nombre: item.producto_nombre,
            tipo,
            cantidad: Math.abs(item.diferencia),
            motivo: tipo === 'entrada' ? 'correccion' : 'merma',
            notas: `Conteo ${conteo.numero}`,
            fecha: new Date(),
            usuario_id: _usuarioId || 'usr_default',
            documento_tipo: 'conteo',
            documento_id: conteo.id,
          })
        }
      }
    }

    stockItems = await calcularStock()
    conteos[index] = conteoActualizado
    
    return conteoActualizado
  },
}
