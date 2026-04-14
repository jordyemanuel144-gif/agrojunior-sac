import { useState, useEffect } from 'react'
import { FileText, Search, ChevronRight } from 'lucide-react'
import { comprobantesService } from '@/services/comprobantes.service'
import type { Comprobante } from '@/types/comprobante.types'
import { formatMoneda, formatFecha } from '@/lib/utils'
import { RUTAS } from '@/config/rutas'
import { PageHeader } from '@/components/layout/PageHeader'
import { useNavigate } from 'react-router-dom'

type FiltroTipo = 'todos' | 'venta' | 'pago_cobranza'

export default function ComprobantesPage() {
  const navigate = useNavigate()
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos')

  useEffect(() => {
    const data = comprobantesService.obtenerTodos()
    setComprobantes(data)
    setCargando(false)
  }, [])

  const comprobantesFiltrados = comprobantes.filter(c => {
    const matchBusqueda = !busqueda || 
      c.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase())
    const matchTipo = filtroTipo === 'todos' || c.tipo === filtroTipo
    return matchBusqueda && matchTipo
  })

  const ventasCount = comprobantes.filter(c => c.tipo === 'venta').length
  const pagosCount = comprobantes.filter(c => c.tipo === 'pago_cobranza').length

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        titulo="Comprobantes"
        icono={FileText}
        stats={[
          { label: 'Total', value: comprobantes.length, color: 'gray' },
          { label: 'Ventas', value: ventasCount, color: 'blue' },
          { label: 'Pagos', value: pagosCount, color: 'green' },
        ]}
      />

      <div className="max-w-screen-xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número o cliente..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-base bg-white rounded-xl border border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>
          <div className="flex gap-2">
            {(['todos', 'venta', 'pago_cobranza'] as const).map(tipo => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filtroTipo === tipo
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tipo === 'todos' ? 'Todos' : tipo === 'venta' ? 'Ventas' : 'Pagos'}
              </button>
            ))}
          </div>
        </div>

        {comprobantesFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No hay comprobantes</p>
            <p className="text-sm text-gray-400 mt-1">Los comprobantes aparecerán aquí cuandorealices ventas o pagos</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="hidden md:grid grid-cols-6 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase">
              <div className="col-span-1">Número</div>
              <div className="col-span-1">Tipo</div>
              <div className="col-span-2">Cliente</div>
              <div className="col-span-1">Fecha</div>
              <div className="col-span-1 text-right">Total</div>
            </div>

            {comprobantesFiltrados.map(comprobante => (
              <div
                key={comprobante.id}
                className="flex items-center gap-3 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`${RUTAS.ADMIN.COMPROBANTES}/${comprobante.id}`)}
              >
                <div className="flex-1 min-w-0 grid md:grid-cols-6 gap-2 items-center">
                  <div className="col-span-1">
                    <p className="font-semibold text-gray-900 text-sm">{comprobante.numero}</p>
                  </div>
                  <div className="col-span-1">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      comprobante.tipo === 'venta' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {comprobante.tipo === 'venta' ? 'Venta' : 'Pago'}
                    </span>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm">{comprobante.cliente_nombre}</p>
                    {comprobante.cliente_documento && (
                      <p className="text-xs text-gray-400">{comprobante.cliente_documento}</p>
                    )}
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm text-gray-500">{formatFecha(comprobante.fecha)}</p>
                  </div>
                  <div className="col-span-1 text-right">
                    <p className="font-bold text-gray-900">{formatMoneda(comprobante.total)}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}