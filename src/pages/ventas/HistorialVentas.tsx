// HistorialVentas - Lista todas las ventas con filtros
import { useState, useEffect, useMemo } from 'react'
import { Layout } from '@/components/layout/Layout'
import { HeaderVentas } from './components/HeaderVentas'
import { FiltrosVentas } from './components/FiltrosVentas'
import { ListaVentas } from './components/ListaVentas'
import { ventasService } from '@/services/ventas.service'
import type { Venta } from '@/types/venta.types'

export default function HistorialVentas() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'completada' | 'anulada'>('todos')
  const [filtroFecha, setFiltroFecha] = useState('')

  useEffect(() => {
    ventasService.obtenerTodos()
      .then(setVentas)
      .finally(() => setLoading(false))
  }, [])

  const ventasFiltradas = useMemo(() => {
    return ventas.filter(v => {
      const matchBusqueda =
        busqueda === '' ||
        v.ticket_numero.toLowerCase().includes(busqueda.toLowerCase()) ||
        ventasService.getCliente(v.cliente_id).nombre.toLowerCase().includes(busqueda.toLowerCase())

      const matchEstado = filtroEstado === 'todos' || v.estado === filtroEstado
      const matchFecha = filtroFecha === '' || v.fecha.toISOString().split('T')[0] === filtroFecha

      return matchBusqueda && matchEstado && matchFecha
    })
  }, [ventas, busqueda, filtroEstado, filtroFecha])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <HeaderVentas ventas={ventasFiltradas} />

        <div className="max-w-screen-xl mx-auto">
          <FiltrosVentas
            busqueda={busqueda}
            filtroEstado={filtroEstado}
            filtroFecha={filtroFecha}
            onBusquedaChange={setBusqueda}
            onEstadoChange={setFiltroEstado}
            onFechaChange={setFiltroFecha}
          />

          <ListaVentas ventas={ventasFiltradas} />
        </div>
      </div>
    </Layout>
  )
}
