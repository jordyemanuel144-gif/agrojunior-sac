// PasoConfirmar - Resumen y confirmación de la compra
// Paso 3 del formulario de nueva compra

import { CheckCircle, AlertTriangle } from 'lucide-react'
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
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs">Proveedor</p>
          <p className="font-medium text-gray-900 truncate">{proveedor?.nombre ?? '—'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs">Fecha</p>
          <p className="font-medium text-gray-900">{fechaFormateada}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100">
        <div className="px-3 py-2 border-b border-gray-100 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Productos ({productosSeleccionados.length})</span>
          <span className="text-lg font-bold text-primary">{MONEDA} {totalCompra.toFixed(2)}</span>
        </div>
        <div className="max-h-32 overflow-y-auto">
          {productosSeleccionados.map(item => (
            <div key={item.producto.id} className="px-3 py-2 flex justify-between text-sm border-b border-gray-50 last:border-0">
              <div>
                <p className="text-gray-900">{item.producto.nombre}</p>
                <p className="text-xs text-gray-400">{item.cantidad} × {MONEDA}{item.precioUnitario.toFixed(2)}</p>
              </div>
              <p className="font-medium text-gray-900">{MONEDA}{item.subtotal.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {notas && (
        <div className="bg-amber-50 rounded-lg px-3 py-2 text-sm">
          <span className="text-amber-700">📝 {notas}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
        <AlertTriangle size={14} />
        <span>Stock se actualizará al confirmar</span>
      </div>
    </div>
  )
}
