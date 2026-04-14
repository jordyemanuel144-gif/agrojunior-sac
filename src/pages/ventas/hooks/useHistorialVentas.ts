// useHistorialVentas - Lógica del historial de ventas con filtrado por rol
import { useState, useEffect, useMemo } from 'react'
import { useAuthContext } from '@/context/AuthContext'
import { ventasService } from '@/services/ventas.service'
import { usuariosService } from '@/services/usuarios.service'
import type { Venta } from '@/types/venta.types'
import type { User } from '@/types/usuario.types'
import type { RangoFecha } from '@/lib/utils'
import {
  esHoy,
  esEstaSemana,
  esEsteMes,
  estaEnRango,
  getFechaISO,
} from '@/lib/utils'

interface UseHistorialVentasReturn {
  ventas: Venta[]
  loading: boolean
  busqueda: string
  filtroEstado: 'todos' | 'completada' | 'anulada'
  filtroPago: 'todos' | 'pagado' | 'parcial' | 'pendiente'
  filtroFecha: RangoFecha
  rangoPersonalizado: { inicio: string; fin: string }
  filtroVendedor: string
  vendedores: User[]
  esAdmin: boolean
  completadas: number
  totalDia: number
  anuladas: number
  setBusqueda: (value: string) => void
  setFiltroEstado: (value: 'todos' | 'completada' | 'anulada') => void
  setFiltroPago: (value: 'todos' | 'pagado' | 'parcial' | 'pendiente') => void
  setFiltroFecha: (value: RangoFecha) => void
  setRangoPersonalizado: (value: { inicio: string; fin: string }) => void
  setFiltroVendedor: (value: string) => void
}

export function useHistorialVentas(): UseHistorialVentasReturn {
  const { user, isAdmin } = useAuthContext()
  const [ventas, setVentas] = useState<Venta[]>([])
  const [vendedores, setVendedores] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'completada' | 'anulada'>('todos')
  const [filtroPago, setFiltroPago] = useState<'todos' | 'pagado' | 'parcial' | 'pendiente'>('todos')
  const [filtroFecha, setFiltroFecha] = useState<RangoFecha>('hoy')
  const [rangoPersonalizado, setRangoPersonalizado] = useState({
    inicio: getFechaISO(new Date()),
    fin: getFechaISO(new Date()),
  })
  const [filtroVendedor, setFiltroVendedor] = useState('todos')

  // Cargar ventas y vendedores
  useEffect(() => {
    Promise.all([
      ventasService.obtenerTodos(),
      usuariosService.obtenerActivos(),
    ])
      .then(([ventasData, usuariosData]) => {
        setVentas(ventasData)
        setVendedores(usuariosData.filter(u => u.role === 'vendedor'))
      })
      .finally(() => setLoading(false))
  }, [])

  // Filtrar ventas según rol y filtros
  const ventasFiltradas = useMemo(() => {
    return ventas.filter(v => {
      // Filtrar por vendedor según rol
      const esVendedor = !isAdmin
      if (esVendedor && v.vendedor_id !== user?.id) {
        return false
      }
      if (isAdmin && filtroVendedor !== 'todos' && v.vendedor_id !== filtroVendedor) {
        return false
      }

      // Filtro búsqueda
      const matchBusqueda =
        busqueda === '' ||
        v.ticket_numero.toLowerCase().includes(busqueda.toLowerCase()) ||
        ventasService.getCliente(v.cliente_id).nombre.toLowerCase().includes(busqueda.toLowerCase())

      // Filtro estado
      const matchEstado = filtroEstado === 'todos' || v.estado === filtroEstado

      // Filtro pago
      const matchPago = filtroPago === 'todos' || v.estado_pago === filtroPago

      // Filtro fecha
      let matchFecha = true
      if (filtroFecha === 'hoy') {
        matchFecha = esHoy(v.fecha)
      } else if (filtroFecha === 'semana') {
        matchFecha = esEstaSemana(v.fecha)
      } else if (filtroFecha === 'mes') {
        matchFecha = esEsteMes(v.fecha)
      } else if (filtroFecha === 'rango') {
        matchFecha = estaEnRango(v.fecha, rangoPersonalizado.inicio, rangoPersonalizado.fin)
      }

      return matchBusqueda && matchEstado && matchPago && matchFecha
    })
  }, [ventas, busqueda, filtroEstado, filtroPago, filtroFecha, rangoPersonalizado, filtroVendedor, isAdmin, user])

  const completadas = ventasFiltradas.filter(v => v.estado === 'completada')
  const totalDia = completadas.reduce((acc, v) => acc + v.total, 0)
  const anuladas = ventasFiltradas.filter(v => v.estado === 'anulada').length

  return {
    ventas: ventasFiltradas,
    loading,
    busqueda,
    filtroEstado,
    filtroPago,
    filtroFecha,
    rangoPersonalizado,
    filtroVendedor,
    vendedores,
    esAdmin: isAdmin,
    completadas: completadas.length,
    totalDia,
    anuladas,
    setBusqueda,
    setFiltroEstado,
    setFiltroPago,
    setFiltroFecha,
    setRangoPersonalizado,
    setFiltroVendedor,
  }
}
