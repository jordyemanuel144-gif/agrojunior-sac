export type TipoMedida = 'kg' | 'unidad'

export interface Categoria {
  id: string
  nombre: string
}

export interface Producto {
  id: string
  codigo: string
  nombre: string
  categoria_id: string
  tipo_medida: TipoMedida
  precio_costo: number
  precio_minorista: number
  precio_mayorista: number
  precio_especial: number
  stock_actual: number
  stock_minimo: number
  activo: boolean
  imagen_url?: string
  destacado?: boolean
  tag?: 'oferta' | 'nuevo' | null
}

export type NuevoProducto = Omit<Producto, 'id' | 'created_at'>
