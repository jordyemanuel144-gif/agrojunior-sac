// ============================================================
// DetalleProducto - Página de detalle de un producto
// Muestra información completa y acciones disponibles
// ============================================================
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Edit2, ToggleLeft, ToggleRight } from 'lucide-react'
import { FormularioProducto } from './components/FormularioProducto'
import { productosService } from '@/services/productos.service'
import { RUTAS } from '@/config/rutas'
import type { Producto, NuevoProducto } from '@/types/producto.types'

export default function DetalleProducto() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [categorias, setCategorias] = useState<Record<string, string>>({})
  const [cargando, setCargando] = useState(true)
  const [mostrarEditar, setMostrarEditar] = useState(false)

  useEffect(() => {
    if (id) {
      Promise.all([
        productosService.obtenerPorId(id),
        productosService.obtenerCategorias()
      ])
        .then(([prod, cats]) => {
          setProducto(prod)
          const mapa: Record<string, string> = {}
          for (const cat of cats) {
            mapa[cat.id] = cat.nombre
          }
          setCategorias(mapa)
        })
        .finally(() => setCargando(false))
    }
  }, [id])

  const handleGuardar = async (datos: NuevoProducto) => {
    if (!id) return
    const actualizado = await productosService.actualizar(id, datos)
    setProducto(actualizado)
    setMostrarEditar(false)
  }

  const handleToggleActivo = async () => {
    if (!producto) return
    const actualizado = await productosService.actualizar(producto.id, { activo: !producto.activo })
    setProducto(actualizado)
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="p-6 max-w-screen-xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Producto no encontrado</p>
        </div>
      </div>
    )
  }

  const nombreCategoria = categorias[producto.categoria_id] ?? producto.categoria_id
  const tieneStock = producto.stock_actual > 0
  const stockBajo = producto.stock_actual > 0 && producto.stock_actual <= producto.stock_minimo

  const stockColor = !tieneStock ? 'text-red-500' : stockBajo ? 'text-amber-500' : 'text-green-600'
  const stockBg = !tieneStock ? 'bg-red-50' : stockBajo ? 'bg-amber-50' : 'bg-green-50'

  return (
    <>
      {/* Header sticky */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto">
          {/* Barra superior con volver */}
          <div className="flex items-center gap-4 p-4">
            <button
              onClick={() => navigate(RUTAS.ADMIN.PRODUCTOS)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Volver</span>
            </button>
            <div className="flex-1" />
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              producto.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}>
              {producto.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {/* Info del producto */}
          <div className="flex items-center gap-4 px-4 pb-4">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              {producto.imagen_url ? (
                <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" />
              ) : (
                <Package size={32} className="text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{producto.nombre}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-gray-500">Código: {producto.codigo}</span>
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-sm">{nombreCategoria}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Info principal */}
          <div className="md:col-span-2 space-y-4">
            {/* Precios */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Precios</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Costo</p>
                  <p className="text-lg font-bold text-gray-900">S/ {producto.precio_costo.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Minorista</p>
                  <p className="text-lg font-bold text-gray-900">S/ {producto.precio_minorista.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Mayorista</p>
                  <p className="text-lg font-bold text-gray-900">S/ {producto.precio_mayorista.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Especial</p>
                  <p className="text-lg font-bold text-gray-900">S/ {producto.precio_especial.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Stock */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Stock</h3>
              <div className="flex items-center gap-6">
                <div className={`px-4 py-3 rounded-xl ${stockBg}`}>
                  <p className={`text-3xl font-bold ${stockColor}`}>
                    {producto.stock_actual.toFixed(producto.tipo_medida === 'kg' ? 1 : 0)}
                  </p>
                  <p className="text-sm text-gray-500">{producto.tipo_medida}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Stock mínimo</p>
                  <p className="text-lg font-medium text-gray-900">
                    {producto.stock_minimo.toFixed(producto.tipo_medida === 'kg' ? 1 : 0)} {producto.tipo_medida}
                  </p>
                  {!tieneStock && <p className="text-sm text-red-500">Agotado</p>}
                  {stockBajo && tieneStock && <p className="text-sm text-amber-500">Bajo stock</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Acciones</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setMostrarEditar(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-medium text-sm"
                >
                  <Edit2 size={18} />
                  Editar Producto
                </button>
                <button
                  onClick={handleToggleActivo}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-colors font-medium text-sm ${
                    producto.activo
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {producto.activo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  {producto.activo ? 'Desactivar' : 'Activar'} Producto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de edición */}
      {mostrarEditar && (
        <FormularioProducto
          producto={producto}
          onCerrar={() => setMostrarEditar(false)}
          onGuardar={handleGuardar}
        />
      )}
    </>
  )
}
