// DetalleVenta - Muestra los detalles de una venta específica
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { HeaderDetalleVenta } from './components/HeaderDetalleVenta'
import { InfoClienteVenta } from './components/InfoClienteVenta'
import { TicketVentaDetalle } from './components/TicketVentaDetalle'
import { AccionesVentaDetalle } from './components/AccionesVentaDetalle'
import { ModalAnularVenta } from './components/ModalAnularVenta'
import { ventasService } from '@/services/ventas.service'
import { clientesService } from '@/services/clientes.service'
import { useAuthContext } from '@/context/AuthContext'
import { NOMBRE_NEGOCIO } from '@/config/constantes'
import { RUTAS } from '@/config/rutas'
import type { Venta } from '@/types/venta.types'

export default function DetalleVenta() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuthContext()
  const [venta, setVenta] = useState<Venta | null>(null)
  const [loading, setLoading] = useState(true)
  const [anulando, setAnulando] = useState(false)
  const [showConfirmAnular, setShowConfirmAnular] = useState(false)
  const [errorAcceso, setErrorAcceso] = useState(false)
  const [clienteInfo, setClienteInfo] = useState<{ nombre: string; dni_ruc?: string; tipo: string } | null>(null)

  // Carga la venta por ID con verificación de seguridad
  useEffect(() => {
    if (!id) return
    ventasService.obtenerPorId(id)
      .then(async v => {
        if (!v) {
          setVenta(null)
        } else {
          // Verificar que el usuario puede ver esta venta
          const esVendedor = !isAdmin
          const noPertenece = v.vendedor_id !== user?.id
          if (esVendedor && noPertenece) {
            setErrorAcceso(true)
            setVenta(null)
          } else {
            setVenta(v)
            // Cargar info del cliente (busca en cache primero activo, luego inactivo para histórica)
            let cli = clientesService.obtenerClienteActivoSync(v.cliente_id)
            if (!cli) {
              cli = clientesService.obtenerClienteDelCache(v.cliente_id)
            }
            if (cli) {
              setClienteInfo({
                nombre: cli.nombre,
                dni_ruc: cli.dni_ruc,
                tipo: cli.tipo
              })
            }
          }
        }
      })
      .finally(() => setLoading(false))
  }, [id, isAdmin, user])

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
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // No encontrada o acceso denegado
  if (!venta) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-lg">{errorAcceso ? 'No tienes acceso a esta venta' : 'Venta no encontrada'}</p>
        <button
          onClick={() => navigate(RUTAS.ADMIN.VENTAS)}
          className="mt-2 text-blue-600 hover:underline"
        >
          Volver al historial
        </button>
      </div>
    )
  }

  const esAnulada = venta.estado === 'anulada'

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header sticky con volver y estado */}
        <HeaderDetalleVenta
          venta={venta}
          esAnulada={esAnulada}
          onVolver={() => navigate(RUTAS.ADMIN.VENTAS)}
          onAnular={() => setShowConfirmAnular(true)}
        />

        {/* Contenido principal centrado */}
        <div className="p-4 md:p-6 max-w-xl mx-auto space-y-4">
          {/* Info del cliente */}
<InfoClienteVenta 
              cliente={clienteInfo || { nombre: 'Cliente', dni_ruc: '', tipo: 'minorista' }} 
              vendedor={{ nombre: venta.vendedor_nombre }}
            />

          {/* Banner de saldo pendiente */}
          {esAnulada === false && venta.estado_pago !== 'pagado' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <span className="text-yellow-600">⏱</span>
                  </div>
                  <div>
                    <p className="font-semibold text-yellow-800">Saldo pendiente</p>
                    <p className="text-sm text-yellow-700">
                      Pendiente: S/ {(venta.total - venta.monto_pagado).toFixed(2)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(RUTAS.ADMIN.COBRANZAS)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
                >
                  Cobrar
                </button>
              </div>
            </div>
          )}

          {/* Ticket reimpreso */}
          <TicketVentaDetalle
            venta={venta}
            cliente={clienteInfo || { nombre: 'Cliente', dni_ruc: '', tipo: 'minorista' }}
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
    </>
  )
}
