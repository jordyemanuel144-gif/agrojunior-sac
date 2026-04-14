// StockActual - Página principal de control de inventario
import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Warehouse } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { FiltrosInventario } from './components/FiltrosInventario'
import { FilaInventario } from './components/FilaInventario'
import { inventarioService } from '@/services/inventario.service'
import { RUTAS } from '@/config/rutas'
import type { ItemStock } from '@/types/inventario.types'

export default function StockActual() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState<ItemStock[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'ok' | 'bajo' | 'agotado'>(() => {
    const filtro = searchParams.get('filtro')
    if (filtro === 'stock_bajo') return 'bajo'
    if (filtro === 'agotado') return 'agotado'
    if (filtro === 'ok') return 'ok'
    return 'todos'
  })

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
      const matchBusqueda =
        busqueda === '' ||
        item.nombre.toLowerCase().includes(busqueda.toLowerCase())

      const matchEstado = filtroEstado === 'todos' || item.estado === filtroEstado

      return matchBusqueda && matchEstado
    })
  }, [items, busqueda, filtroEstado])

  const normal = itemsFiltrados.filter(i => i.estado === 'ok').length
  const bajoStock = itemsFiltrados.filter(i => i.estado === 'bajo').length
  const agotados = itemsFiltrados.filter(i => i.estado === 'agotado').length

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // ============================================================
  // Render principal
  // ============================================================
  return (
    <>
      <div className="p-4 md:p-6">
        <PageHeader
          titulo="Stock Actual"
          icono={Warehouse}
          stats={[
            { label: 'Total', value: itemsFiltrados.length, color: 'gray' },
            { label: 'Normal', value: normal, color: 'green' },
            ...(bajoStock > 0 ? [{ label: 'Bajo stock', value: bajoStock, color: 'amber' as const }] : []),
            ...(agotados > 0 ? [{ label: 'Agotados', value: agotados, color: 'red' as const }] : []),
          ]}
        />

        <div className="max-w-screen-xl mx-auto">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => navigate(RUTAS.ADMIN.INVENTARIO_CONTEO)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Ajuste de Inventario
            </button>
          </div>
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
    </>
  )
}
