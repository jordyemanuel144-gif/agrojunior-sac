import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt, Filter, CheckCircle, XCircle } from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'
import { ventasService } from '@/services/ventas.service'
import { RUTAS } from '@/config/rutas'
import { PageHeaderCliente } from '@/components/layout/PageHeaderCliente'
import { formatMoneda, formatFecha } from '@/lib/utils'
import type { Venta } from '@/types/venta.types'

type FiltroEstado = 'todos' | 'completada' | 'anulada'
type FiltroPago = 'todos' | 'pagado' | 'pendiente' | 'parcial'

export default function VentasPage() {
  const navigate = useNavigate()
  const { clienteData } = useAuthContext()
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos')
  const [filtroPago, setFiltroPago] = useState<FiltroPago>('todos')

useEffect(() => {
    const cargarVentas = async () => {
      if (!clienteData) return

      const misVentas = await ventasService.obtenerPorCliente(clienteData.id)
      setVentas(misVentas)
      setLoading(false)
    }

    cargarVentas()
  }, [clienteData])

  const ventasFiltradas = ventas.filter(v => {
    if (filtroEstado !== 'todos' && v.estado !== filtroEstado) return false
    if (filtroPago !== 'todos' && v.estado_pago !== filtroPago) return false
    return true
  })

  const getEstadoBadge = (estado?: string) => {
    switch (estado) {
      case 'completada':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
          <CheckCircle size={12} />Completada
        </span>
      case 'anulada':
        return <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full flex items-center gap-1">
          <XCircle size={12} />Anulada
        </span>
      default:
        return null
    }
  }

  const getPagoBadge = (estado?: string) => {
    switch (estado) {
      case 'pagado':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Pagado</span>
      case 'pendiente':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Pendiente</span>
      case 'parcial':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">Parcial</span>
      default:
        return null
    }
  }

  const totalVentas = ventasFiltradas.reduce((sum, v) => sum + v.total, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeaderCliente titulo="Mis Compras" icono={Receipt} stats={[{ label: 'Registros', value: ventasFiltradas.length }]} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-400 uppercase">Filtros</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value as FiltroEstado)}
            className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300"
          >
            <option value="todos">Todos los estados</option>
            <option value="completada">Completadas</option>
            <option value="anulada">Anuladas</option>
          </select>
          <select
            value={filtroPago}
            onChange={e => setFiltroPago(e.target.value as FiltroPago)}
            className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300"
          >
            <option value="todos">Todos los pagos</option>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
            <option value="parcial">Parcial</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase">Total</p>
            <p className="text-xl font-bold text-gray-900">{formatMoneda(totalVentas)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase">Registros</p>
            <p className="text-xl font-bold text-blue-600">{ventasFiltradas.length}</p>
          </div>
        </div>
      </div>

      {ventasFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Receipt size={48} className="mb-3 opacity-50" />
            <p className="text-base font-medium">No hay ventas</p>
            <p className="text-sm mt-1">Prueba con otros filtros</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {ventasFiltradas.map(venta => (
              <button
                key={venta.id}
                onClick={() => navigate(`${RUTAS.CLIENTE.VENTAS}/${venta.id}`)}
                className="w-full flex items-center gap-3 md:gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Receipt size={20} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{venta.ticket_numero}</p>
                  <p className="text-xs text-gray-400">{formatFecha(venta.fecha)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900">{formatMoneda(venta.total)}</p>
                  <div className="mt-1">{getPagoBadge(venta.estado_pago)}</div>
                </div>
                <div className="flex-shrink-0">{getEstadoBadge(venta.estado)}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}