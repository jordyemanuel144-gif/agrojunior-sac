import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, Printer } from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'
import { ventasService } from '@/services/ventas.service'
import { formatMoneda, formatFecha } from '@/lib/utils'
import { NOMBRE_NEGOCIO } from '@/config/constantes'
import type { Venta } from '@/types/venta.types'

export default function DetalleVenta() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { clienteData } = useAuthContext()
  const [venta, setVenta] = useState<Venta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      if (!id || !clienteData) return

      const v = await ventasService.obtenerPorId(id)
      if (!v || v.cliente_id !== clienteData.id) {
        setError(true)
      } else {
        setVenta(v)
      }
      setLoading(false)
    }

    cargar()
  }, [id, clienteData])

  const handleWhatsapp = () => {
    if (!venta) return
    const lineas = venta.items.map(i =>
      `• ${i.producto.nombre} x${i.cantidad}${i.producto.tipo_medida === 'kg' ? 'kg' : ''} = S/ ${i.subtotal.toFixed(2)}`
    ).join('\n')
    const msg = encodeURIComponent(
      `*${NOMBRE_NEGOCIO}*\nTicket: ${venta.ticket_numero}\nFecha: ${venta.fecha.toLocaleDateString('es-PE')}\n\n${lineas}\n\n*Total: S/ ${venta.total.toFixed(2)}*\n¡Gracias por su compra!`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const handleImprimir = () => window.print()

  const getEstadoBadge = (estado?: string) => {
    switch (estado) {
      case 'pagado':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Pagado</span>
      case 'pendiente':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Pendiente</span>
      case 'parcial':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">Parcial</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !venta) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4">
        <p className="text-lg text-center">Venta no encontrada</p>
        <button
          onClick={() => navigate('/mi-cuenta/ventas')}
          className="mt-2 text-blue-600 hover:underline"
        >
          Volver a mis ventas
        </button>
      </div>
    )
  }

  const esAnulada = venta.estado === 'anulada'
  const pendiente = venta.total - (venta.monto_pagado || 0)

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/mi-cuenta/ventas')}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{venta.ticket_numero}</h1>
          <p className="text-sm text-gray-500">
            Venta • {formatFecha(venta.fecha)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 uppercase">Estado</p>
            <div className="mt-1">{esAnulada ? (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Anulada</span>
            ) : (
              getEstadoBadge(venta.estado_pago)
            )}</div>
          </div>
          {!esAnulada && venta.estado_pago !== 'pagado' && (
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase">Pendiente</p>
              <p className="text-lg font-bold text-red-500">{formatMoneda(pendiente)}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-xs text-gray-400 uppercase">Productos</p>
          {venta.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.cantidad} x {item.producto.nombre}
              </span>
              <span className="font-medium">{formatMoneda(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-700">{formatMoneda(venta.subtotal)}</span>
          </div>
          {venta.descuento > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Descuento</span>
              <span className="text-green-600">-{formatMoneda(venta.descuento)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span className="text-gray-900">Total</span>
            <span className="text-blue-600">{formatMoneda(venta.total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <p className="text-xs text-gray-400 uppercase mb-3">Resumen de Pago</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total de la venta:</span>
            <span className="font-medium">{formatMoneda(venta.total)}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Monto pagado:</span>
            <span className="font-medium">{formatMoneda(venta.monto_pagado || 0)}</span>
          </div>
          {venta.estado_pago !== 'pagado' ? (
            <div className="flex justify-between font-bold text-red-600 border-t border-gray-200 pt-2 mt-2">
              <span>Pendiente:</span>
              <span>{formatMoneda(pendiente)}</span>
            </div>
          ) : (
            <div className="flex justify-between font-bold text-green-600 border-t border-gray-200 pt-2 mt-2">
              <span>Estado:</span>
              <span>Cancelado</span>
            </div>
          )}
        </div>
      </div>

      {!esAnulada && (
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
  )
}