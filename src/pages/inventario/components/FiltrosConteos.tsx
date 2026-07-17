// Filtros para la lista de conteos de inventario
import { Search, X } from 'lucide-react'
import type { EstadoConteo } from '@/types/inventario.types'

interface Props {
  busqueda: string
  filtroEstado: EstadoConteo | 'todos'
  onBusquedaChange: (value: string) => void
  onEstadoChange: (value: EstadoConteo | 'todos') => void
}

const ESTADOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'completado', label: 'Completado' },
  { value: 'anulado', label: 'Anulado' },
] as const

export function FiltrosConteos({ busqueda, filtroEstado, onBusquedaChange, onEstadoChange }: Props) {
  const tieneFiltros = busqueda !== '' || filtroEstado !== 'todos'

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={e => onBusquedaChange(e.target.value)}
            placeholder="Buscar por número de conteo..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
          />
        </div>

        <select
          value={filtroEstado}
          onChange={e => onEstadoChange(e.target.value as EstadoConteo | 'todos')}
          className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-light transition-all min-w-[140px]"
        >
          {ESTADOS.map(estado => (
            <option key={estado.value} value={estado.value}>
              {estado.label}
            </option>
          ))}
        </select>

        {tieneFiltros && (
          <button
            onClick={() => {
              onBusquedaChange('')
              onEstadoChange('todos')
            }}
            className="flex items-center gap-1 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X size={16} />
            Limpiar
          </button>
        )}
      </div>

      {tieneFiltros && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>
              Filtrando: <strong className="text-primary">
                {busqueda && `Número: "${busqueda}"`}
                {busqueda && filtroEstado !== 'todos' && ' • '}
                {filtroEstado !== 'todos' && `Estado: ${ESTADOS.find(e => e.value === filtroEstado)?.label}`}
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}