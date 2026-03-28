// ============================================================
// ListaProductos - Página principal de gestión de productos
// Muestra lista con filtros, búsqueda y botón de crear
// ============================================================
import { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { HeaderProductos } from './components/HeaderProductos'
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
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('all')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos')

  // ============================================================
  // Efecto: cargar productos al montar el componente
  // ============================================================
  useEffect(() => {
    const init = async () => {
      const data = filtroEstado === 'todos'
        ? await productosService.obtenerTodosIncluyendoInactivos()
        : await productosService.obtenerTodos()
      setProductos(data)
      setCargando(false)
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
    const data = filtroEstado === 'todos'
      ? await productosService.obtenerTodosIncluyendoInactivos()
      : await productosService.obtenerTodos()
    setProductos(data)
  }

  // ============================================================
  // Estado de carga
  // ============================================================
  if (cargando) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    )
  }

  // ============================================================
  // Render principal
  // ============================================================
  return (
    <Layout>
      <div className="p-4 md:p-6">
        {/* Header con título y estadísticas inline */}
        <HeaderProductos productos={productosFiltrados} />

        {/* Contenido centrado con max-width */}
        <div className="max-w-screen-xl mx-auto">
          {/* Botón para crear nuevo producto */}
          <button
            onClick={handleCrear}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors mb-4"
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
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {productosFiltrados.map(producto => (
                <FilaProducto key={producto.id} producto={producto} />
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
    </Layout>
  )
}
