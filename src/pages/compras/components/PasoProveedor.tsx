// PasoProveedor - Selección de proveedor, fecha y notas
// Paso 1 del formulario de nueva compra

import { Calendar, FileText } from 'lucide-react'
import { AutocompleteProveedor } from './AutocompleteProveedor'

interface Props {
  proveedorId: string | null
  onProveedorChange: (id: string) => void
  fecha: string
  onFechaChange: (fecha: string) => void
  notas: string
  onNotasChange: (notas: string) => void
}

export function PasoProveedor({
  proveedorId,
  onProveedorChange,
  fecha,
  onFechaChange,
  notas,
  onNotasChange,
}: Props) {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Proveedor */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <AutocompleteProveedor
          proveedorId={proveedorId}
          onProveedorChange={onProveedorChange}
        />
      </div>

      {/* Fecha */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Calendar size={18} className="text-blue-600" />
          Fecha de compra
        </label>
        <input
          type="date"
          value={fecha}
          onChange={e => onFechaChange(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Notas */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <FileText size={18} className="text-blue-600" />
          Notas (opcional)
        </label>
        <textarea
          value={notas}
          onChange={e => onNotasChange(e.target.value)}
          placeholder="Ej: Pagado al contado, entregar en almacén..."
          rows={3}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>
    </div>
  )
}
