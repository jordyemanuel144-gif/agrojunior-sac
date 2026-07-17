// Filtros para la lista de cobranzas
import { Search, Filter } from 'lucide-react'

type FiltroOrden = 'fecha' | 'deuda' | 'nombre' | 'antiguo'

interface Filtros {
  busqueda: string
  orden: FiltroOrden
}

interface FiltrosCobranzasProps {
  filtros: Filtros
  onChange: (filtros: Filtros) => void
}

export function FiltrosCobranzas({ filtros, onChange }: FiltrosCobranzasProps) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <Filter size={14} className="text-gray-400" />
        <span className="text-xs font-medium text-gray-500">Filtros</span>
      </div>
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cliente por nombre, DNI/RUC o teléfono..."
            value={filtros.busqueda}
            onChange={e => onChange({ ...filtros, busqueda: e.target.value })}
            className="w-full pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary-light"
          />
        </div>

        <select
          value={filtros.orden}
          onChange={e => onChange({ ...filtros, orden: e.target.value as FiltroOrden })}
          className="px-3 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light min-w-[140px]"
        >
          <option value="fecha">📅 Más reciente</option>
          <option value="antiguo">⏱️ Más antiguo</option>
          <option value="deuda">💰 Mayor deuda</option>
          <option value="nombre">🔤 Nombre A-Z</option>
        </select>
      </div>
    </div>
  )
}