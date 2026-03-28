// Header sticky para detalle de compra
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { RUTAS } from '@/config/rutas'
import type { Compra } from '@/types/compra.types'
import { comprasService } from '@/services/compras.service'

interface Props {
  compra: Compra
}

export function HeaderDetalleCompra({ compra }: Props) {
  const navigate = useNavigate()
  const proveedor = comprasService.getProveedor(compra.proveedor_id)
  const fecha = new Date(compra.fecha)

  const estadoConfig = {
    completada: { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-700', label: 'Completada' },
    anulada: { icon: XCircle, bg: 'bg-red-100', text: 'text-red-600', label: 'Anulada' },
    pendiente: { icon: Clock, bg: 'bg-amber-100', text: 'text-amber-600', label: 'Pendiente' },
  }

  const estado = estadoConfig[compra.estado]
  const EstadoIcon = estado.icon
  const esAnulada = compra.estado === 'anulada'

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => navigate(RUTAS.COMPRAS)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Volver</span>
          </button>
          <div className="flex-1" />
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${estado.bg} ${estado.text}`}>
            {estado.label}
          </span>
        </div>

        <div className="flex items-center gap-4 px-4 pb-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${estado.bg}`}>
            <EstadoIcon size={32} className={estado.text} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{compra.numero}</h1>
            <p className="text-gray-500">{proveedor}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className={`text-2xl font-bold ${esAnulada ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
              S/ {compra.total.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">
              {fecha.toLocaleDateString('es-PE')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
