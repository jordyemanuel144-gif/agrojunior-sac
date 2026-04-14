import type { Producto, NuevoProducto, Categoria } from '@/types/producto.types'
import { PRODUCTOS_MOCK, CATEGORIAS } from '@/datos-mock/productos.mock'
import { generarId } from '@/lib/utils'
import { configuracionService } from './configuracion.service'

let productos: Producto[] = [...PRODUCTOS_MOCK]

function calcularPrecios(precioBase: number): { precio_mayorista: number; precio_especial: number } {
  const descuentos = configuracionService.getDescuentos()
  return {
    precio_mayorista: Number((precioBase * (1 - descuentos.mayorista / 100)).toFixed(2)),
    precio_especial: Number((precioBase * (1 - descuentos.especial / 100)).toFixed(2)),
  }
}

export const productosService = {
  obtenerTodos: async (): Promise<Producto[]> => {
    return productos.filter(p => p.activo)
  },

  obtenerTodosIncluyendoInactivos: async (): Promise<Producto[]> => {
    return productos
  },

  obtenerPorId: async (id: string): Promise<Producto | null> => {
    return productos.find(p => p.id === id) ?? null
  },

  crear: async (datos: NuevoProducto): Promise<Producto> => {
    const preciosCalculados = calcularPrecios(datos.precio_minorista)
    const nuevo: Producto = {
      ...datos,
      id: generarId(),
      precio_mayorista: preciosCalculados.precio_mayorista,
      precio_especial: preciosCalculados.precio_especial,
    }
    productos = [nuevo, ...productos]
    return nuevo
  },

  actualizar: async (id: string, datos: Partial<Producto>): Promise<Producto> => {
    let productoActualizado = datos
    
    if (datos.precio_minorista) {
      const preciosCalculados = calcularPrecios(datos.precio_minorista)
      productoActualizado = {
        ...datos,
        precio_mayorista: datos.precio_mayorista ?? preciosCalculados.precio_mayorista,
        precio_especial: datos.precio_especial ?? preciosCalculados.precio_especial,
      }
    }
    
    productos = productos.map(p =>
      p.id === id ? { ...p, ...productoActualizado } : p
    )
    return productos.find(p => p.id === id)!
  },

  eliminar: async (id: string): Promise<void> => {
    productos = productos.map(p =>
      p.id === id ? { ...p, activo: false } : p
    )
  },

  getProducto: (id: string): string => {
    const producto = productos.find(p => p.id === id)
    return producto?.nombre ?? 'Producto no encontrado'
  },

  getCategoria: (categoriaId: string): string => {
    const categoria = CATEGORIAS.find(c => c.id === categoriaId)
    return categoria?.nombre ?? categoriaId
  },

  obtenerCategorias: async (): Promise<Categoria[]> => {
    return CATEGORIAS
  },

  obtenerDestacados: async (): Promise<Producto[]> => {
    return productos.filter(p => p.activo && p.destacado === true)
  },
}
