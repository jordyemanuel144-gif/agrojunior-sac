import { TarjetaProducto } from './TarjetaProducto'
import type { Producto } from '@/types/producto.types'
import type { TipoCliente } from '@/types/cliente.types'

interface GridProductosProps {
  productos: Producto[]
  tipoCliente: TipoCliente
  onProductoClick: (producto: Producto) => void
  obtenerPrecio: (producto: Producto) => number
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="w-full h-32 sm:h-40 bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-8 bg-gray-200 rounded mt-3" />
      </div>
    </div>
  )
}

function EstadoVacio({ busqueda }: { busqueda: boolean }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">
        {busqueda ? 'No encontramos productos' : 'No hay productos'}
      </h3>
      <p className="text-sm text-gray-500 mt-1">
        {busqueda ? 'Intenta con otros términos de búsqueda' : 'Próximamente tendremos más productos'}
      </p>
    </div>
  )
}

export function GridProductos({ productos, tipoCliente, onProductoClick, obtenerPrecio }: GridProductosProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
      {productos.map((producto, index) => (
        <div
          key={producto.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <TarjetaProducto
            producto={producto}
            precio={obtenerPrecio(producto)}
            tipoCliente={tipoCliente}
            onClick={() => onProductoClick(producto)}
          />
        </div>
      ))}
    </div>
  )
}

export { SkeletonCard, EstadoVacio }
