// ============================================================
// FiltrosInventario - Filtros de búsqueda para el inventario
// Incluye: buscador por producto y filtro por estado de stock
// ============================================================
import { Search, Filter } from 'lucide-react'

interface Props {
  busqueda: string
  filtroEstado: 'todos' | 'ok' | 'bajo' | 'agotado'
  onBusquedaChange: (value: string) => void
  onEstadoChange: (value: 'todos' | 'ok' | 'bajo' | 'agotado') => void
}

export function FiltrosInventario({
  busqueda,
  filtroEstado,
  onBusquedaChange,
  onEstadoChange,
}: Props) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
      {/* Encabezado de filtros */}
      <div className="flex items-center gap-2 mb-3">
        <Filter size={16} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-600">Filtros</span>
      </div>

      {/* Controles de filtro */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={e => onBusquedaChange(e.target.value)}
            placeholder="Buscar por producto..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>

        {/* Filtro por estado */}
        <select
          value={filtroEstado}
          onChange={e => onEstadoChange(e.target.value as typeof filtroEstado)}
          className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all min-w-[150px]"
        >
          <option value="todos">Todos</option>
          <option value="ok">Normal</option>
          <option value="bajo">Bajo stock</option>
          <option value="agotado">Agotados</option>
        </select>
      </div>
    </div>
  )
}
