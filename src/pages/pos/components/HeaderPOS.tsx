import { Search, Bell, UserCircle } from 'lucide-react'
import { NOMBRE_NEGOCIO, TERMINAL_POS, CAJA_PRINCIPAL } from '@/config/constantes'

interface Props {
  busqueda: string
  onBusquedaChange: (value: string) => void
}

export function HeaderPOS({ busqueda, onBusquedaChange }: Props) {
  return (
    <>
      <div className="hidden md:flex bg-white px-6 py-4 shadow-sm items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-xl">🐔</span>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{NOMBRE_NEGOCIO}</p>
            <p className="text-sm text-gray-500">{TERMINAL_POS} · {CAJA_PRINCIPAL}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={e => onBusquedaChange(e.target.value)}
              placeholder="Buscar productos..."
              className="pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-400 w-64"
            />
          </div>
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <Bell size={20} className="text-gray-600" />
          </button>
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <UserCircle size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="md:hidden bg-white px-3 pt-3 pb-2 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-sm">🐔</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Sam José</p>
              <p className="text-[9px] text-gray-400">Caja 01</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Bell size={14} className="text-gray-600" />
            </button>
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <UserCircle size={14} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
