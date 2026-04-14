import { Search, ShoppingBag } from 'lucide-react'
import { FiltroCategorias } from './FiltroCategorias'
import { SelectorTipoCliente } from './SelectorTipoCliente'
import type { TipoCliente } from '@/types/cliente.types'

interface HeaderCatalogoProps {
  categoria: string
  tipoCliente: TipoCliente
  busqueda: string
  onCambiarCategoria: (categoria: string) => void
  onCambiarTipoCliente: (tipo: TipoCliente) => void
  onCambiarBusqueda: (busqueda: string) => void
}

export function HeaderCatalogo({
  categoria,
  tipoCliente,
  busqueda,
  onCambiarCategoria,
  onCambiarTipoCliente,
  onCambiarBusqueda,
}: HeaderCatalogoProps) {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                Catálogo de Productos
              </h1>
              <p className="mt-1 text-xs md:text-sm text-gray-500">
                Ver precios especiales para cada tipo de cliente
              </p>
            </div>

            <SelectorTipoCliente
              tipoSeleccionado={tipoCliente}
              onCambiar={onCambiarTipoCliente}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => onCambiarBusqueda(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <FiltroCategorias
            categoriaSeleccionada={categoria}
            onCambiar={onCambiarCategoria}
          />
        </div>
      </div>
    </div>
  )
}
