import { AlertTriangle } from 'lucide-react'
import type { Proveedor } from '@/types/proveedor.types'

interface Props {
  proveedor: Proveedor
  onConfirmar: () => void
  onCancelar: () => void
}

export function ModalConfirmarEliminar({ proveedor, onConfirmar, onCancelar }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Eliminar Proveedor</h2>
            <p className="text-sm text-gray-500">{proveedor.nombre}</p>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar este proveedor? Esta acción no se puede deshacer.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
