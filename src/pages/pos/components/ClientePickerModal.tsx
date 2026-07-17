// ClientePickerModal - Modal para seleccionar cliente en ConfirmarPedido
import { useState, useMemo } from 'react'
import { UserCircle, X, Search } from 'lucide-react'
import type { Cliente, TipoCliente as TipoClienteEnum } from '@/types/cliente.types'

interface Props {
  clientes: Cliente[]
  clienteActual: Cliente
  onSeleccionar: (cliente: Cliente) => void
  onCerrar: () => void
}

const TIPOS_CLIENTE: { value: TipoClienteEnum | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'minorista', label: 'Minorista' },
  { value: 'mayorista', label: 'Mayorista' },
  { value: 'especial', label: 'Especial' },
]

export function ClientePickerModal({ clientes, clienteActual, onSeleccionar, onCerrar }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<TipoClienteEnum | 'todos'>('todos')

  const clientesFiltrados = useMemo(() => {
    const busquedaLower = busqueda.toLowerCase().trim()
    return clientes.filter(c => {
      const coincideBusqueda = !busquedaLower || 
        c.nombre.toLowerCase().includes(busquedaLower) ||
        c.dni_ruc?.toLowerCase().includes(busquedaLower) ||
        c.telefono?.toLowerCase().includes(busquedaLower)
      const coincideTipo = filtroTipo === 'todos' || c.tipo === filtroTipo
      return coincideBusqueda && coincideTipo
    })
  }, [clientes, busqueda, filtroTipo])

  const handleSelect = (c: Cliente) => {
    onSeleccionar(c)
    onCerrar()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center" 
      onClick={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className="bg-white w-full md:w-[420px] md:rounded-3xl rounded-t-3xl p-4 max-h-[85%] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
              <UserCircle size={16} className="text-primary" />
            </div>
            <h3 className="font-bold text-gray-900">Cambiar Cliente</h3>
          </div>
          <button onClick={onCerrar} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200">
            <X size={16} />
          </button>
        </div>

        <div className="relative mb-3">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} 
            placeholder="Buscar por nombre, DNI/RUC o teléfono..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {TIPOS_CLIENTE.map(tipo => (
            <button key={tipo.value} onClick={() => setFiltroTipo(tipo.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filtroTipo === tipo.value 
                  ? tipo.value === 'todos' ? 'bg-primary text-white' 
                  : tipo.value === 'mayorista' ? 'bg-green-600 text-white' 
                  : tipo.value === 'especial' ? 'bg-purple-600 text-white' 
                  : 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {tipo.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 -mr-2 pr-2 min-h-[200px]">
          {clientesFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <p className="text-sm">No se encontraron clientes</p>
            </div>
          ) : (
            clientesFiltrados.map(c => (
              <button key={c.id} onClick={() => handleSelect(c)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  clienteActual.id === c.id ? 'bg-primary-light border-2 border-primary-light' : 'bg-gray-50 hover:bg-gray-100'
                }`}>
                <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                  <UserCircle size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{c.nombre}</p>
                  <div className="flex items-center gap-2">
                    {c.dni_ruc && <p className="text-xs text-gray-400">{c.dni_ruc}</p>}
                    {c.dni_ruc && c.telefono && <span className="text-gray-300">•</span>}
                    {c.telefono && <p className="text-xs text-gray-400">{c.telefono}</p>}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase flex-shrink-0 ${
                  c.tipo === 'mayorista' ? 'bg-green-100 text-green-700' 
                  : c.tipo === 'especial' ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-500'
                }`}>
                  {c.tipo}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}