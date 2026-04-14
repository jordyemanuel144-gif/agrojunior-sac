// Filtros de búsqueda para la lista de ventas
import { useState } from 'react'
import { Search, Filter, Calendar, ChevronDown } from 'lucide-react'
import type { RangoFecha } from '@/lib/utils'
import type { User as UserType } from '@/types/usuario.types'

interface Props {
  busqueda: string
  filtroEstado: 'todos' | 'completada' | 'anulada'
  filtroPago: 'todos' | 'pagado' | 'parcial' | 'pendiente'
  filtroFecha: RangoFecha
  rangoPersonalizado: { inicio: string; fin: string }
  filtroVendedor: string
  vendedores?: UserType[]
  esAdmin: boolean
  onBusquedaChange: (value: string) => void
  onEstadoChange: (value: 'todos' | 'completada' | 'anulada') => void
  onPagoChange: (value: 'todos' | 'pagado' | 'parcial' | 'pendiente') => void
  onFechaChange: (value: RangoFecha) => void
  onRangoChange: (value: { inicio: string; fin: string }) => void
  onVendedorChange?: (value: string) => void
}

const BOTONES_FECHA: { value: RangoFecha; label: string }[] = [
  { value: 'todos', label: 'Todas' },
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mes' },
  { value: 'rango', label: 'Rango' },
]

export function FiltrosVentas({
  busqueda,
  filtroEstado,
  filtroPago,
  filtroFecha,
  rangoPersonalizado,
  filtroVendedor,
  vendedores = [],
  esAdmin,
  onBusquedaChange,
  onEstadoChange,
  onPagoChange,
  onFechaChange,
  onRangoChange,
  onVendedorChange,
}: Props) {
  const [mostrarRango, setMostrarRango] = useState(false)

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
      {/* Fila 1: Buscador */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={busqueda}
          onChange={e => onBusquedaChange(e.target.value)}
          placeholder="Buscar por ticket o cliente..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
        />
      </div>

      {/* Fila 2: Filtros */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Filtros de fecha - botones */}
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
                  ? 'bg-blue-600 text-white shadow-md'
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

        {/* Filtro de rango de fechas */}
        {mostrarRango && (
          <div className="flex items-center gap-2 animate-fade-in">
            <input
              type="date"
              value={rangoPersonalizado.inicio}
              onChange={e => onRangoChange({ ...rangoPersonalizado, inicio: e.target.value })}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <span className="text-gray-400 text-xs">-</span>
            <input
              type="date"
              value={rangoPersonalizado.fin}
              onChange={e => onRangoChange({ ...rangoPersonalizado, fin: e.target.value })}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        )}

        {/* Filtro de estado */}
        <select
          value={filtroEstado}
          onChange={e => onEstadoChange(e.target.value as typeof filtroEstado)}
          className="px-4 py-2 bg-gray-50 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
        >
          <option value="todos">Todos los estados</option>
          <option value="completada">Completadas</option>
          <option value="anulada">Anuladas</option>
        </select>

        {/* Filtro de pago */}
        <select
          value={filtroPago}
          onChange={e => onPagoChange(e.target.value as typeof filtroPago)}
          className="px-4 py-2 bg-gray-50 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
        >
          <option value="todos">Todos los pagos</option>
          <option value="pagado">Pagado</option>
          <option value="parcial">Parcial</option>
          <option value="pendiente">Pendiente</option>
        </select>

        {/* Filtro de vendedor (solo admin) */}
        {esAdmin && vendedores.length > 0 && (
          <select
            value={filtroVendedor}
            onChange={e => onVendedorChange?.(e.target.value)}
            className="px-4 py-2 bg-gray-50 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
          >
            <option value="todos">Todos los vendedores</option>
            {vendedores.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Indicador de filtro activo */}
      {(filtroFecha !== 'todos' || filtroEstado !== 'todos') && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Filter size={12} />
            <span>
              Filtrando: <strong className="text-blue-600">
                {filtroFecha === 'hoy' && 'Hoy'}
                {filtroFecha === 'semana' && 'Esta semana'}
                {filtroFecha === 'mes' && 'Este mes'}
                {filtroFecha === 'rango' && `${rangoPersonalizado.inicio} al ${rangoPersonalizado.fin}`}
                {filtroFecha === 'todos' && 'Todas las fechas'}
                {filtroEstado !== 'todos' && ` • ${filtroEstado === 'completada' ? 'Completadas' : 'Anuladas'}`}
              </strong>
            </span>
            <button
              onClick={() => {
                onFechaChange('hoy')
                onEstadoChange('todos')
                setMostrarRango(false)
              }}
              className="ml-auto text-blue-600 hover:text-blue-700 font-medium"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
