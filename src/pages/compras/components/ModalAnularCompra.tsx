import { AlertTriangle, CheckCircle } from 'lucide-react'
import type { Compra } from '@/types/compra.types'

interface Props {
  compra: Compra
  onAnular: () => void
  onCerrar: () => void
}

export function ModalAnularCompra({ compra, onAnular, onCerrar }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Anular Compra</h2>
            <p className="text-sm text-gray-500">Compra {compra.numero}</p>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          ¿Estás seguro de que deseas anular esta compra? Esta acción no se puede deshacer.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCerrar}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onAnular}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
          >
            Anular
          </button>
        </div>
      </div>
    </div>
  )
}

export function ConfirmarAnulacion({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600" />
          </div>
        </div>
        <h2 className="text-lg font-bold text-gray-900 text-center mb-2">Compra anulada</h2>
        <p className="text-gray-500 text-center mb-6">La compra ha sido anulada correctamente.</p>
        <button
          onClick={onConfirm}
          className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          Entendido
        </button>
      </div>
    </div>
  )
}
