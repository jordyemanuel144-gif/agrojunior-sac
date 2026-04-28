import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Filter } from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'
import { comprobantesService } from '@/services/comprobantes.service'
import { RUTAS } from '@/config/rutas'
import { PageHeaderCliente } from '@/components/layout/PageHeaderCliente'
import { formatMoneda, formatFecha } from '@/lib/utils'
import type { Comprobante } from '@/types/comprobante.types'

type FiltroEstado = 'todos' | 'activo' | 'anulado'

export default function ComprobantesPage() {
  const navigate = useNavigate()
  const { clienteData } = useAuthContext()
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos')

  useEffect(() => {
    const cargarDatos = async () => {
      if (!clienteData) return

      const todosComprobantes = await comprobantesService.obtenerPorCliente(clienteData.id)
      const soloPagos = todosComprobantes.filter(c => c.tipo === 'pago_cobranza')
      setComprobantes(soloPagos)
      setLoading(false)
    }

    cargarDatos()
  }, [clienteData])

  const comprobantesFiltrados = comprobantes.filter(c => {
    if (filtroEstado !== 'todos' && c.estado !== filtroEstado) return false
    return true
  })

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Activo</span>
      case 'anulado':
        return <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">Anulado</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeaderCliente titulo="Mis Comprobantes" icono={FileText} stats={[{ label: 'Total', value: comprobantesFiltrados.length }]} />

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
            <option value="activo">Activos</option>
            <option value="anulado">Anulados</option>
          </select>
        </div>
      </div>

      {comprobantesFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <FileText size={48} className="mb-3 opacity-50" />
            <p className="text-base font-medium">No hay comprobantes</p>
            <p className="text-sm mt-1">Prueba con otros filtros</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {comprobantesFiltrados.map(item => (
              <button
                key={item.id}
                onClick={() => navigate(`${RUTAS.CLIENTE.COMPROBANTES}/${item.id}`)}
                className="w-full flex items-center gap-3 md:gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText size={20} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{item.numero}</p>
                  <p className="text-xs text-gray-400">{formatFecha(item.fecha)} {item.hora && `• ${item.hora}`}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-green-600">{formatMoneda(item.total)}</p>
                  <div className="mt-1">{getEstadoBadge(item.estado)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
