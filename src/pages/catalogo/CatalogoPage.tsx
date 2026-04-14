import { LayoutPublico } from '@/components/layout/LayoutPublico'
import { useCatalogo } from './hooks/useCatalogo'
import { HeaderCatalogo } from './components/HeaderCatalogo'
import { GridProductos, SkeletonCard, EstadoVacio } from './components/GridProductos'
import { ModalProducto } from './components/ModalProducto'

export default function CatalogoPage() {
  const {
    productosFiltrados,
    cargando,
    categoria,
    tipoCliente,
    busqueda,
    productoSeleccionado,
    setCategoria,
    setTipoCliente,
    setBusqueda,
    setProductoSeleccionado,
    obtenerPrecio,
  } = useCatalogo()

  return (
    <LayoutPublico>
      <HeaderCatalogo
        categoria={categoria}
        tipoCliente={tipoCliente}
        busqueda={busqueda}
        onCambiarCategoria={setCategoria}
        onCambiarTipoCliente={setTipoCliente}
        onCambiarBusqueda={setBusqueda}
      />

      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6 bg-gray-50 min-h-screen">
        {cargando ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <EstadoVacio busqueda={busqueda.length > 0} />
        ) : (
          <GridProductos
            productos={productosFiltrados}
            tipoCliente={tipoCliente}
            onProductoClick={setProductoSeleccionado}
            obtenerPrecio={obtenerPrecio}
          />
        )}
      </div>

      {productoSeleccionado && (
        <ModalProducto
          producto={productoSeleccionado}
          precio={obtenerPrecio(productoSeleccionado)}
          tipoCliente={tipoCliente}
          onClose={() => setProductoSeleccionado(null)}
        />
      )}
    </LayoutPublico>
  )
}
