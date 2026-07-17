// ============================================================
// FiltrosCompras - Filtros de búsqueda para la lista de compras
// Incluye: buscador, filtros de fecha y estado
// ============================================================
import { useState } from 'react'
import { Search, Filter, Calendar, ChevronDown } from 'lucide-react'
import type { RangoFecha } from '@/lib/utils'

interface Props {
  busqueda: string
  filtroEstado: 'todos' | 'completada' | 'anulada' | 'pendiente'
  filtroFecha: RangoFecha
  rangoPersonalizado: { inicio: string; fin: string }
  onBusquedaChange: (value: string) => void
  onEstadoChange: (value: 'todos' | 'completada' | 'anulada' | 'pendiente') => void
  onFechaChange: (value: RangoFecha) => void
  onRangoChange: (value: { inicio: string; fin: string }) => void
}

const BOTONES_FECHA: { value: RangoFecha; label: string }[] = [
  { value: 'todos', label: 'Todas' },
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mes' },
  { value: 'rango', label: 'Rango' },
]

export function FiltrosCompras({
  busqueda,
  filtroEstado,
  filtroFecha,
  rangoPersonalizado,
  onBusquedaChange,
  onEstadoChange,
  onFechaChange,
  onRangoChange,
}: Props) {
  const [mostrarRango, setMostrarRango] = useState(false)

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
      {/* Buscador */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={busqueda}
          onChange={e => onBusquedaChange(e.target.value)}
          placeholder="Buscar por número o proveedor..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Botones de fecha */}
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          {BOTONES_FECHA.map((btn) => (
            <button
              key={btn.value}
              onClick={() => {
                onFechaChange(btn.value)
                if (btn.value === 'rango') {
                  setMostrarRango(true)
                } else {
                  setMostrarRango(false)
                }
              }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filtroFecha === btn.value
                  ? 'bg-primary text-neutral-900 shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {btn.value === 'rango' && <Calendar size={12} />}
              {btn.label}
              {btn.value === 'rango' && (
                <ChevronDown 
                  size={12} 
                  className={`transition-transform ${mostrarRango ? 'rotate-180' : ''}`}
                />
              )}
            </button>
          ))}
        </div>

        {/* Rango de fechas */}
        {mostrarRango && (
          <div className="flex items-center gap-2 animate-fade-in">
            <input
              type="date"
              value={rangoPersonalizado.inicio}
              onChange={e => onRangoChange({ ...rangoPersonalizado, inicio: e.target.value })}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
            <span className="text-gray-400 text-xs">-</span>
            <input
              type="date"
              value={rangoPersonalizado.fin}
              onChange={e => onRangoChange({ ...rangoPersonalizado, fin: e.target.value })}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
          </div>
        )}

        {/* Filtro de estado */}
        <select
          value={filtroEstado}
          onChange={e => onEstadoChange(e.target.value as typeof filtroEstado)}
          className="px-4 py-2 bg-gray-50 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-light transition-all ml-auto"
        >
          <option value="todos">Todos los estados</option>
          <option value="completada">Completadas</option>
          <option value="pendiente">Pendientes</option>
          <option value="anulada">Anuladas</option>
        </select>
      </div>

      {/* Indicador de filtro activo */}
      {(filtroFecha !== 'todos' || filtroEstado !== 'todos') && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Filter size={12} />
            <span>
              Filtrando: <strong className="text-primary">
                {filtroFecha === 'hoy' && 'Hoy'}
                {filtroFecha === 'semana' && 'Esta semana'}
                {filtroFecha === 'mes' && 'Este mes'}
                {filtroFecha === 'rango' && `${rangoPersonalizado.inicio} al ${rangoPersonalizado.fin}`}
                {filtroFecha === 'todos' && 'Todas las fechas'}
                {filtroEstado !== 'todos' && ` • ${filtroEstado === 'completada' ? 'Completadas' : filtroEstado === 'pendiente' ? 'Pendientes' : 'Anuladas'}`}
              </strong>
            </span>
            <button
              onClick={() => {
                onFechaChange('hoy')
                onEstadoChange('todos')
                setMostrarRango(false)
              }}
              className="ml-auto text-primary hover:text-primary-hover font-medium"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
