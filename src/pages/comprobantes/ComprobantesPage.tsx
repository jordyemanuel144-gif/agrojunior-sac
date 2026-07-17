import { useState, useEffect } from 'react'
import { FileText, Search, MessageCircle, Download, FileTextIcon, ImageIcon, File, ChevronRight, CreditCard } from 'lucide-react'
import { comprobantesService } from '@/services/comprobantes.service'
import type { Comprobante, ComprobanteVenta, ComprobantePago } from '@/types/comprobante.types'
import { formatMoneda, formatFecha } from '@/lib/utils'
import { RUTAS } from '@/config/rutas'
import { PageHeader } from '@/components/layout/PageHeader'
import { useNavigate } from 'react-router-dom'
import { DropdownMenu } from '@/components/ui/DropdownMenu'
import {
  descargarTexto,
  descargarImagen,
  descargarPdf,
  generarMensajeComprobanteVenta,
  generarMensajeComprobantePago
} from '@/lib/comprobante'

type FiltroTipo = 'todos' | 'venta' | 'pago_cobranza'

function TipoBadge({ tipo }: { tipo: Comprobante['tipo'] }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
      tipo === 'venta' 
        ? 'bg-primary-light text-primary-hover' 
        : 'bg-green-100 text-green-700'
    }`}>
      {tipo === 'venta' ? 'Venta' : 'Pago'}
    </span>
  )
}

function EstadoBadge({ estado }: { estado: Comprobante['estado'] }) {
  if (estado === 'anulado') {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
        Anulado
      </span>
    )
  }
  return null
}

function FilaComprobante({ 
  comprobante, 
  onClickRow,
  abrirWhatsApp,
  onDescargar,
}: { 
  comprobante: Comprobante
  onClickRow: () => void
  abrirWhatsApp: (c: Comprobante) => void
  onDescargar: (tipo: 'texto' | 'imagen' | 'pdf') => void
}) {
  const handleFilaClick = () => {
    onClickRow()
  }

  return (
    <div
      className="grid md:grid-cols-6 gap-3 md:gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0"
      onClick={handleFilaClick}
    >
      <div className="md:col-span-1">
        <p className="font-semibold text-gray-900 text-sm">{comprobante.numero}</p>
        <p className="text-xs text-gray-400">{comprobante.hora}</p>
      </div>

      <div className="md:col-span-1">
        <TipoBadge tipo={comprobante.tipo} />
        {comprobante.estado === 'anulado' && <EstadoBadge estado={comprobante.estado} />}
      </div>

      <div className="md:col-span-1 min-w-0">
        <p className="font-medium text-gray-900 truncate text-sm">{comprobante.cliente_nombre}</p>
        {comprobante.cliente_documento && (
          <p className="text-xs text-gray-400">{comprobante.cliente_documento}</p>
        )}
      </div>

      <div className="md:col-span-1">
        <p className="text-sm text-gray-700">{formatFecha(comprobante.fecha)}</p>
      </div>

      <div className="md:col-span-1">
        <p className={`font-bold ${comprobante.estado === 'anulado' ? 'text-gray-400 line-through' : 'text-primary'}`}>
          {formatMoneda(comprobante.total)}
        </p>
      </div>

      <div className="md:col-span-1 flex items-center gap-1.5 justify-end" onClick={e => e.stopPropagation()}>
        <button
          onClick={(e) => { e.stopPropagation(); abrirWhatsApp(comprobante); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">WhatsApp</span>
        </button>
        
        <DropdownMenu
          align="right"
          trigger={
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Descargar</span>
            </span>
          }
          options={[
            { 
              label: 'Texto (.txt)', 
              icon: <FileTextIcon className="w-4 h-4" />,
              onClick: () => onDescargar('texto')
            },
            { 
              label: 'Imagen (.png)', 
              icon: <ImageIcon className="w-4 h-4" />,
              onClick: () => onDescargar('imagen')
            },
            { 
              label: 'PDF (.pdf)', 
              icon: <File className="w-4 h-4" />,
              onClick: () => onDescargar('pdf')
            },
          ]}
        />
        
        <button
          onClick={(e) => { e.stopPropagation(); onClickRow(); }}
          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          title="Ver detalle"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  )
}

export default function ComprobantesPage() {
  const navigate = useNavigate()
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos')

  useEffect(() => {
    async function cargar() {
      const data = await comprobantesService.obtenerTodos()
      setComprobantes(data)
      setCargando(false)
    }
    cargar()
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

  const generarLinkWhatsApp = (telefono: string, mensaje: string): string => {
    const telefonoLimpio = telefono.replace(/\D/g, '')
    const mensajeEncoded = encodeURIComponent(mensaje)
    return `https://wa.me/51${telefonoLimpio}?text=${mensajeEncoded}`
  }

  const abrirWhatsApp = (comprobante: Comprobante) => {
    const mensaje = comprobante.tipo === 'venta'
      ? generarMensajeComprobanteVenta(comprobante as ComprobanteVenta)
      : generarMensajeComprobantePago(comprobante as ComprobantePago)
    
    const telefono = comprobante.cliente_telefono || '51970995140'
    const link = generarLinkWhatsApp(telefono, mensaje)
    window.open(link, '_blank')
  }

  const handleDescargar = (comprobante: Comprobante, tipo: 'texto' | 'imagen' | 'pdf') => {
    if (tipo === 'texto') {
      descargarTexto(comprobante)
    } else if (tipo === 'imagen') {
      descargarImagen(comprobante)
    } else {
      descargarPdf(comprobante)
    }
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
              className="w-full pl-10 pr-4 py-3 text-base bg-white rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary-light outline-none"
            />
          </div>
          <div className="flex gap-2">
            {(['todos', 'venta', 'pago_cobranza'] as const).map(tipo => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filtroTipo === tipo
                    ? 'bg-primary text-white'
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
            <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No hay comprobantes</p>
            <p className="text-sm text-gray-400 mt-1">Los comprobantes aparecerán aquí cuando realices ventas o pagos</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible">
            <div className="hidden md:grid md:grid-cols-6 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>Número</span>
              <span>Tipo</span>
              <span>Cliente</span>
              <span>Fecha</span>
              <span>Total</span>
              <span></span>
            </div>

            <div className="divide-y divide-gray-100">
              {comprobantesFiltrados.map(comprobante => (
                <FilaComprobante
                  key={comprobante.id}
                  comprobante={comprobante}
                  onClickRow={() => navigate(`${RUTAS.ADMIN.COMPROBANTES}/${comprobante.id}`)}
                  abrirWhatsApp={abrirWhatsApp}
                  onDescargar={(tipo) => handleDescargar(comprobante, tipo)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}