import { useState, useEffect, useMemo } from 'react'
import { ventasService } from '@/services/ventas.service'
import { comprasService } from '@/services/compras.service'
import { clientesService } from '@/services/clientes.service'
import { productosService } from '@/services/productos.service'
import type { Venta } from '@/types/venta.types'
import type { Compra } from '@/types/compra.types'
import type { Cliente } from '@/types/cliente.types'
import type { Producto } from '@/types/producto.types'

interface UseDashboardReturn {
  ventasHoy: Venta[]
  comprasHoy: Compra[]
  comparativaAyer: number
  horaPico: string
  ultimasCompras: Compra[]
  clientesPendientes: Cliente[]
  productosStockBajo: Producto[]
  productosAgotados: Producto[]
  ultimasVentas: Venta[]
  ticketPromedio: number
  totalVentasHoy: number
  totalComprasHoy: number
  metodoPagoMasUsado: string
  cargando: boolean
}

function obtenerFechaHoy(): { inicio: Date; fin: Date; inicioAyer: Date; finAyer: Date } {
  const now = new Date()
  const hoyInicio = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const hoyFin = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  
  const ayer = new Date(now)
  ayer.setDate(ayer.getDate() - 1)
  const ayerInicio = new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate())
  const ayerFin = new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate(), 23, 59, 59, 999)
  
  return { inicio: hoyInicio, fin: hoyFin, inicioAyer: ayerInicio, finAyer: ayerFin }
}

function calcularHoraPiso(ventas: Venta[]): string {
  if (ventas.length === 0) return '-'
  
  const horas: Record<number, number> = {}
  ventas.forEach(v => {
    const hora = new Date(v.fecha).getHours()
    horas[hora] = (horas[hora] || 0) + 1
  })
  
  const horaPico = Object.entries(horas).reduce((a, b) => b[1] > a[1] ? b : a)[0]
  const horaNum = parseInt(horaPico)
  
  if (horaNum === 0) return '12am'
  if (horaNum < 12) return `${horaNum}am`
  if (horaNum === 12) return '12pm'
  return `${horaNum - 12}pm`
}

export function useDashboard(): UseDashboardReturn {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [compras, setCompras] = useState<Compra[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarDatos = async () => {
      const [dataVentas, dataCompras, dataClientes, dataProductos] = await Promise.all([
        ventasService.obtenerTodos(),
        comprasService.obtenerTodos(),
        clientesService.obtenerTodos(),
        productosService.obtenerTodos()
      ])
      setVentas(dataVentas)
      setCompras(dataCompras)
      setClientes(dataClientes)
      setProductos(dataProductos)
      setCargando(false)
    }
    cargarDatos()
  }, [])

  const { inicio: hoyInicio, fin: hoyFin, inicio: inicioAyer, fin: finAyer } = useMemo(() => obtenerFechaHoy(), [])

  const ventasHoy = useMemo(() => {
    return ventas.filter(v => v.estado === 'completada' && v.fecha >= hoyInicio && v.fecha <= hoyFin)
  }, [ventas, hoyInicio, hoyFin])

  const ventasAyer = useMemo(() => {
    return ventas.filter(v => v.estado === 'completada' && v.fecha >= inicioAyer && v.fecha <= finAyer)
  }, [ventas, inicioAyer, finAyer])

  const comparativaAyer = useMemo(() => {
    const totalHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0)
    const totalAyer = ventasAyer.reduce((sum, v) => sum + v.total, 0)
    if (totalAyer === 0) return totalHoy > 0 ? 100 : 0
    return Math.round(((totalHoy - totalAyer) / totalAyer) * 100)
  }, [ventasHoy, ventasAyer])

  const horaPico = useMemo(() => calcularHoraPiso(ventasHoy), [ventasHoy])

  const comprasHoy = useMemo(() => {
    return compras.filter(c => c.estado === 'completada' && new Date(c.fecha) >= hoyInicio && new Date(c.fecha) <= hoyFin)
  }, [compras, hoyInicio, hoyFin])

  const ultimasCompras = useMemo(() => {
    return [...comprasHoy]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 3)
  }, [comprasHoy])

  const clientesPendientes = useMemo(() => {
    return clientes.filter(c => c.pendiente_aprobacion)
  }, [clientes])

  const productosStockBajo = useMemo(() => {
    return productos.filter(p => p.activo && p.stock_actual > 0 && p.stock_actual <= p.stock_minimo)
  }, [productos])

  const productosAgotados = useMemo(() => {
    return productos.filter(p => p.activo && p.stock_actual <= 0)
  }, [productos])

  const ultimasVentas = useMemo(() => {
    return [...ventasHoy]
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
      .slice(0, 5)
  }, [ventasHoy])

  const totalVentasHoy = useMemo(() => {
    return ventasHoy.reduce((sum, v) => sum + v.total, 0)
  }, [ventasHoy])

  const totalComprasHoy = useMemo(() => {
    return comprasHoy.reduce((sum, c) => sum + c.total, 0)
  }, [comprasHoy])

  const ticketPromedio = useMemo(() => {
    return ventasHoy.length > 0 ? totalVentasHoy / ventasHoy.length : 0
  }, [ventasHoy, totalVentasHoy])

  const metodoPagoMasUsado = useMemo(() => {
    if (ventasHoy.length === 0) return '-'
    const metodos: Record<string, number> = {}
    ventasHoy.forEach(v => {
      metodos[v.metodo_pago] = (metodos[v.metodo_pago] || 0) + 1
    })
    const masUsado = Object.entries(metodos).reduce((a, b) => b[1] > a[1] ? b : a)[0]
    const metodoLabels: Record<string, string> = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia',
      yape: 'Yape',
      tarjeta: 'Tarjeta'
    }
    return metodoLabels[masUsado] || masUsado
  }, [ventasHoy])

  return {
    ventasHoy,
    comprasHoy,
    comparativaAyer,
    horaPico,
    ultimasCompras,
    clientesPendientes,
    productosStockBajo,
    productosAgotados,
    ultimasVentas,
    ticketPromedio,
    totalVentasHoy,
    totalComprasHoy,
    metodoPagoMasUsado,
    cargando
  }
}
