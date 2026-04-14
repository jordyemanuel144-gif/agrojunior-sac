import type { MetodoPago } from './venta.types'

export type RangoFiltro = 'hoy' | 'semana' | 'mes' | 'personalizado'

export interface FiltroFecha {
  tipo: RangoFiltro
  fechaInicio?: Date
  fechaFin?: Date
}

export interface DatoGrafico {
  nombre: string
  valor: number
  color?: string
}

export interface DatoGraficoDual {
  nombre: string
  ventas: number
  compras: number
}

export interface EstadisticasVentas {
  totalVentas: number
  totalIngresos: number
  promedioVenta: number
  ventaMasAlta: number
  ventaMasBaja: number
  cantidadProductosVendidos: number
}

export interface EstadisticasCompras {
  totalCompras: number
  totalGastos: number
  promedioCompra: number
  compraMasAlta: number
  cantidadProductosComprados: number
}

export interface ResumenMetodoPago {
  metodo: MetodoPago
  cantidad: number
  total: number
}

export interface ResumenEstadisticas {
  ventas: EstadisticasVentas
  compras: EstadisticasCompras
  gananciaNeta: number
  margenGanancia: number
}
