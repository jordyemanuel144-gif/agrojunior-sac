// HistorialComprasProveedor - Muestra el historial de compras de un proveedor
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { comprasService } from '@/services/compras.service'
import { formatMoneda, formatFecha } from '@/lib/utils'
import { RUTAS } from '@/config/rutas'
import type { Compra } from '@/types/compra.types'
import { Package, ChevronRight } from 'lucide-react'

interface HistorialComprasProveedorProps {
  proveedorId: string
}

export function HistorialComprasProveedor({ proveedorId }: HistorialComprasProveedorProps) {
  const navigate = useNavigate()
  const [compras, setCompras] = useState<Compra[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    comprasService.obtenerPorProveedor(proveedorId)
      .then(setCompras)
      .finally(() => setCargando(false))
  }, [proveedorId])

  const totalGastado = compras
    .filter(c => c.estado === 'completada')
    .reduce((sum, c) => sum + c.total, 0)

  const ultimaCompra = compras.length > 0 ? compras[0] : null

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (compras.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No hay compras registradas</p>
        <p className="text-gray-400 text-xs mt-1">Las compras aparecerán aquí</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Compras</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{compras.length}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{formatMoneda(totalGastado)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Última</p>
          <p className="text-sm font-bold text-gray-900 mt-1">
            {ultimaCompra ? formatFecha(ultimaCompra.fecha) : '-'}
          </p>
        </div>
      </div>

      {/* Lista de compras */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Historial de Compras
        </h3>
        
        {/* Mobile: cards apiladas */}
        <div className="md:hidden space-y-2">
          {compras.map((compra) => (
            <button
              key={compra.id}
              onClick={() => navigate(`${RUTAS.ADMIN.COMPRAS}/${compra.id}`)}
              className="w-full bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${compra.estado === 'completada' ? 'bg-green-500' : 'bg-red-400'}`} />
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">{compra.numero}</p>
                  <p className="text-xs text-gray-400">{formatFecha(compra.fecha)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-600">{formatMoneda(compra.total)}</span>
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
              {compras.map((compra) => (
                <tr
                  key={compra.id}
              onClick={() => navigate(`${RUTAS.ADMIN.COMPRAS}/${compra.id}`)}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 text-sm text-gray-700">{formatFecha(compra.fecha)}</td>
                  <td className="py-3 text-sm font-medium text-gray-900">{compra.numero}</td>
                  <td className="py-3 text-sm text-gray-500">{compra.items.length} items</td>
                  <td className="py-3 text-sm font-bold text-blue-600 text-right">{formatMoneda(compra.total)}</td>
                  <td className="py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      compra.estado === 'completada'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {compra.estado === 'completada' ? 'Completada' : 'Anulada'}
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
