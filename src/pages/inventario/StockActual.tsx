// ============================================================
// StockActual - Página principal de control de inventario
// Muestra stock actual de todos los productos con filtros
// ============================================================
import { useState, useEffect, useMemo } from 'react'
import { Layout } from '@/components/layout/Layout'
import { HeaderInventario } from './components/HeaderInventario'
import { FiltrosInventario } from './components/FiltrosInventario'
import { FilaInventario } from './components/FilaInventario'
import { inventarioService } from '@/services/inventario.service'
import type { ItemStock } from '@/types/inventario.types'

export default function StockActual() {
  // ============================================================
  // Estado local de la página
  // ============================================================
  const [items, setItems] = useState<ItemStock[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'ok' | 'bajo' | 'agotado'>('todos')

  // ============================================================
  // Efecto: cargar inventario al montar el componente
  // ============================================================
  useEffect(() => {
    const init = async () => {
      const data = await inventarioService.obtenerStock()
      setItems(data)
      setCargando(false)
    }
    init()
  }, [])

  // ============================================================
  // Memo: filtra items según criterios de búsqueda y filtros
  // ============================================================
  const itemsFiltrados = useMemo(() => {
    return items.filter(item => {
      // Filtro por búsqueda: nombre del producto
      const matchBusqueda =
        busqueda === '' ||
        item.nombre.toLowerCase().includes(busqueda.toLowerCase())

      // Filtro por estado
      const matchEstado = filtroEstado === 'todos' || item.estado === filtroEstado

      return matchBusqueda && matchEstado
    })
  }, [items, busqueda, filtroEstado])

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
        <HeaderInventario items={itemsFiltrados} />

        {/* Contenido centrado con max-width */}
        <div className="max-w-screen-xl mx-auto">
          {/* Filtros de búsqueda */}
          <FiltrosInventario
            busqueda={busqueda}
            filtroEstado={filtroEstado}
            onBusquedaChange={setBusqueda}
            onEstadoChange={setFiltroEstado}
          />

          {/* Lista de items o mensaje vacío */}
          {itemsFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500">
                {busqueda || filtroEstado !== 'todos'
                  ? 'No se encontraron productos con los filtros aplicados'
                  : 'No hay productos en el inventario'}
              </p>
              {(busqueda || filtroEstado !== 'todos') && (
                <button
                  onClick={() => { setBusqueda(''); setFiltroEstado('todos') }}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {itemsFiltrados.map(item => (
                <FilaInventario key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
