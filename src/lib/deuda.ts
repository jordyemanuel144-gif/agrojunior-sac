import type { Venta } from '@/types/venta.types'
import type { CuentaCorriente } from '@/types/cuenta-corriente.types'
import { formatMoneda } from '@/lib/utils'
import { configuracionService } from '@/services/configuracion.service'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

interface DatosPago {
  yape: string
  banco: string
  titular: string
  cuenta: string
}

function obtenerDatosPago(): DatosPago {
  const negocio = configuracionService.getNegocio()
  return {
    yape: negocio.yape || '916794870',
    banco: negocio.banco_nombre || 'Banco de Crédito',
    titular: negocio.banco_titular || 'Juan Pérez',
    cuenta: negocio.banco_cuenta || '215-55555555',
  }
}

function formatearItemsVenta(venta: Venta): string {
  const items = venta.items
    .map(
      (item) =>
        `│ • ${item.producto.nombre} x${item.cantidad} = ${formatMoneda(item.subtotal)}`
    )
    .join('\n')
  return items
}

export function generarMensajeDeuda(
  cuenta: CuentaCorriente,
  ventas: Venta[]
): string {
  const datosPago = obtenerDatosPago()

  const lineasVentas = ventas.map((venta) => {
    const pendiente = venta.total - venta.monto_pagado
    const items = formatearItemsVenta(venta)
    const descuento = venta.descuento > 0 ? `\n│ Descuento: -${formatMoneda(venta.descuento)}` : ''
    const yaPagado = venta.monto_pagado > 0 ? `\n│ (Ya pagaste: ${formatMoneda(venta.monto_pagado)})` : ''
    const fechaDia = venta.fecha.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short' })
    const hora = venta.fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })

    return `┌─ ${venta.ticket_numero.toUpperCase()} - ${fechaDia} ${hora} ─┐\n${items}${descuento}${yaPagado}\n└ 💰 Total: ${formatMoneda(venta.total)} → Falta: ${formatMoneda(pendiente)} ┘`
  })

  const mensaje = `RESUMEN DE CUENTA
━━━━━━━━━━━━━━━━━━━━
Hola ${cuenta.cliente_nombre}, gracias por tu preferencia 👋

📋 Pedidos pendientes: ${ventas.length}

${lineasVentas.join('\n\n')}

━━━━━━━━━━━━━━━━━━━━
💰 TOTAL A PAGAR: ${formatMoneda(cuenta.saldo_pendiente)}
━━━━━━━━━━━━━━━━━━━━

📱 Yape: ${datosPago.yape}
🏦 ${datosPago.banco}
Titular: ${datosPago.titular}
Cbta: ${datosPago.cuenta}

Cuando puedes cancelar? Gracias 🙏`

  return mensaje
}

export function generarHtmlDeuda(
  cuenta: CuentaCorriente,
  ventas: Venta[]
): string {
  const datosPago = obtenerDatosPago()

  const lineasVentas = ventas
    .map((venta) => {
      const pendiente = venta.total - venta.monto_pagado
      const items = venta.items
        .map(
          (item) =>
            `<div style="padding: 2px 0;">• ${item.producto.nombre} x${item.cantidad} = ${formatMoneda(item.subtotal)}</div>`
        )
        .join('')
      const descuento = venta.descuento > 0 
        ? `<div style="padding: 2px 0;">Descuento: -${formatMoneda(venta.descuento)}</div>` 
        : ''
      const yaPagado = venta.monto_pagado > 0 
        ? `<div style="padding: 2px 0;">(Ya pagaste: ${formatMoneda(venta.monto_pagado)})</div>` 
        : ''
      const fechaDia = venta.fecha.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short' })
      const hora = venta.fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })

      return `
      <div style="margin-bottom: 16px; border: 2px solid #1f2937; border-radius: 8px; overflow: hidden;">
        <div style="background: #1f2937; color: white; padding: 6px 10px; font-size: 12px; font-weight: bold;">
          ${venta.ticket_numero.toUpperCase()} - ${fechaDia} ${hora}
        </div>
        <div style="padding: 10px 12px; font-size: 12px;">
          ${items}
          ${descuento}
          ${yaPagado}
          <div style="padding-top: 6px; border-top: 1px dashed #e5e7eb; margin-top: 6px; font-weight: bold;">
            💰 Total: ${formatMoneda(venta.total)} → Falta: ${formatMoneda(pendiente)}
          </div>
        </div>
      </div>`
    })
    .join('')

  return `
<div style="width: 420px; font-family: Arial, sans-serif; font-size: 14px; color: #1f2937; background: white; padding: 24px;">
  <div style="background: #2563eb; color: white; padding: 16px; text-align: center; border-radius: 8px 8px 0 0;">
    <div style="font-size: 20px; font-weight: bold;">RESUMEN DE CUENTA</div>
  </div>
  
  <div style="padding: 12px; border: 1px solid #e5e7eb; border-top: none;">
    <div style="font-weight: bold; font-size: 16px;">Cliente: ${cuenta.cliente_nombre}</div>
    <div style="font-size: 12px; color: #6b7280;">Tipo: ${cuenta.cliente_tipo}</div>
  </div>
  
  <div style="background: #fef3c7; padding: 16px; text-align: center; border-radius: 4px; margin: 12px 0;">
    <div style="font-size: 20px; font-weight: bold;">💰 TOTAL A PAGAR: ${formatMoneda(cuenta.saldo_pendiente)}</div>
  </div>
  
  <div style="padding: 12px 0;">
    <div style="font-weight: bold; margin-bottom: 12px; font-size: 14px;">📋 ${ventas.length} PEDIDOS PENDIENTES</div>
    ${lineasVentas}
  </div>
  
  <div style="background: #1f2937; color: white; padding: 12px; border-radius: 4px; font-size: 12px;">
    <div style="font-weight: bold; margin-bottom: 4px;">📱 Yape: ${datosPago.yape}</div>
    <div>🏦 ${datosPago.banco} - ${datosPago.titular}</div>
    <div>Cbta: ${datosPago.cuenta}</div>
  </div>
  
  <div style="text-align: center; padding: 16px; font-size: 12px; color: #9ca3af;">
    🙏 ¡Gracias por tu preferencia!
  </div>
</div>`
}

