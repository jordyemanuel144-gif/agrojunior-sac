import { Link } from 'react-router-dom'
import { RUTAS } from '@/config/rutas'
import { formatMoneda } from '@/lib/utils'
import { useProductos } from '../hooks/useProductos'

export function SeccionProductos() {
  const { productos, cargando } = useProductos()

  if (cargando || productos.length === 0) return null

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Nuestros Productos Destacados
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Cortes premium de Angus y Holstein, directo del establo
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {productos.map((producto) => (
              <div key={producto.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 bg-primary-light flex items-center justify-center">
                  {producto.imagen_url ? (
                    <img
                      className="w-full h-full object-cover"
                      src={producto.imagen_url}
                      alt={producto.nombre}
                    />
                  ) : (
                    <span className="text-6xl">🥩</span>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {producto.destacado && (
                      <span className="px-3 py-1 text-xs font-bold text-white bg-green-600 rounded-full">
                        Destacado
                      </span>
                    )}
                    {producto.tag && (
                      <span className="px-3 py-1 text-xs font-bold text-neutral-900 bg-primary rounded-full">
                        {producto.tag === 'oferta' ? 'Oferta' : producto.tag === 'nuevo' ? 'Nuevo' : producto.tag}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900">{producto.nombre}</h3>
                  <p className="mt-1 text-sm text-gray-500">Por {producto.tipo_medida}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">{formatMoneda(producto.precio_minorista)}</span>
                    <Link
                      to={RUTAS.PUBLICO.CATALOGO}
                      className="text-sm font-medium text-primary hover:text-primary-hover"
                    >
                      Ver más →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            to={RUTAS.PUBLICO.CATALOGO}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-neutral-900 bg-primary hover:bg-primary-hover transition-colors"
          >
            Ver Catálogo Completo
          </Link>
        </div>
      </div>
    </section>
  )
}
