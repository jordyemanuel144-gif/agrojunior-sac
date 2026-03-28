// Filtros de búsqueda para la lista de ventas
import { Search, Filter } from 'lucide-react'

interface Props {
  busqueda: string
  filtroEstado: 'todos' | 'completada' | 'anulada'
  filtroFecha: string
  onBusquedaChange: (value: string) => void
  onEstadoChange: (value: 'todos' | 'completada' | 'anulada') => void
  onFechaChange: (value: string) => void
}

export function FiltrosVentas({
  busqueda,
  filtroEstado,
  filtroFecha,
  onBusquedaChange,
  onEstadoChange,
  onFechaChange,
}: Props) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter size={16} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-600">Filtros</span>
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={e => onBusquedaChange(e.target.value)}
            placeholder="Buscar por ticket o cliente..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>

        <input
          type="date"
          value={filtroFecha}
          onChange={e => onFechaChange(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
        />

        <select
          value={filtroEstado}
          onChange={e => onEstadoChange(e.target.value as typeof filtroEstado)}
          className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
        >
          <option value="todos">Todos</option>
          <option value="completada">Completadas</option>
          <option value="anulada">Anuladas</option>
        </select>
      </div>
    </div>
  )
}
