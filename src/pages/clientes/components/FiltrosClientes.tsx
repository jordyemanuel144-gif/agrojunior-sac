// Filtros para la lista de clientes
import { Search, Filter } from 'lucide-react'

interface Props {
  busqueda: string
  filtroTipo: 'todos' | 'minorista' | 'mayorista' | 'especial'
  onBusquedaChange: (value: string) => void
  onTipoChange: (value: 'todos' | 'minorista' | 'mayorista' | 'especial') => void
}

export function FiltrosClientes({
  busqueda,
  filtroTipo,
  onBusquedaChange,
  onTipoChange,
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
            placeholder="Buscar por nombre, DNI/RUC o teléfono..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>

        <select
          value={filtroTipo}
          onChange={e => onTipoChange(e.target.value as typeof filtroTipo)}
          className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all min-w-[150px]"
        >
          <option value="todos">Todos</option>
          <option value="minorista">Minoristas</option>
          <option value="mayorista">Mayoristas</option>
          <option value="especial">Especiales</option>
        </select>
      </div>
    </div>
  )
}