export function descargarTexto(cuenta: CuentaCorriente, ventas: Venta[]): void {
  const mensaje = generarMensajeDeuda(cuenta, ventas)
  const blob = new Blob([mensaje], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `deuda-${cuenta.cliente_nombre.replace(/\s+/g, '-')}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function descargarImagen(cuenta: CuentaCorriente, ventas: Venta[]): void {
  const html = generarHtmlDeuda(cuenta, ventas)
  
  const container = document.createElement('div')
  container.id = 'deuda-descarga-img'
  container.style.cssText = 'position: fixed; left: -9999px; top: 0;'
  container.innerHTML = html
  document.body.appendChild(container)

  html2canvas(container, { scale: 2, backgroundColor: '#ffffff' })
    .then((canvas) => {
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = url
      link.download = `deuda-${cuenta.cliente_nombre.replace(/\s+/g, '-')}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      document.body.removeChild(container)
    })
    .catch((err) => {
      console.error('Error al generar imagen:', err)
      document.body.removeChild(container)
    })
}

export function descargarPdf(cuenta: CuentaCorriente, ventas: Venta[]): void {
  try {
    const datosPago = obtenerDatosPago()
    const doc = new jsPDF()
    
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 10
    
    doc.setFillColor(37, 99, 235)
    doc.rect(0, y, pageWidth, 25, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('RESUMEN DE CUENTA', pageWidth / 2, y + 17, { align: 'center' })
    
    y += 35
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Cliente: ${cuenta.cliente_nombre}`, 10, y)
    y += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Tipo: ${cuenta.cliente_tipo}`, 10, y)
    
    y += 15
    doc.setFillColor(254, 243, 199)
    doc.rect(10, y, pageWidth - 20, 15, 'F')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`TOTAL A PAGAR: S/ ${cuenta.saldo_pendiente.toFixed(2)}`, pageWidth / 2, y + 10, { align: 'center' })
    
    y += 25
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`${ventas.length} PEDIDOS PENDIENTES`, 10, y)
    y += 10
    
    for (const venta of ventas) {
      const pendiente = venta.total - venta.monto_pagado
      doc.setFillColor(30, 41, 59)
      doc.rect(10, y, pageWidth - 20, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(9)
      const fechaDia = venta.fecha.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short' })
      const hora = venta.fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
      doc.text(`${venta.ticket_numero.toUpperCase()} - ${fechaDia} ${hora}`, 12, y + 5.5)
      y += 12
      
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      for (const item of venta.items) {
        doc.text(`• ${item.producto.nombre} x${item.cantidad} = S/ ${item.subtotal.toFixed(2)}`, 12, y)
        y += 5
      }
      
      if (venta.descuento > 0) {
        doc.text(`Descuento: -S/ ${venta.descuento.toFixed(2)}`, 12, y)
        y += 5
      }
      if (venta.monto_pagado > 0) {
        doc.text(`(Ya pagaste: S/ ${venta.monto_pagado.toFixed(2)})`, 12, y)
        y += 5
      }
      
      doc.setFont('helvetica', 'bold')
      doc.text(`Total: S/ ${venta.total.toFixed(2)} → Falta: S/ ${pendiente.toFixed(2)}`, 12, y)
      y += 12
    }
    
    y += 10
    doc.setFillColor(30, 41, 59)
    doc.rect(10, y, pageWidth - 20, 25, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text(`Yape: ${datosPago.yape}`, 12, y + 8)
    doc.text(`${datosPago.banco} - ${datosPago.titular}`, 12, y + 14)
    doc.text(`Cbta: ${datosPago.cuenta}`, 12, y + 20)
    
    y += 35
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(9)
    doc.text('¡Gracias por tu preferencia!', pageWidth / 2, y, { align: 'center' })
    
    doc.save(`deuda-${cuenta.cliente_nombre.replace(/\s+/g, '-')}.pdf`)
  } catch (error) {
    console.error('Error al generar PDF:', error)
    alert('Error al generar PDF. Por favor intenta con imagen.')
  }
}