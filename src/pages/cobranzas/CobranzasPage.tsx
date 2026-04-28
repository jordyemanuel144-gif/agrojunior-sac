import { useCobranzas } from './hooks/useCobranzas'
import { HeaderCobranzas } from './components/HeaderCobranzas'
import { FiltrosCobranzas } from './components/FiltrosCobranzas'
import { ResumenCobranzas } from './components/ResumenCobranzas'
import { ListaCuentasCorrientes } from './components/ListaCuentasCorrientes'
import { ModalRegistrarPago } from './components/ModalRegistrarPago'
import { ToastPagoRegistrado } from './components/ToastPagoRegistrado'
import { descargarTexto, descargarImagen, descargarPdf } from '@/lib/deuda'
import { formatMoneda, formatFechaHoraCorta } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ventasService } from '@/services/ventas.service'

export default function CobranzasPage() {
  const navigate = useNavigate()
  const { cuentas, resumen, filtros, setFiltros, recargar, cargando } = useCobranzas()
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null)
  const [cuentaActualizada, setCuentaActualizada] = useState<string | null>(null)
  const [pagoRegistrado, setPagoRegistrado] = useState<{ comprobanteId: string } | null>(null)

  const abrirPago = (clienteId: string) => {
    setClienteSeleccionado(clienteId)
    setModalPagoAbierto(true)
  }

  const cerrarPago = (result?: { comprobanteId: string }) => {
    const clientePagado = clienteSeleccionado
    setModalPagoAbierto(false)
    setClienteSeleccionado(null)
    recargar()
    if (clientePagado) {
      setCuentaActualizada(clientePagado)
      setTimeout(() => setCuentaActualizada(null), 2500)
    }
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

  const verDetalle = (clienteId: string) => {
    navigate(`/admin/cobranzas/${clienteId}`)
  }

  const generarLinkWhatsApp = (telefono: string, mensaje: string): string => {
    const telefonoLimpio = telefono.replace(/\D/g, '')
    const mensajeEncoded = encodeURIComponent(mensaje)
    return `https://wa.me/51${telefonoLimpio}?text=${mensajeEncoded}`
  }

  const abrirWhatsApp = async (clienteId: string) => {
    const cuenta = cuentas.find(c => c.cliente_id === clienteId)
    if (!cuenta) return

    if (!cuenta.cliente_telefono) {
      alert('El cliente no tiene teléfono registrado. Usa el botón Descargar para guardar el número.')
      return
    }

    const todasVentas = await ventasService.obtenerTodos()
    const ventasPendientes = todasVentas.filter(
      v => v.cliente_id === clienteId && 
      v.estado === 'completada' && 
      v.estado_pago !== 'pagado'
    )

    const lineasVentas = ventasPendientes.map((venta) => {
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
Hola ${cuenta.cliente_nombre}, gracias por tu preferencia 👋

📋 Pedidos pendientes: ${ventasPendientes.length}

${lineasVentas}

━━━━━━━━━━━━━━━━━━━━
💰 TOTAL A PAGAR: ${formatMoneda(cuenta.saldo_pendiente)}
━━━━━━━━━━━━━━━━━━━━

📱 Yape: 916794870
🏦 Banco de Crédito
Titular: Juan Pérez
Cbta: 215-55555555

Cuando puedes cancelar? Gracias 🙏`

    const link = generarLinkWhatsApp(cuenta.cliente_telefono, mensaje)
    window.open(link, '_blank')
  }

  const handleDescargar = async (_cuenta: import('@/types/cuenta-corriente.types').CuentaCorriente, tipo: 'texto' | 'imagen' | 'pdf') => {
    const todasVentas = await ventasService.obtenerTodos()
    const ventasPendientes = todasVentas.filter(
      v => v.cliente_id === _cuenta.cliente_id && 
      v.estado === 'completada' && 
      v.estado_pago !== 'pagado'
    )
    
    if (tipo === 'texto') {
      descargarTexto(_cuenta, ventasPendientes)
    } else if (tipo === 'imagen') {
      descargarImagen(_cuenta, ventasPendientes)
    } else {
      descargarPdf(_cuenta, ventasPendientes)
    }
  }

  return (
    <>
      <HeaderCobranzas />

      <div className="p-4 md:p-6 max-w-screen-xl mx-auto space-y-4">
        {resumen && <ResumenCobranzas resumen={resumen} />}

        <FiltrosCobranzas
          filtros={filtros}
          onChange={setFiltros}
        />

        <ListaCuentasCorrientes
          cuentas={cuentas}
          cargando={cargando}
          onPagar={abrirPago}
          onVerDetalle={verDetalle}
          onWhatsApp={abrirWhatsApp}
          onDescargar={(cuenta, tipo) => handleDescargar(cuenta, tipo)}
          cuentaActualizada={cuentaActualizada}
        />
      </div>

      {modalPagoAbierto && clienteSeleccionado && (
        <ModalRegistrarPago
          clienteId={clienteSeleccionado}
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
