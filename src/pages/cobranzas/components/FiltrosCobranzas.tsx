import { Search } from 'lucide-react'

interface Filtros {
  busqueda: string
}

interface FiltrosCobranzasProps {
  filtros: Filtros
  onChange: (filtros: Filtros) => void
}

export function FiltrosCobranzas({ filtros, onChange }: FiltrosCobranzasProps) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar cliente por nombre, DNI/RUC o teléfono..."
          value={filtros.busqueda}
          onChange={e => onChange({ ...filtros, busqueda: e.target.value })}
          className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
        />
      </div>
    </div>
  )
}
