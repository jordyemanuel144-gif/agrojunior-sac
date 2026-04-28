// ListaCompras - Página principal de gestión de compras
import { useState, useEffect, useMemo } from 'react'
import { Plus, ShoppingCart } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { FiltrosCompras } from './components/FiltrosCompras'
import { FilaCompra } from './components/FilaCompra'
import { FormularioNuevaCompra } from './components/FormularioNuevaCompra'
import { comprasService } from '@/services/compras.service'
import type { Compra } from '@/types/compra.types'
import { 
  type RangoFecha, 
  esHoy, 
  esEstaSemana, 
  esEsteMes, 
  estaEnRango,
  getFechaISO 
} from '@/lib/utils'

export default function ListaCompras() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'completada' | 'anulada' | 'pendiente'>('todos')
  const [filtroFecha, setFiltroFecha] = useState<RangoFecha>('hoy')
  const [rangoPersonalizado, setRangoPersonalizado] = useState({
    inicio: getFechaISO(new Date()),
    fin: getFechaISO(new Date()),
  })

  useEffect(() => {
    const init = async () => {
      try {
        setCargando(true)
        const data = await comprasService.obtenerTodos()
        setCompras(data)
      } catch (error) {
        console.error('Error al cargar compras:', error)
      } finally {
        setCargando(false)
      }
    }
    init()
  }, [])

  const comprasFiltradas = useMemo(() => {
    return compras.filter(c => {
      const matchBusqueda =
        busqueda === '' ||
        c.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
        comprasService.getProveedor(c.proveedor_id).toLowerCase().includes(busqueda.toLowerCase())

      const matchEstado = filtroEstado === 'todos' || c.estado === filtroEstado

      let matchFecha = true
      if (filtroFecha === 'hoy') {
        matchFecha = esHoy(c.fecha)
      } else if (filtroFecha === 'semana') {
        matchFecha = esEstaSemana(c.fecha)
      } else if (filtroFecha === 'mes') {
        matchFecha = esEsteMes(c.fecha)
      } else if (filtroFecha === 'rango') {
        matchFecha = estaEnRango(c.fecha, rangoPersonalizado.inicio, rangoPersonalizado.fin)
      }

      return matchBusqueda && matchEstado && matchFecha
    })
  }, [compras, busqueda, filtroEstado, filtroFecha, rangoPersonalizado])

  const completadas = comprasFiltradas.filter(c => c.estado === 'completada')
  const totalMonto = completadas.reduce((acc, c) => acc + c.total, 0)
  const anuladas = comprasFiltradas.filter(c => c.estado === 'anulada').length
  const pendientes = comprasFiltradas.filter(c => c.estado === 'pendiente').length

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <div className="p-4 md:p-6">
        <PageHeader
          titulo="Historial de Compras"
          icono={ShoppingCart}
          stats={[
            { label: 'Total', value: `S/ ${totalMonto.toFixed(2)}`, color: 'gray' },
            { label: 'Completadas', value: completadas.length, color: 'green' },
            ...(pendientes > 0 ? [{ label: 'Pendientes', value: pendientes, color: 'amber' as const }] : []),
            ...(anuladas > 0 ? [{ label: 'Anuladas', value: anuladas, color: 'red' as const }] : []),
          ]}
        />

        <div className="max-w-screen-xl mx-auto">
          <button
            onClick={() => setMostrarForm(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors mb-4"
          >
            <Plus size={20} />
            <span className="font-medium">Nueva Compra</span>
          </button>

          <FiltrosCompras
            busqueda={busqueda}
            filtroEstado={filtroEstado}
            filtroFecha={filtroFecha}
            rangoPersonalizado={rangoPersonalizado}
            onBusquedaChange={setBusqueda}
            onEstadoChange={setFiltroEstado}
            onFechaChange={setFiltroFecha}
            onRangoChange={setRangoPersonalizado}
          />

          {comprasFiltradas.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500">
                {busqueda || filtroEstado !== 'todos' || filtroFecha !== 'todos'
                  ? 'No se encontraron compras con los filtros aplicados'
                  : 'No hay compras registradas'}
              </p>
              {(busqueda || filtroEstado !== 'todos' || filtroFecha !== 'todos') && (
                <button
                  onClick={() => { setBusqueda(''); setFiltroEstado('todos'); setFiltroFecha('hoy') }}
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

        {mostrarForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <FormularioNuevaCompra
                onCerrar={() => setMostrarForm(false)}
                onGuardar={async () => {
                  setMostrarForm(false)
                  const data = await comprasService.obtenerTodos()
                  setCompras(data)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
