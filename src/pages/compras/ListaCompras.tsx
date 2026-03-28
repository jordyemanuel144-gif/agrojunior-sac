// ============================================================
// ListaCompras - Página principal de gestión de compras
// Muestra historial con filtros, búsqueda y botón de crear
// ============================================================
import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { HeaderCompras } from './components/HeaderCompras'
import { FiltrosCompras } from './components/FiltrosCompras'
import { FilaCompra } from './components/FilaCompra'
import { comprasService } from '@/services/compras.service'
import { RUTAS } from '@/config/rutas'
import type { Compra } from '@/types/compra.types'

export default function ListaCompras() {
  // ============================================================
  // Estado local de la página
  // ============================================================
  const [compras, setCompras] = useState<Compra[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'completada' | 'anulada' | 'pendiente'>('todos')
  const [filtroFecha, setFiltroFecha] = useState('')

  // ============================================================
  // Efecto: cargar compras al montar el componente
  // ============================================================
  useEffect(() => {
    const init = async () => {
      const data = await comprasService.obtenerTodos()
      setCompras(data)
      setCargando(false)
    }
    init()
  }, [])

  // ============================================================
  // Memo: filtra compras según criterios de búsqueda y filtros
  // ============================================================
  const comprasFiltradas = useMemo(() => {
    return compras.filter(c => {
      // Filtro por búsqueda: número de compra o nombre del proveedor
      const matchBusqueda =
        busqueda === '' ||
        c.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
        comprasService.getProveedor(c.proveedor_id).toLowerCase().includes(busqueda.toLowerCase())

      // Filtro por estado
      const matchEstado = filtroEstado === 'todos' || c.estado === filtroEstado

      // Filtro por fecha
      const matchFecha = filtroFecha === '' || c.fecha.split('T')[0] === filtroFecha

      return matchBusqueda && matchEstado && matchFecha
    })
  }, [compras, busqueda, filtroEstado, filtroFecha])

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
        <HeaderCompras compras={comprasFiltradas} />

        {/* Contenido centrado con max-width */}
        <div className="max-w-screen-xl mx-auto">
          {/* Botón para crear nueva compra */}
          <Link
            to={`${RUTAS.COMPRAS}/nueva`}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors mb-4"
          >
            <Plus size={20} />
            <span className="font-medium">Nueva Compra</span>
          </Link>

          {/* Filtros de búsqueda */}
          <FiltrosCompras
            busqueda={busqueda}
            filtroEstado={filtroEstado}
            filtroFecha={filtroFecha}
            onBusquedaChange={setBusqueda}
            onEstadoChange={setFiltroEstado}
            onFechaChange={setFiltroFecha}
          />

          {/* Lista de compras o mensaje vacío */}
          {comprasFiltradas.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500">
                {busqueda || filtroEstado !== 'todos' || filtroFecha
                  ? 'No se encontraron compras con los filtros aplicados'
                  : 'No hay compras registradas'}
              </p>
              {(busqueda || filtroEstado !== 'todos' || filtroFecha) && (
                <button
                  onClick={() => { setBusqueda(''); setFiltroEstado('todos'); setFiltroFecha('') }}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {comprasFiltradas.map(compra => (
                <FilaCompra key={compra.id} compra={compra} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
