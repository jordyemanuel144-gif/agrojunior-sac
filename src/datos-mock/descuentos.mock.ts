import type { TipoCliente } from '@/types/cliente.types'
import type { Producto } from '@/types/producto.types'

export const DESCUENTOS_MAYORISTA: Record<TipoCliente, number> = {
  mayorista: 0.10,
  especial: 0.05,
  minorista: 0,
}

export const PRECIO_KEY: Record<TipoCliente, keyof Producto> = {
  minorista: 'precio_minorista',
  mayorista: 'precio_mayorista',
  especial: 'precio_especial',
}
