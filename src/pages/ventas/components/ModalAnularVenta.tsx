// Modal de confirmación para anular una venta
import { AlertTriangle } from 'lucide-react'

interface Props {
  onConfirmar: () => void
  onCancelar: () => void
  cargando: boolean
}

export function ModalAnularVenta({ onConfirmar, onCancelar, cargando }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        {/* Ícono y título */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Anular venta</h3>
            <p className="text-sm text-gray-500">¿Estás seguro?</p>
          </div>
        </div>

        {/* Descripción */}
        <p className="text-sm text-gray-500 mb-6">
          Esta acción no se puede deshacer. El stock de los productos será restaurado.
        </p>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={cargando}
            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {cargando ? 'Anulando...' : 'Sí, anular'}
          </button>
        </div>
      </div>
    </div>
  )
}
