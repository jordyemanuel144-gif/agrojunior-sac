import type { Producto, NuevoProducto } from '@/types/producto.types'
import { PRODUCTOS_MOCK, CATEGORIAS } from '@/datos-mock/productos.mock'
import { generarId } from '@/lib/utils'

let productos: Producto[] = [...PRODUCTOS_MOCK]

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
    const nuevo: Producto = {
      ...datos,
      id: generarId(),
    }
    productos = [nuevo, ...productos]
    return nuevo
  },

  actualizar: async (id: string, datos: Partial<Producto>): Promise<Producto> => {
    productos = productos.map(p =>
      p.id === id ? { ...p, ...datos } : p
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
}
