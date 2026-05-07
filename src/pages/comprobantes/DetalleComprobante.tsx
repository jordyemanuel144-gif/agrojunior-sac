import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { comprobantesService } from '@/services/comprobantes.service'
import { ventasService } from '@/services/ventas.service'
import type { Comprobante } from '@/types/comprobante.types'
import type { Venta } from '@/types/venta.types'
import { formatFecha } from '@/lib/utils'
import { Cargando } from '@/components/ui/Cargando'
import { EstadoVacio } from '@/components/ui/EstadoVacio'
import { ComprobanteContenido } from './components/ComprobanteContenido'
import { ComprobanteAcciones } from './components/ComprobanteAcciones'

export default function DetalleComprobante() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [comprobante, setComprobante] = useState<Comprobante | null>(null)
  const [ventas, setVentas] = useState<Venta[]>([])
  const [cargando, setCargando] = useState(true)
  const [enviandoImagen, setEnviandoImagen] = useState(false)

  useEffect(() => {
    if (!id) return
    setCargando(true)
    Promise.all([
      comprobantesService.obtenerPorId(id),
      ventasService.obtenerTodos()
    ]).then(([data, dataVentas]) => {
      setComprobante(data)
      setVentas(dataVentas)
    }).finally(() => setCargando(false))
  }, [id])

  const getVentaInfo = (clienteId?: string) => {
    if (!clienteId) return null
    return ventas.find(v => v.cliente_id === clienteId) ?? null
  }

  if (cargando) return <Cargando />
  if (!comprobante) return <EstadoVacio titulo="Comprobante no encontrado" mensaje="El comprobante no existe" />

  const esVenta = comprobante.tipo === 'venta'
  const ventaInfo = esVenta ? getVentaInfo(comprobante.cliente_id) : null

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/comprobantes')}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{comprobante.numero}</h1>
          <p className="text-sm text-gray-500">
            {esVenta ? 'Venta' : 'Pago'} • {formatFecha(comprobante.fecha)}
            {comprobante.hora ? ` • ${comprobante.hora}` : ''}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-4 print:space-y-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <ComprobanteContenido comprobante={comprobante} ventaInfo={ventaInfo} />
        </div>

        <ComprobanteAcciones
          comprobante={comprobante}
          enviandoImagen={enviandoImagen}
          onEnviandoImagenChange={setEnviandoImagen}
        />
      </div>
    </div>
  )
}