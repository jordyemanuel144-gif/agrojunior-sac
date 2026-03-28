// DetalleVenta - Muestra los detalles de una venta específica
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { HeaderDetalleVenta } from './components/HeaderDetalleVenta'
import { InfoClienteVenta } from './components/InfoClienteVenta'
import { TicketVentaDetalle } from './components/TicketVentaDetalle'
import { AccionesVentaDetalle } from './components/AccionesVentaDetalle'
import { ModalAnularVenta } from './components/ModalAnularVenta'
import { ventasService } from '@/services/ventas.service'
import { NOMBRE_NEGOCIO } from '@/config/constantes'
import { RUTAS } from '@/config/rutas'
import type { Venta } from '@/types/venta.types'

export default function DetalleVenta() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [venta, setVenta] = useState<Venta | null>(null)
  const [loading, setLoading] = useState(true)
  const [anulando, setAnulando] = useState(false)
  const [showConfirmAnular, setShowConfirmAnular] = useState(false)

  // Carga la venta por ID
  useEffect(() => {
    if (!id) return
    ventasService.obtenerPorId(id)
      .then(setVenta)
      .finally(() => setLoading(false))
  }, [id])

  // Anula la venta
  const handleAnular = async () => {
    if (!venta) return
    setAnulando(true)
    try {
      const actualizada = await ventasService.anular(venta.id)
      setVenta(actualizada)
      setShowConfirmAnular(false)
    } catch (err) {
      console.error('Error al anular:', err)
    } finally {
      setAnulando(false)
    }
  }

  // Imprime el ticket
  const handleImprimir = () => window.print()

  // Envía por WhatsApp
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

  // Loading
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    )
  }

  // No encontrada
  if (!venta) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p className="text-lg">Venta no encontrada</p>
          <button
            onClick={() => navigate(RUTAS.VENTAS)}
            className="mt-2 text-blue-600 hover:underline"
          >
            Volver al historial
          </button>
        </div>
      </Layout>
    )
  }

  const cliente = ventasService.getCliente(venta.cliente_id)
  const esAnulada = venta.estado === 'anulada'

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header sticky con volver y estado */}
        <HeaderDetalleVenta
          venta={venta}
          esAnulada={esAnulada}
          onVolver={() => navigate(RUTAS.VENTAS)}
          onAnular={() => setShowConfirmAnular(true)}
        />

        {/* Contenido principal centrado */}
        <div className="p-4 md:p-6 max-w-xl mx-auto space-y-4">
          {/* Info del cliente */}
          <InfoClienteVenta cliente={cliente} />

          {/* Ticket reimpreso */}
          <TicketVentaDetalle
            venta={venta}
            cliente={cliente}
            esAnulada={esAnulada}
          />

          {/* Acciones (solo si no está anulada) */}
          {!esAnulada && (
            <AccionesVentaDetalle
              onImprimir={handleImprimir}
              onWhatsapp={handleWhatsapp}
            />
          )}
        </div>

        {/* Modal de confirmación */}
        {showConfirmAnular && (
          <ModalAnularVenta
            onConfirmar={handleAnular}
            onCancelar={() => setShowConfirmAnular(false)}
            cargando={anulando}
          />
        )}
      </div>
    </Layout>
  )
}
