// ListaProductos - Página principal de gestión de productos
import { useState, useEffect, useMemo } from 'react'
import { Plus, Package } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { FiltrosProductos } from './components/FiltrosProductos'
import { FilaProducto } from './components/FilaProducto'
import { FormularioProducto } from './components/FormularioProducto'
import { productosService } from '@/services/productos.service'
import type { Producto, NuevoProducto } from '@/types/producto.types'

export default function ListaProductos() {
  // ============================================================
  // Estado local de la página
  // ============================================================
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Record<string, string>>({})
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('all')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos')
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {

    const init = async () => {
      try {
        setCargando(true)
        setError(null)
        
        // Cargar productos y categorías en paralelo
        const [data, cats] = await Promise.all([
          filtroEstado === 'todos'
            ? await productosService.obtenerTodosIncluyendoInactivos()
            : await productosService.obtenerTodos(),
          await productosService.obtenerCategorias()
        ])
        
        setProductos(data)
        
        // Convertir array de categorías a mapa id->nombre
        const mapa: Record<string, string> = {}
        for (const cat of cats) {
          mapa[cat.id] = cat.nombre
        }
        setCategorias(mapa)
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'Error desconocido'
        console.error('Error al cargar productos:', mensaje)
        setError(mensaje)
      } finally {
        setCargando(false)
      }
    }
    init()
  }, [filtroEstado])

  // ============================================================
  // Memo: filtra productos según criterios de búsqueda y filtros
  // ============================================================
  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      // Filtro por búsqueda: nombre o código
      const matchBusqueda =
        busqueda === '' ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.codigo.toLowerCase().includes(busqueda.toLowerCase())

      // Filtro por categoría
      const matchCategoria = filtroCategoria === 'all' || p.categoria_id === filtroCategoria

      // Filtro por estado
      const matchEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'activo' && p.activo) ||
        (filtroEstado === 'inactivo' && !p.activo)

      return matchBusqueda && matchCategoria && matchEstado
    })
  }, [productos, busqueda, filtroCategoria, filtroEstado])

  // ============================================================
  // Handlers
  // ============================================================
  const handleCrear = () => {
    setProductoEditando(null)
    setMostrarForm(true)
  }

  const handleGuardar = async (datos: NuevoProducto) => {
    if (productoEditando) {
      await productosService.actualizar(productoEditando.id, datos)
    } else {
      await productosService.crear(datos)
    }
    const [data, cats] = await Promise.all([
      filtroEstado === 'todos'
        ? await productosService.obtenerTodosIncluyendoInactivos()
        : await productosService.obtenerTodos(),
      await productosService.obtenerCategorias()
    ])
    setProductos(data)
    const mapa: Record<string, string> = {}
    for (const cat of cats) {
      mapa[cat.id] = cat.nombre
    }
    setCategorias(mapa)
  }

  // ============================================================
  // Estado de carga
  // ============================================================
  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium mb-2">Error al cargar productos</p>
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const activos = productosFiltrados.filter(p => p.activo).length
  const bajoStock = productosFiltrados.filter(p => p.stock_actual <= p.stock_minimo && p.stock_actual > 0).length
  const agotados = productosFiltrados.filter(p => p.stock_actual === 0).length

  return (
    <>
      <div className="p-4 md:p-6">
        <PageHeader
          titulo="Productos"
          icono={Package}
          stats={[
            { label: 'Total', value: productosFiltrados.length, color: 'gray' },
            { label: 'Activos', value: activos, color: 'green' },
            ...(bajoStock > 0 ? [{ label: 'Bajo stock', value: bajoStock, color: 'amber' as const }] : []),
            ...(agotados > 0 ? [{ label: 'Agotados', value: agotados, color: 'red' as const }] : []),
          ]}
        />

        <div className="max-w-screen-xl mx-auto">
          {/* Botón para crear nuevo producto */}
          <button
            onClick={handleCrear}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors mb-4"
          >
            <Plus size={20} />
            <span className="font-medium">Nuevo Producto</span>
          </button>

          {/* Filtros de búsqueda */}
          <FiltrosProductos
            busqueda={busqueda}
            filtroCategoria={filtroCategoria}
            filtroEstado={filtroEstado}
            onBusquedaChange={setBusqueda}
            onCategoriaChange={setFiltroCategoria}
            onEstadoChange={setFiltroEstado}
          />

          {/* Lista de productos o mensaje vacío */}
          {productosFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500">
                {busqueda || filtroCategoria !== 'all' || filtroEstado !== 'todos'
                  ? 'No se encontraron productos con los filtros aplicados'
                  : 'No hay productos registrados'}
              </p>
              {(busqueda || filtroCategoria !== 'all' || filtroEstado !== 'todos') && (
                <button
                  onClick={() => { setBusqueda(''); setFiltroCategoria('all'); setFiltroEstado('todos') }}
                  className="mt-4 text-primary hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {productosFiltrados.map(producto => (
                <FilaProducto 
                  key={producto.id} 
                  producto={producto}
                  nombreCategoria={categorias[producto.categoria_id] ?? producto.categoria_id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de formulario */}
      {mostrarForm && (
        <FormularioProducto
          producto={productoEditando}
          onCerrar={() => setMostrarForm(false)}
          onGuardar={handleGuardar}
        />
      )}
    </>
  )
}
