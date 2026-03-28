import { CATEGORIAS } from '@/datos-mock/productos.mock'
import type { Categoria } from '@/types/producto.types'

export const categoriasService = {
  obtenerTodos: async (): Promise<Categoria[]> => {
    return CATEGORIAS
  },

  obtenerPorId: async (id: string): Promise<Categoria | null> => {
    return CATEGORIAS.find((c: Categoria) => c.id === id) ?? null
  },
}
