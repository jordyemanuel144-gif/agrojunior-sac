// HistorialVentasCliente - Muestra el historial de ventas de un cliente
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ventasService } from '@/services/ventas.service'
import { formatMoneda, formatFecha } from '@/lib/utils'
import { RUTAS } from '@/config/rutas'
import type { Venta } from '@/types/venta.types'
import { ShoppingCart, ChevronRight } from 'lucide-react'

interface HistorialVentasClienteProps {
  clienteId: string
}

export function HistorialVentasCliente({ clienteId }: HistorialVentasClienteProps) {
  const navigate = useNavigate()
  const [ventas, setVentas] = useState<Venta[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    ventasService.obtenerPorCliente(clienteId)
      .then(setVentas)
      .finally(() => setCargando(false))
  }, [clienteId])

  const totalGastado = ventas
    .filter(v => v.estado === 'completada')
    .reduce((sum, v) => sum + v.total, 0)

  const ultimaVenta = ventas.length > 0 ? ventas[0] : null

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (ventas.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No hay ventas registradas</p>
        <p className="text-gray-400 text-xs mt-1">Las ventas aparecerán aquí</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ventas</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{ventas.length}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{formatMoneda(totalGastado)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Última</p>
          <p className="text-sm font-bold text-gray-900 mt-1">
            {ultimaVenta ? formatFecha(ultimaVenta.fecha) : '-'}
          </p>
        </div>
      </div>

      {/* Lista de ventas */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Historial de Ventas
        </h3>
        
        {/* Mobile: cards apiladas */}
        <div className="md:hidden space-y-2">
          {ventas.map((venta) => (
            <button
              key={venta.id}
              onClick={() => navigate(`${RUTAS.ADMIN.VENTAS}/${venta.id}`)}
              className="w-full bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${venta.estado === 'completada' ? 'bg-green-500' : 'bg-red-400'}`} />
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">{venta.ticket_numero}</p>
                  <p className="text-xs text-gray-400">{formatFecha(venta.fecha)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-600">{formatMoneda(venta.total)}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          ))}
        </div>

        {/* Desktop: tabla */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Número</th>
                <th className="pb-2">Items</th>
                <th className="pb-2 text-right">Total</th>
                <th className="pb-2 text-center">Estado</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr
                  key={venta.id}
                  onClick={() => navigate(`${RUTAS.ADMIN.VENTAS}/${venta.id}`)}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 text-sm text-gray-700">{formatFecha(venta.fecha)}</td>
                  <td className="py-3 text-sm font-medium text-gray-900">{venta.ticket_numero}</td>
                  <td className="py-3 text-sm text-gray-500">{venta.items.length} items</td>
                  <td className="py-3 text-sm font-bold text-blue-600 text-right">{formatMoneda(venta.total)}</td>
                  <td className="py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      venta.estado === 'completada'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {venta.estado === 'completada' ? 'Completada' : 'Anulada'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <ChevronRight className="w-4 h-4 text-gray-400 inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}