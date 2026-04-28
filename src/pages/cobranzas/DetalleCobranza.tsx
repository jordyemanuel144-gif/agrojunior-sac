import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDetalleCobranza } from './hooks/useCobranzas'
import { clientesService } from '@/services/clientes.service'
import { cuentaCorrienteService } from '@/services/cuenta-corriente.service'
import { ModalRegistrarPago } from './components/ModalRegistrarPago'
import { ToastPagoRegistrado } from './components/ToastPagoRegistrado'
import { HeaderDetalleCobranza } from './components/HeaderDetalleCobranza'
import { ResumenCuenta } from './components/ResumenCuenta'
import { ListaVentasPendientes } from './components/ListaVentasPendientes'
import { HistorialPagos } from './components/HistorialPagos'
import { AccionesCobranza } from './components/AccionesCobranza'
import { descargarTexto, descargarImagen, descargarPdf } from '@/lib/deuda'
import { formatMoneda, formatFechaHoraCorta } from '@/lib/utils'
import type { Cliente } from '@/types/cliente.types'
import type { MovimientoCuentaCorriente } from '@/types/cuenta-corriente.types'

export default function DetalleCobranza() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { cuenta, ventas, cargando, recargar } = useDetalleCobranza(id || '')
  
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [movimientos, setMovimientos] = useState<MovimientoCuentaCorriente[]>([])
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false)
  const [pagoRegistrado, setPagoRegistrado] = useState<{ comprobanteId: string } | null>(null)

  useEffect(() => {
    if (id) {
      clientesService.obtenerPorId(id).then(setCliente)
    }
  }, [id])

  useEffect(() => {
    const cargarMovimientos = async () => {
      if (!id) return
      const movs = await cuentaCorrienteService.obtenerMovimientos(id)
      const pagos = movs.filter(m => m.tipo === 'pago')
      setMovimientos(pagos)
    }
    cargarMovimientos()
  }, [id, cuenta])

  const handlePagar = () => {
    if (!id) return
    setModalPagoAbierto(true)
  }

  const cerrarPago = (result?: { comprobanteId: string }) => {
    setModalPagoAbierto(false)
    recargar()
    if (result?.comprobanteId) {
      setPagoRegistrado({ comprobanteId: result.comprobanteId })
    }
  }

  useEffect(() => {
    if (pagoRegistrado) {
      const timer = setTimeout(() => setPagoRegistrado(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [pagoRegistrado])

  const generarLinkWhatsApp = (telefono: string, mensaje: string): string => {
    const telefonoLimpio = telefono.replace(/\D/g, '')
    const mensajeEncoded = encodeURIComponent(mensaje)
    return `https://wa.me/51${telefonoLimpio}?text=${mensajeEncoded}`
  }

  const abrirWhatsApp = async () => {
    if (!id || !cuenta || !cliente) return
    if (cuenta.saldo_pendiente <= 0) return

    if (!cliente.telefono) {
      alert('El cliente no tiene teléfono registrado. Usa el botón Descargar para guardar el número.')
      return
    }

    const lineasVentas = ventas.map((venta) => {
      const pendiente = venta.total - venta.monto_pagado
      const items = venta.items.map(i => `│ • ${i.producto.nombre} x${i.cantidad} = ${formatMoneda(i.subtotal)}`).join('\n')
      const descuento = venta.descuento > 0 ? `\n│ Descuento: -${formatMoneda(venta.descuento)}` : ''
      const totalSinDesc = venta.descuento > 0 ? `\n│ Total sin descu.: ${formatMoneda(venta.subtotal)}` : ''
      const yaPagado = venta.monto_pagado > 0 ? `\n│ Ya pagaste: ${formatMoneda(venta.monto_pagado)}` : ''
      const falta = `\n\n│ FALTA: ${formatMoneda(pendiente)}`
      const fechaCorta = formatFechaHoraCorta(venta.fecha)
      return `┌─ ${venta.ticket_numero.toUpperCase()} - ${fechaCorta} ┐\n│ Estado: ⏳ PENDIENTE\n│\n│ PRODUCTOS:\n│${items}${descuento}${totalSinDesc}${yaPagado}\n│ TOTAL: ${formatMoneda(venta.total)}${falta}\n└─────────────────────────┘`
    }).join('\n\n')

    const mensaje = `RESUMEN DE CUENTA
━━━━━━━━━━━━━━━━━━━━
Hola ${cliente.nombre}, gracias por tu preferencia 👋

📋 Pedidos pendientes: ${ventas.length}

${lineasVentas}

━━━━━━━━━━━━━━━━━━━━
💰 TOTAL A PAGAR: ${formatMoneda(cuenta.saldo_pendiente)}
━━━━━━━━━━━━━━━━━━━━

📱 Yape: 916794870
🏦 Banco de Crédito
Titular: Juan Pérez
Cbta: 215-55555555

Cuando puedes cancelar? Gracias 🙏`

    const link = generarLinkWhatsApp(cliente.telefono, mensaje)
    window.open(link, '_blank')
  }

  const handleDescargar = async (tipo: 'texto' | 'imagen' | 'pdf') => {
    if (!cuenta || !id) return
    
    if (tipo === 'texto') {
      descargarTexto(cuenta, ventas)
    } else if (tipo === 'imagen') {
      descargarImagen(cuenta, ventas)
    } else {
      descargarPdf(cuenta, ventas)
    }
  }

  const handleVolver = () => {
    navigate('/admin/cobranzas')
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!cuenta || !cliente) {
    return (
      <div className="p-6 max-w-screen-xl mx-auto">
        <HeaderDetalleCobranza cliente={null} onVolver={handleVolver} />
        <div className="text-center py-12">
          <p className="text-gray-500">Cuenta no encontrada</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <HeaderDetalleCobranza cliente={cliente} onVolver={handleVolver} />

      <div className="p-4 md:p-6 max-w-screen-xl mx-auto space-y-4">
        <ResumenCuenta cuenta={cuenta} />

        <AccionesCobranza
          cuenta={cuenta}
          onPagar={handlePagar}
          onWhatsApp={abrirWhatsApp}
          onDescargar={handleDescargar}
        />

        <ListaVentasPendientes ventas={ventas} />

        <HistorialPagos movimientos={movimientos} />
      </div>

      {modalPagoAbierto && id && (
        <ModalRegistrarPago
          clienteId={id}
          onCerrar={cerrarPago}
        />
      )}

      {pagoRegistrado && (
        <ToastPagoRegistrado
          comprobanteId={pagoRegistrado.comprobanteId}
          onCerrar={() => setPagoRegistrado(null)}
        />
      )}
    </>
  )
}