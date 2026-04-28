import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, Printer } from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'
import { comprobantesService } from '@/services/comprobantes.service'
import { ventasService } from '@/services/ventas.service'
import { formatFecha } from '@/lib/utils'
import type { Comprobante } from '@/types/comprobante.types'
import type { Venta } from '@/types/venta.types'
import { ComprobanteContenido } from '@/pages/comprobantes/components/ComprobanteContenido'

export default function DetalleComprobante() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { clienteData } = useAuthContext()
  const [comprobante, setComprobante] = useState<Comprobante | null>(null)
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      if (!id || !clienteData) return

      const c = await comprobantesService.obtenerPorId(id)
      if (!c || c.cliente_id !== clienteData.id) {
        setLoading(false)
        return
      }
      
      setComprobante(c)
      
      if (c.tipo === 'venta') {
        const dataVentas = await ventasService.obtenerTodos()
        setVentas(dataVentas)
        setLoading(false)
      } else {
        setLoading(false)
      }
    }

    cargar()
  }, [id, clienteData])

  const handleWhatsapp = () => {
    if (!comprobante) return
    
    if (comprobante.tipo === 'pago_cobranza') {
      const p = comprobante as any
      const msg = encodeURIComponent(
        `*Recibo de Pago*\n${comprobante.numero}\nFecha: ${formatFecha(comprobante.fecha)}\n\nMonto pagado: S/ ${comprobante.total.toFixed(2)}\nNueva deuda: S/ ${p.nueva_deuda.toFixed(2)}\n\nGracias por su pago!`
      )
      window.open(`https://wa.me/?text=${msg}`, '_blank')
    }
  }

  const handleImprimir = () => window.print()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!comprobante) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4">
        <p className="text-lg text-center">Comprobante no encontrado</p>
        <button
          onClick={() => navigate('/mi-cuenta/comprobantes')}
          className="mt-2 text-blue-600 hover:underline"
        >
          Volver a mis comprobantes
        </button>
      </div>
    )
  }

  if (!comprobante.fecha) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4">
        <p className="text-lg text-center">Datos del comprobante incompletos</p>
        <button
          onClick={() => navigate('/mi-cuenta/comprobantes')}
          className="mt-2 text-blue-600 hover:underline"
        >
          Volver a mis comprobantes
        </button>
      </div>
    )
  }

  const esVenta = comprobante.tipo === 'venta'
  const ventaInfo = esVenta ? ventas.find(v => v.cliente_id === comprobante.cliente_id) ?? null : null

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/mi-cuenta/comprobantes')}
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

        {!esVenta && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleWhatsapp}
              className="flex items-center justify-center gap-2 bg-green-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors"
            >
              <Share2 size={18} />
              Compartir
            </button>
            <button
              onClick={handleImprimir}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              <Printer size={18} />
              Imprimir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}