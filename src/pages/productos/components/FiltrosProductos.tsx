// ============================================================
// FiltrosProductos - Filtros de búsqueda para la lista de productos
// Incluye: buscador por nombre/código, filtro por categoría y estado
// ============================================================
import { Search, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'
import { productosService } from '@/services/productos.service'

interface Props {
  busqueda: string
  filtroCategoria: string
  filtroEstado: 'todos' | 'activo' | 'inactivo'
  onBusquedaChange: (value: string) => void
  onCategoriaChange: (value: string) => void
  onEstadoChange: (value: 'todos' | 'activo' | 'inactivo') => void
}

export function FiltrosProductos({
  busqueda,
  filtroCategoria,
  filtroEstado,
  onBusquedaChange,
  onCategoriaChange,
  onEstadoChange,
}: Props) {
  const [categorias, setCategorias] = useState<{id: string, nombre: string}[]>([])

  useEffect(() => {
    productosService.obtenerCategorias().then(setCategorias)
  }, [])

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
      {/* Encabezado de filtros */}
      <div className="flex items-center gap-2 mb-3">
        <Filter size={16} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-600">Filtros</span>
      </div>

      {/* Controles de filtro */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={e => onBusquedaChange(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
          />
        </div>

        {/* Filtro por categoría */}
        <select
          value={filtroCategoria}
          onChange={e => onCategoriaChange(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light transition-all min-w-[150px]"
        >
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>

        {/* Filtro por estado */}
        <select
          value={filtroEstado}
          onChange={e => onEstadoChange(e.target.value as typeof filtroEstado)}
          className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light transition-all min-w-[150px]"
        >
          <option value="todos">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>
    </div>
  )
}
