// GridProductos - Grid de productos con filtros por categoría
import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { categoriasService } from '@/services/categorias.service'
import { TarjetaProducto } from './TarjetaProducto'
import type { Producto, Categoria } from '@/types/producto.types'

interface Props {
  productos: Producto[]
  stockInfo: { [productoId: string]: number }
  busqueda: string
  categoriaActiva: string
  onBusquedaChange: (value: string) => void
  onCategoriaChange: (categoria: string) => void
  getPrecio: (producto: Producto) => number
  getCantidadEnCarrito: (productoId: string) => number
  onAnadir: (producto: Producto, cantidad: number) => { success: boolean; error?: string }
  onActualizar: (productoId: string, cantidad: number) => { success: boolean; error?: string }
  onEliminar: (productoId: string) => void
}

export function GridProductos({
  productos,
  stockInfo,
  busqueda,
  categoriaActiva,
  onBusquedaChange,
  onCategoriaChange,
  getPrecio,
  getCantidadEnCarrito,
  onAnadir,
  onActualizar,
  onEliminar,
}: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([])

  useEffect(() => {
    categoriasService.obtenerTodos().then(setCategorias)
  }, [])

  return (
    <>
      <div className="hidden md:block bg-white px-6 py-3 border-b border-gray-100">
        <div className="flex gap-6">
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => onCategoriaChange(cat.id)}
              className={`text-sm font-semibold pb-2 border-b-2 transition-all ${
                categoriaActiva === cat.id
                  ? 'text-primary border-primary'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="md:hidden px-3 pt-2 pb-2 border-b border-gray-100 bg-white">
        <div className="relative mb-2">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={e => onBusquedaChange(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-8 pr-3 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-900 placeholder-gray-400"
          />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3">
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => onCategoriaChange(cat.id)}
              className={`text-xs font-semibold whitespace-nowrap px-2 py-1 rounded-lg transition-all flex-shrink-0 ${
                categoriaActiva === cat.id
                  ? 'text-primary bg-primary-light'
                  : 'text-gray-500 bg-gray-100'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 pb-24 md:pb-20 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
          {productos.map(producto => (
            <TarjetaProducto
              key={producto.id}
              producto={producto}
              precio={getPrecio(producto)}
              stockDisponible={stockInfo[producto.id] ?? 0}
              cantidadEnCarrito={getCantidadEnCarrito(producto.id)}
              onAnadir={onAnadir}
              onActualizar={onActualizar}
              onEliminar={onEliminar}
            />
          ))}
        </div>
        {productos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-4xl mb-2">🔍</span>
            <p className="text-sm">No se encontraron productos</p>
          </div>
        )}
      </div>
    </>
  )
}
