// Header sticky para la vista de detalle de venta
import { ArrowLeft, XCircle } from 'lucide-react'
import type { Venta } from '@/types/venta.types'

interface Props {
  venta: Venta
  esAnulada: boolean
  onVolver: () => void
  onAnular: () => void
}

export function HeaderDetalleVenta({ venta, esAnulada, onVolver, onAnular }: Props) {
  return (
    <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
      <div className="flex items-center gap-4 max-w-2xl mx-auto">
        {/* Botón volver */}
        <button
          onClick={onVolver}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-700" />
        </button>

        {/* Info del ticket */}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-gray-900">{venta.ticket_numero}</h1>
            <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${
              esAnulada ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
            }`}>
              {esAnulada ? 'Anulada' : 'Completada'}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {venta.fecha.toLocaleDateString('es-PE', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>

        {/* Botón anular */}
        {!esAnulada && (
          <button
            onClick={onAnular}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors"
          >
            <XCircle size={16} />
            <span className="hidden md:inline">Anular</span>
          </button>
        )}
      </div>
    </div>
  )
}
