// PasoConfirmar - Resumen y confirmación de la compra
// Paso 3 del formulario de nueva compra

import { CheckCircle, AlertCircle } from 'lucide-react'
import type { Proveedor } from '@/types/proveedor.types'
import { MONEDA } from '@/config/constantes'

interface ProductoSeleccionado {
  producto: { id: string; nombre: string; tipo_medida: string }
  cantidad: number
  precioUnitario: number
  subtotal: number
}

interface Props {
  proveedor: Proveedor | null
  fecha: string
  notas: string
  productosSeleccionados: ProductoSeleccionado[]
  totalCompra: number
  guardando: boolean
  onConfirmar: () => void
}

export function PasoConfirmar({
  proveedor,
  fecha,
  notas,
  productosSeleccionados,
  totalCompra,
  guardando,
  onConfirmar,
}: Props) {
  const fechaFormateada = new Date(fecha).toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Info del proveedor y fecha */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-3">Información de la compra</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Proveedor:</span>
            <span className="font-medium text-gray-900">{proveedor?.nombre ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Fecha:</span>
            <span className="text-gray-700">{fechaFormateada}</span>
          </div>
          {notas && (
            <div className="pt-2 border-t border-gray-100">
              <span className="text-gray-500">Notas: </span>
              <span className="text-gray-700 italic">"{notas}"</span>
            </div>
          )}
        </div>
      </div>

      {/* Lista de productos */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-3">
          Productos ({productosSeleccionados.length})
        </h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {productosSeleccionados.map(item => (
            <div
              key={item.producto.id}
              className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.producto.nombre}</p>
                <p className="text-xs text-gray-500">
                  {item.cantidad} × {MONEDA} {item.precioUnitario.toFixed(2)}
                </p>
              </div>
              <p className="font-medium text-gray-900">
                {MONEDA} {item.subtotal.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center justify-between">
          <span className="font-medium text-blue-900">Total de la compra</span>
          <span className="text-2xl font-bold text-blue-600">
            {MONEDA} {totalCompra.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Aviso de stock */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          Al confirmar, el stock de los productos seleccionados se actualizará automáticamente.
        </p>
      </div>

      {/* Botón confirmar */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onConfirmar()
        }}
        disabled={guardando}
        className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {guardando ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <CheckCircle size={20} />
            Confirmar Compra
          </>
        )}
      </button>
    </div>
  )
}
