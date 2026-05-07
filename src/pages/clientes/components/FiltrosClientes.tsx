// Filtros para la lista de clientes
import { Search, Filter, EyeOff } from 'lucide-react'

type FiltroTipo = 'todos' | 'minorista' | 'mayorista' | 'especial' | 'pendientes'

interface Props {
  busqueda: string
  filtroTipo: FiltroTipo
  verEliminados: boolean
  onBusquedaChange: (value: string) => void
  onTipoChange: (value: FiltroTipo) => void
  onVerEliminadosChange: (value: boolean) => void
}

export function FiltrosClientes({
  busqueda,
  filtroTipo,
  verEliminados,
  onBusquedaChange,
  onTipoChange,
  onVerEliminadosChange,
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
          onChange={e => onTipoChange(e.target.value as FiltroTipo)}
          className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all min-w-[180px]"
        >
          <option value="todos">Todos los clientes</option>
          <option value="pendientes">⏳ Pendientes de revisión</option>
          <option value="minorista">Minoristas</option>
          <option value="mayorista">Mayoristas</option>
          <option value="especial">Especiales</option>
        </select>

        <button
          onClick={() => onVerEliminadosChange(!verEliminados)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${
            verEliminados
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
          }`}
        >
          <EyeOff size={16} />
          {verEliminados ? 'Ocultar eliminados' : 'Ver eliminados'}
        </button>
      </div>
    </div>
  )
}
