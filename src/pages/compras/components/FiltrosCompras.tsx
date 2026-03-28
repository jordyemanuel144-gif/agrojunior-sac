// ============================================================
// FiltrosCompras - Filtros de búsqueda para la lista de compras
// Incluye: buscador por número/proveedor, filtro por estado y fecha
// ============================================================
import { Search, Filter } from 'lucide-react'

// Props: estados de filtros y callbacks para actualizar valores
interface Props {
  busqueda: string
  filtroEstado: 'todos' | 'completada' | 'anulada' | 'pendiente'
  filtroFecha: string
  onBusquedaChange: (value: string) => void
  onEstadoChange: (value: 'todos' | 'completada' | 'anulada' | 'pendiente') => void
  onFechaChange: (value: string) => void
}

export function FiltrosCompras({
  busqueda,
  filtroEstado,
  filtroFecha,
  onBusquedaChange,
  onEstadoChange,
  onFechaChange,
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
            placeholder="Buscar por número o proveedor..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>

        {/* Filtro por fecha */}
        <input
          type="date"
          value={filtroFecha}
          onChange={e => onFechaChange(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all min-w-[150px]"
        />

        {/* Filtro por estado */}
        <select
          value={filtroEstado}
          onChange={e => onEstadoChange(e.target.value as typeof filtroEstado)}
          className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all min-w-[150px]"
        >
          <option value="todos">Todos</option>
          <option value="completada">Completadas</option>
          <option value="pendiente">Pendientes</option>
          <option value="anulada">Anuladas</option>
        </select>
      </div>
    </div>
  )
}
