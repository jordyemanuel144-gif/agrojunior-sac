import { useState, useMemo, useCallback, useEffect } from 'react'
import { ventasService } from '@/services/ventas.service'
import { comprasService } from '@/services/compras.service'
import type { Venta } from '@/types/venta.types'
import type { Compra } from '@/types/compra.types'
import type { FiltroFecha, RangoFiltro, DatoGrafico, DatoGraficoDual, ResumenMetodoPago, ResumenEstadisticas } from '@/types/reportes.types'

export function useReportes() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [compras, setCompras] = useState<Compra[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState<FiltroFecha>({ tipo: 'mes' })

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    const [dataVentas, dataCompras] = await Promise.all([
      ventasService.obtenerTodos(),
      comprasService.obtenerTodos()
    ])
    setVentas(dataVentas)
    setCompras(dataCompras)
    setCargando(false)
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const obtenerRangoFechas = (tipo: RangoFiltro, personalizado?: { inicio: Date; fin: Date }): { inicio: Date; fin: Date } => {
    const now = new Date()
    const inicio = new Date()
    const fin = new Date()

    switch (tipo) {
      case 'hoy':
        inicio.setHours(0, 0, 0, 0)
        fin.setHours(23, 59, 59, 999)
        break
      case 'semana':
        inicio.setDate(now.getDate() - now.getDay())
        inicio.setHours(0, 0, 0, 0)
        fin.setHours(23, 59, 59, 999)
        break
      case 'mes':
        inicio.setDate(1)
        inicio.setHours(0, 0, 0, 0)
        fin.setHours(23, 59, 59, 999)
        break
      case 'personalizado':
        if (personalizado) {
          return personalizado
        }
        break
    }

    return { inicio, fin }
  }

  const ventasFiltradas = useMemo(() => {
    const rango = obtenerRangoFechas(filtro.tipo, filtro.fechaInicio && filtro.fechaFin ? { inicio: filtro.fechaInicio, fin: filtro.fechaFin } : undefined)
    return ventas.filter(v => v.estado === 'completada' && v.fecha >= rango.inicio && v.fecha <= rango.fin)
  }, [ventas, filtro])

  const comprasFiltradas = useMemo(() => {
    const rango = obtenerRangoFechas(filtro.tipo, filtro.fechaInicio && filtro.fechaFin ? { inicio: filtro.fechaInicio, fin: filtro.fechaFin } : undefined)
    return compras.filter(c => c.estado === 'completada' && new Date(c.fecha) >= rango.inicio && new Date(c.fecha) <= rango.fin)
  }, [compras, filtro])

  const estadisticas = useMemo((): ResumenEstadisticas => {
    const totalVentas = ventasFiltradas.length
    const totalIngresos = ventasFiltradas.reduce((sum, v) => sum + v.total, 0)
    const promedioVenta = totalVentas > 0 ? totalIngresos / totalVentas : 0
    const ventaMasAlta = totalVentas > 0 ? Math.max(...ventasFiltradas.map(v => v.total)) : 0
    const cantidadProductosVendidos = ventasFiltradas.reduce((sum, v) => sum + v.items.reduce((s, i) => s + i.cantidad, 0), 0)

    const totalCompras = comprasFiltradas.length
    const totalGastos = comprasFiltradas.reduce((sum, c) => sum + c.total, 0)
    const promedioCompra = totalCompras > 0 ? totalGastos / totalCompras : 0
    const compraMasAlta = totalCompras > 0 ? Math.max(...comprasFiltradas.map(c => c.total)) : 0
    const cantidadProductosComprados = comprasFiltradas.reduce((sum, c) => sum + c.items.reduce((s, i) => s + i.cantidad, 0), 0)

    const gananciaNeta = totalIngresos - totalGastos
    const margenGanancia = totalIngresos > 0 ? (gananciaNeta / totalIngresos) * 100 : 0

    return {
      ventas: { totalVentas, totalIngresos, promedioVenta, ventaMasAlta, ventaMasBaja: 0, cantidadProductosVendidos },
      compras: { totalCompras, totalGastos, promedioCompra, compraMasAlta, cantidadProductosComprados },
      gananciaNeta,
      margenGanancia
    }
  }, [ventasFiltradas, comprasFiltradas])

  const ventasPorProducto = useMemo((): DatoGrafico[] => {
    const productos: Record<string, number> = {}
    ventasFiltradas.forEach(v => {
      v.items.forEach(item => {
        const nombre = item.producto.nombre
        productos[nombre] = (productos[nombre] || 0) + item.cantidad
      })
    })
    return Object.entries(productos)
      .map(([nombre, valor]) => ({ nombre, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 8)
  }, [ventasFiltradas])

  const ingresosPorProducto = useMemo((): DatoGrafico[] => {
    const productos: Record<string, number> = {}
    ventasFiltradas.forEach(v => {
      v.items.forEach(item => {
        const nombre = item.producto.nombre
        productos[nombre] = (productos[nombre] || 0) + item.subtotal
      })
    })
    return Object.entries(productos)
      .map(([nombre, valor]) => ({ nombre, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 8)
  }, [ventasFiltradas])

  const ventasVsComprasPorDia = useMemo((): DatoGraficoDual[] => {
    const dias: Record<string, { ventas: number; compras: number }> = {}
    
    ventasFiltradas.forEach(v => {
      const fecha = v.fecha.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' })
      if (!dias[fecha]) dias[fecha] = { ventas: 0, compras: 0 }
      dias[fecha].ventas += v.total
    })

    comprasFiltradas.forEach(c => {
      const fecha = new Date(c.fecha).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' })
      if (!dias[fecha]) dias[fecha] = { ventas: 0, compras: 0 }
      dias[fecha].compras += c.total
    })

    return Object.entries(dias).map(([nombre, data]) => ({ nombre, ...data }))
  }, [ventasFiltradas, comprasFiltradas])

  const ventasPorDia = useMemo((): DatoGrafico[] => {
    const dias: Record<string, number> = {}
    ventasFiltradas.forEach(v => {
      const fecha = v.fecha.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' })
      dias[fecha] = (dias[fecha] || 0) + v.total
    })
    return Object.entries(dias).map(([nombre, valor]) => ({ nombre, valor }))
  }, [ventasFiltradas])

  const comprasPorDia = useMemo((): DatoGrafico[] => {
    const dias: Record<string, number> = {}
    comprasFiltradas.forEach(c => {
      const fecha = new Date(c.fecha).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' })
      dias[fecha] = (dias[fecha] || 0) + c.total
    })
    return Object.entries(dias).map(([nombre, valor]) => ({ nombre, valor }))
  }, [comprasFiltradas])

  const ventasPorMetodoPago = useMemo((): ResumenMetodoPago[] => {
    const metodos: Record<string, { cantidad: number; total: number }> = {}
    ventasFiltradas.forEach(v => {
      if (!metodos[v.metodo_pago]) {
        metodos[v.metodo_pago] = { cantidad: 0, total: 0 }
      }
      metodos[v.metodo_pago].cantidad++
      metodos[v.metodo_pago].total += v.total
    })
    return Object.entries(metodos).map(([metodo, data]) => ({ metodo: metodo as any, ...data }))
  }, [ventasFiltradas])

  const actualizarFiltro = (nuevoFiltro: FiltroFecha) => {
    setFiltro(nuevoFiltro)
  }

  return {
    ventasFiltradas,
    comprasFiltradas,
    cargando,
    filtro,
    estadisticas,
    ventasPorProducto,
    ingresosPorProducto,
    ventasVsComprasPorDia,
    ventasPorDia,
    comprasPorDia,
    ventasPorMetodoPago,
    actualizarFiltro,
  }
}
