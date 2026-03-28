export interface UUID {
  id: string
}

export interface Paginacion {
  pagina: number
  porPagina: number
  total: number
  totalPaginas: number
}

export interface RespuestaAPI<T> {
  data: T
  error?: string
}

export type OrdenTabla = 'asc' | 'desc'
