import type { Venta } from '@/types/venta.types'
import { formatMoneda, formatFechaHoraCorta } from '@/lib/utils'

/**
 * Genera un enlace de WhatsApp wa.me con código de país +51 (Perú).
 * La función limpia el teléfono de caracteres no numéricos.
 */
export function generarLinkWhatsApp(telefono: string, mensaje: string): string {
  let telefonoLimpio = telefono.replace(/\D/g, '')
  // Remove leading "51" country code if already present to avoid duplication
  if (telefonoLimpio.startsWith('51') && telefonoLimpio.length > 9) {
    telefonoLimpio = telefonoLimpio.slice(2)
  }
  const mensajeEncoded = encodeURIComponent(mensaje)
  return `https://wa.me/51${telefonoLimpio}?text=${mensajeEncoded}`
}

/**
 * Abre WhatsApp en una nueva pestaña con el número y mensaje indicados.
 */
export function abrirWhatsAppCliente(telefono: string, mensaje: string): void {
  const link = generarLinkWhatsApp(telefono, mensaje)
  window.open(link, '_blank')
}

/**
 * Genera un mensaje de cobranza formateado para enviar por WhatsApp.
 * El formato incluye: título, nombre del cliente, listado de ventas pendientes
 * con productos, total a pagar y datos bancarios.
 */
export function generarMensajeDeuda(
  clienteNombre: string,
  saldoPendiente: number,
  ventasPendientes: Venta[],
): string {
  const lineasVentas = ventasPendientes
    .map((venta) => {
      const pendiente = venta.total - venta.monto_pagado
      const items = (venta.items ?? [])
        .map((i) => `│ • ${i.producto.nombre} x${i.cantidad} = ${formatMoneda(i.subtotal)}`)
        .join('\n')
      const descuento =
        venta.descuento > 0 ? `\n│ Descuento: -${formatMoneda(venta.descuento)}` : ''
      const totalSinDesc =
        venta.descuento > 0 ? `\n│ Total sin descu.: ${formatMoneda(venta.subtotal)}` : ''
      const yaPagado =
        venta.monto_pagado > 0 ? `\n│ Ya pagaste: ${formatMoneda(venta.monto_pagado)}` : ''
      const falta = `\n\n│ FALTA: ${formatMoneda(pendiente)}`
      const fechaCorta = formatFechaHoraCorta(venta.fecha)
      return `┌─ ${venta.ticket_numero.toUpperCase()} - ${fechaCorta} ┐\n│ Estado: ⏳ PENDIENTE\n│\n│ PRODUCTOS:\n│${items}${descuento}${totalSinDesc}${yaPagado}\n│ TOTAL: ${formatMoneda(venta.total)}${falta}\n└─────────────────────────┘`
    })
    .join('\n\n')

  return `RESUMEN DE CUENTA
━━━━━━━━━━━━━━━━━━━━
Hola ${clienteNombre}, gracias por tu preferencia 👋

📋 Pedidos pendientes: ${ventasPendientes.length}

${lineasVentas}

━━━━━━━━━━━━━━━━━━━━
💰 TOTAL A PAGAR: ${formatMoneda(saldoPendiente)}
━━━━━━━━━━━━━━━━━━━━

📱 Yape: 970995140
🏦 Banco de Crédito
Titular: Darly Sanchez Cutipa
Cbta: 215-55555555

Cuando puedes cancelar? Gracias 🙏`
}
