import type { FiltroFecha, RangoFiltro } from '@/types/reportes.types'

interface FiltrosFechaProps {
  filtro: FiltroFecha
  onCambiar: (filtro: FiltroFecha) => void
}

const OPCIONES: { valor: RangoFiltro; etiqueta: string }[] = [
  { valor: 'hoy', etiqueta: 'Hoy' },
  { valor: 'semana', etiqueta: 'Esta Semana' },
  { valor: 'mes', etiqueta: 'Este Mes' },
  { valor: 'personalizado', etiqueta: 'Personalizado' },
]

export function FiltrosFecha({ filtro, onCambiar }: FiltrosFechaProps) {
  const handleTipoChange = (tipo: RangoFiltro) => {
    onCambiar({ tipo })
  }

  const handleFechaInicio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fecha = e.target.value ? new Date(e.target.value) : undefined
    onCambiar({
      tipo: 'personalizado',
      fechaInicio: fecha,
      fechaFin: filtro.fechaFin,
    })
  }

  const handleFechaFin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fecha = e.target.value ? new Date(e.target.value) : undefined
    onCambiar({
      tipo: 'personalizado',
      fechaInicio: filtro.fechaInicio,
      fechaFin: fecha,
    })
  }

  const formatearFechaInput = (fecha?: Date): string => {
    if (!fecha) return ''
    return fecha.toISOString().split('T')[0]
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {OPCIONES.map(opcion => (
            <button
              key={opcion.valor}
              onClick={() => handleTipoChange(opcion.valor)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                filtro.tipo === opcion.valor
                  ? 'bg-primary text-neutral-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opcion.etiqueta}
            </button>
          ))}
        </div>

        {filtro.tipo === 'personalizado' && (
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-2">Desde:</label>
              <input
                type="date"
                value={formatearFechaInput(filtro.fechaInicio)}
                onChange={handleFechaInicio}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-2">Hasta:</label>
              <input
                type="date"
                value={formatearFechaInput(filtro.fechaFin)}
                onChange={handleFechaFin}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
