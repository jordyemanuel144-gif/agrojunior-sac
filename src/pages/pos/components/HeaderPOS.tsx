import { Search, Bell, UserCircle } from 'lucide-react'
import { useConfigNegocio } from '@/hooks/useConfigNegocio'
import { TERMINAL_POS, CAJA_PRINCIPAL } from '@/config/constantes'

interface Props {
  busqueda: string
  onBusquedaChange: (value: string) => void
}

export function HeaderPOS({ busqueda, onBusquedaChange }: Props) {
  const { nombre } = useConfigNegocio()
  return (
    <div className="hidden md:flex bg-white px-6 py-3 items-center justify-between border-b border-gray-100 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
          <span className="text-lg">🐔</span>
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">{nombre}</p>
          <p className="text-xs text-gray-500">{TERMINAL_POS} · {CAJA_PRINCIPAL}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={e => onBusquedaChange(e.target.value)}
            placeholder="Buscar productos..."
            className="pl-9 pr-3 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-400 w-56"
          />
        </div>
        <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <Bell size={18} className="text-gray-600" />
        </button>
        <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <UserCircle size={18} className="text-gray-600" />
        </button>
      </div>
    </div>
  )
}
