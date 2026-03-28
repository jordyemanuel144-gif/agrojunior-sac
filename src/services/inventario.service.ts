import type { ItemStock } from '@/types/inventario.types'
import { productosService } from './productos.service'

let stockItems: ItemStock[] = []

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
      stock_actual: p.stock_actual,
      stock_minimo: p.stock_minimo,
      categoria: productosService.getCategoria(p.categoria_id),
      estado,
    }
  })
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
}
