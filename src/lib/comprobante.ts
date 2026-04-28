import { formatMoneda, formatFecha, formatFechaHoraCorta } from './utils'
import { NOMBRE_NEGOCIO, RUC_NEGOCIO, DIRECCION_NEGOCIO, TELEFONO } from '@/config/constantes'
import type { Comprobante, ComprobanteVenta, ComprobantePago, VentaEnComprobante } from '@/types/comprobante.types'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { formatFecha as utilFormatFecha } from './utils'

export function generarMensajeComprobanteVenta(comprobante: ComprobanteVenta): string {
  const negocio = { nombre: NOMBRE_NEGOCIO, ruc: RUC_NEGOCIO, direccion: DIRECCION_NEGOCIO, telefono: TELEFONO }
  const items = comprobante.items.map(i => `${i.cantidad} x ${i.nombre}: ${formatMoneda(i.subtotal)}`).join('\n')

  return `📄 COMPROBANTE - ${negocio.nombre.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━
RUC: ${negocio.ruc}
${negocio.direccion}
📞 ${negocio.telefono}

📅 ${formatFecha(comprobante.fecha)}${comprobante.hora ? ` ${comprobante.hora}` : ''}
🎫 Ticket: ${comprobante.numero}

👤 CLIENTE
${comprobante.cliente_nombre}

📦 PRODUCTOS
${items}

━━━━━━━━━━━━━━━━━━━━
Subtotal: ${formatMoneda(comprobante.subtotal)}
${comprobante.descuento > 0 ? `Descuento: -${formatMoneda(comprobante.descuento)}\n` : ''}${comprobante.igv > 0 ? `IGV: ${formatMoneda(comprobante.igv)}\n` : ''}TOTAL: ${formatMoneda(comprobante.total)}

Método de pago: ${comprobante.metodo_pago}
Vendedor: ${comprobante.vendedor_nombre}

✦ GRACIAS POR SU COMPRA ✦`
}

export function generarMensajeComprobantePago(comprobante: ComprobantePago): string {
  const negocio = { nombre: NOMBRE_NEGOCIO, ruc: RUC_NEGOCIO, direccion: DIRECCION_NEGOCIO, telefono: TELEFONO }

  const lineasVentas = comprobante.ventas.map((v: VentaEnComprobante) => {
    const items = v.items.map(i => `│ • ${i.nombre} x${i.cantidad} = ${formatMoneda(i.subtotal)}`).join('\n')
    const descuento = v.descuento > 0 ? `\n│ Descuento: -${formatMoneda(v.descuento)}` : ''
    const totalSinDesc = v.descuento > 0 ? `\n│ Total sin descu.: ${formatMoneda(v.subtotal)}` : ''
    const yaPagado = v.monto_pagado_anterior > 0 ? `\n│ Ya pagaste: ${formatMoneda(v.monto_pagado_anterior)}` : ''
    const faltaParcial = v.estado === 'parcial' ? `\n│ FALTA: ${formatMoneda(v.nuevo_saldo)}` : ''
    const pagoAhora = v.estado === 'pagado' ? '' : `\n│ Pago ahora: ${formatMoneda(v.monto_pagado_ahora)}`
    const fechaCorta = formatFechaHoraCorta(v.fecha)
    return `┌─ ${v.ticket.toUpperCase()} - ${fechaCorta} ┐
│ Estado: ${v.estado === 'pagado' ? '✅ PAGADO' : '⏳ PARCIAL'}
│
│ PRODUCTOS:
│${items}${descuento}${totalSinDesc}${yaPagado}${pagoAhora}
│ TOTAL: ${formatMoneda(v.total)}
${faltaParcial}
└─────────────────────────┘`
  }).join('\n\n')

  const totalDescuentos = comprobante.ventas.reduce((sum, v) => sum + v.descuento, 0)

  return `📄 RECIBO DE PAGO - ${negocio.nombre.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━
RUC: ${negocio.ruc}
${negocio.direccion}
📞 ${negocio.telefono}

📅 ${formatFecha(comprobante.fecha)}${comprobante.hora ? ` ${comprobante.hora}` : ''}
🎫 Recibo: ${comprobante.numero}

👤 CLIENTE
${comprobante.cliente_nombre}
${comprobante.cliente_documento ? `Documento: ${comprobante.cliente_documento}` : 'Sin documento'}

━━━━━━━━━━━━━━━━━━━━
💰 RESUMEN DE DEUDA
Total sin descuentos: ${formatMoneda(comprobante.total_ventas_sin_descuento)}
Total de ventas: ${formatMoneda(comprobante.deuda_total_original)}
${totalDescuentos > 0 ? `Descuentos totales: -${formatMoneda(totalDescuentos)}\n` : ''}Ya se había pagado: ${formatMoneda(comprobante.total_pagado_anterior)}
Deuda actual: ${formatMoneda(comprobante.deuda_actual)}

━━━━━━━━━━━━━━━���━━━━
💵 PAGO REALIZADO AHORA
Monto: ${formatMoneda(comprobante.monto_pagado)}

📊 NUEVA DEUDA
${formatMoneda(comprobante.nueva_deuda)}

${lineasVentas}

✦ GRACIAS POR SU PAGO ✦`
}

export function generarHtmlComprobanteVenta(comprobante: ComprobanteVenta): string {
  const negocio = { nombre: NOMBRE_NEGOCIO, ruc: RUC_NEGOCIO, direccion: DIRECCION_NEGOCIO, telefono: TELEFONO }

  return `
<div style="width: 420px; font-family: Arial, sans-serif; font-size: 13px; color: #1f2937; background: white; padding: 0;">
  <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
    <div style="font-size: 18px; font-weight: bold;">COMPROBANTE</div>
    <div style="font-size: 14px; font-weight: 600;">${negocio.nombre.toUpperCase()}</div>
    <div style="font-size: 11px; opacity: 0.9;">RUC: ${negocio.ruc}</div>
    <div style="font-size: 11px; opacity: 0.9;">${negocio.direccion}</div>
  </div>
  
  <div style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280;">
      <span>${formatFecha(comprobante.fecha)}${comprobante.hora ? ` ${comprobante.hora}` : ''}</span>
      <span style="font-weight: bold;">${comprobante.numero}</span>
    </div>
    <div style="margin-top: 8px;">
      <div style="font-weight: bold; font-size: 15px; color: #1f2937;">${comprobante.cliente_nombre}</div>
    </div>
  </div>
  
  <div style="padding: 16px; border-bottom: 1px dashed #e5e7eb;">
    <div style="font-weight: 600; font-size: 12px; color: #6b7280; margin-bottom: 12px;">📦 PRODUCTOS</div>
    <div style="background: #f9fafb; border-radius: 8px; padding: 12px;">
      ${comprobante.items.map(item => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px;">
          <span style="color: #4b5563;">${item.cantidad} x ${item.nombre}</span>
          <span style="font-weight: 500;">${formatMoneda(item.subtotal)}</span>
        </div>
      `).join('')}
    </div>
  </div>
  
  <div style="padding: 16px; border-bottom: 1px dashed #e5e7eb;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px; color: #6b7280;">
      <span>Subtotal</span>
      <span>${formatMoneda(comprobante.subtotal)}</span>
    </div>
    ${comprobante.descuento > 0 ? `
    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px; color: #16a34a;">
      <span>Descuento</span>
      <span>-${formatMoneda(comprobante.descuento)}</span>
    </div>
    ` : ''}
    ${comprobante.igv > 0 ? `
    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px; color: #6b7280;">
      <span>IGV (18%)</span>
      <span>${formatMoneda(comprobante.igv)}</span>
    </div>
    ` : ''}
    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; border-top: 1px solid #e5e7eb; padding-top: 8px;">
      <span>TOTAL</span>
      <span style="color: #2563eb;">${formatMoneda(comprobante.total)}</span>
    </div>
  </div>
  
  <div style="padding: 16px; background: #f3f4f6; font-size: 12px; color: #6b7280;">
    <div style="margin-bottom: 4px;">
      <span>Método de pago:</span>
      <span className="capitalize">${comprobante.metodo_pago}</span>
    </div>
    <div>
      <span>Vendedor:</span> ${comprobante.vendedor_nombre}
    </div>
  </div>
  
  <div style="text-align: center; padding: 16px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
    ✦ GRACIAS POR SU COMPRA ✦
  </div>
</div>`
}

export function generarHtmlComprobantePago(comprobante: ComprobantePago): string {
  const negocio = { nombre: NOMBRE_NEGOCIO, ruc: RUC_NEGOCIO, direccion: DIRECCION_NEGOCIO, telefono: TELEFONO }

  const totalDescuentos = comprobante.ventas.reduce((sum, v) => sum + v.descuento, 0)

  const lineasVentas = comprobante.ventas.map((v: VentaEnComprobante) => {
    const items = v.items.map(i => `
      <div style="display: flex; justify-content: space-between; padding: 2px 0; font-size: 11px;">
        <span style="color: #4b5563;">${i.nombre} x${i.cantidad}</span>
        <span style="font-weight: 500;">${formatMoneda(i.subtotal)}</span>
      </div>
    `).join('')

    const bgColor = v.estado === 'pagado' ? '#dcfce7' : '#fef3c7'
    const borderColor = v.estado === 'pagado' ? '#86efac' : '#fcd34d'
    const estadoColor = v.estado === 'pagado' ? '#166534' : '#92400e'
    const estadoBg = v.estado === 'pagado' ? '#bbf7d0' : '#fde68a'

    return `
    <div style="background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
        <div>
          <div style="font-weight: bold; color: #1f2937;">${v.ticket}</div>
          <div style="font-size: 10px; color: #6b7280;">${formatFecha(v.fecha)}</div>
        </div>
        <span style="font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; background: ${estadoBg}; color: ${estadoColor};">
          ${v.estado === 'pagado' ? 'PAGADO' : 'PARCIAL'}
        </span>
      </div>
      <div style="border-top: 1px dashed ${borderColor}; border-bottom: 1px dashed ${borderColor}; padding: 8px 0; margin: 8px 0;">
        <div style="font-size: 10px; font-weight: 600; color: #6b7280; margin-bottom: 6px;">PRODUCTOS:</div>
        ${items}
      </div>
      <div style="font-size: 11px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span style="color: #6b7280;">Total:</span>
          <span style="font-weight: 500;">${formatMoneda(v.total)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span style="color: #6b7280;">Ya geldigado:</span>
          <span style="color: #16a34a;">${formatMoneda(v.monto_pagado_anterior)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span style="color: #6b7280;">Pago ahora:</span>
          <span style="font-weight: 600;">${formatMoneda(v.monto_pagado_ahora)}</span>
        </div>
        ${v.estado === 'parcial' ? `
        <div style="display: flex; justify-content: space-between; border-top: 1px solid ${borderColor}; margin-top: 8px; padding-top: 8px;">
          <span style="color: #92400e; font-weight: 600;">Nueva deuda:</span>
          <span style="color: #92400e; font-weight: 600;">${formatMoneda(v.nuevo_saldo)}</span>
        </div>
        ` : ''}
      </div>
    </div>`
  }).join('')

  return `
<div style="width: 420px; font-family: Arial, sans-serif; font-size: 13px; color: #1f2937; background: white; padding: 0;">
  <div style="background: #16a34a; color: white; padding: 20px; text-align: center;">
    <div style="font-size: 18px; font-weight: bold;">RECIBO DE PAGO</div>
    <div style="font-size: 14px; font-weight: 600;">${negocio.nombre.toUpperCase()}</div>
    <div style="font-size: 11px; opacity: 0.9;">RUC: ${negocio.ruc}</div>
    <div style="font-size: 11px; opacity: 0.9;">${negocio.direccion}</div>
  </div>
  
  <div style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280;">
      <span>${formatFecha(comprobante.fecha)}${comprobante.hora ? ` ${comprobante.hora}` : ''}</span>
      <span style="font-weight: bold;">${comprobante.numero}</span>
    </div>
    <div style="margin-top: 8px;">
      <div style="font-weight: bold; font-size: 15px; color: #1f2937;">${comprobante.cliente_nombre}</div>
      ${comprobante.cliente_documento ? `<div style="font-size: 11px; color: #6b7280;">Doc: ${comprobante.cliente_documento}</div>` : ''}
    </div>
  </div>
  
  <div style="padding: 16px; border-bottom: 1px dashed #e5e7eb;">
    <div style="font-weight: 600; font-size: 12px; color: #6b7280; margin-bottom: 12px;">📊 RESUMEN DE DEUDA</div>
    <div style="background: #f9fafb; border-radius: 8px; padding: 12px; font-size: 12px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-weight: 600;">
        <span style="color: #1f2937;">Total sin descuentos:</span>
        <span style="font-weight: 600;">${formatMoneda(comprobante.total_ventas_sin_descuento)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span style="color: #6b7280;">Total de ventas:</span>
        <span>${formatMoneda(comprobante.deuda_total_original)}</span>
      </div>
      ${totalDescuentos > 0 ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span style="color: #6b7280;">Descuentos:</span>
        <span style="color: #16a34a;">-${formatMoneda(totalDescuentos)}</span>
      </div>
      ` : ''}
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span style="color: #6b7280;">Ya se había geldigado:</span>
        <span>${formatMoneda(comprobante.total_pagado_anterior)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-weight: 600; border-top: 1px solid #e5e7eb; margin-top: 8px; padding-top: 8px;">
        <span>Deuda actual:</span>
        <span style="color: #92400e;">${formatMoneda(comprobante.deuda_actual)}</span>
      </div>
    </div>
  </div>
  
  <div style="padding: 16px; background: #dbeafe; border-bottom: 1px dashed #93c5fd;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-weight: bold; color: #1e40af;">PAGO REALIZADO AHORA</span>
      <span style="font-weight: bold; font-size: 20px; color: #2563eb;">${formatMoneda(comprobante.monto_pagado)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; border-top: 1px solid #93c5fd; margin-top: 8px; padding-top: 8px;">
      <span style="color: #1e40af; font-weight: 600;">Nueva deuda</span>
      <span style="font-weight: bold; color: #1e40af;">${formatMoneda(comprobante.nueva_deuda)}</span>
    </div>
  </div>
  
  <div style="padding: 16px;">
    <div style="font-weight: 600; font-size: 12px; color: #6b7280; margin-bottom: 12px;">
      Detalle de Ventas (${comprobante.ventas_pagadas_count} pagadas, ${comprobante.ventas_parciales_count} parciales)
    </div>
    ${lineasVentas}
  </div>
  
  <div style="padding: 16px; background: #f3f4f6; font-size: 12px; color: #6b7280;">
    <div style="margin-bottom: 4px;">
      <span>Método de pago:</span>
      <span className="capitalize">${comprobante.metodo_pago}</span>
    </div>
    ${comprobante.observaciones ? `<div style="margin-bottom: 4px;"><span>Observaciones:</span> ${comprobante.observaciones}</div>` : ''}
    <div>
      <span>Atendido por:</span> ${comprobante.usuario_nombre}
    </div>
  </div>
  
  <div style="text-align: center; padding: 16px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
    ✦ GRACIAS POR SU PAGO ✦
  </div>
</div>`
}

export function descargarTexto(comprobante: Comprobante): void {
  const mensaje = comprobante.tipo === 'venta'
    ? generarMensajeComprobanteVenta(comprobante as ComprobanteVenta)
    : generarMensajeComprobantePago(comprobante as ComprobantePago)

  const blob = new Blob([mensaje], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `comprobante-${comprobante.numero}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function descargarImagen(comprobante: Comprobante): void {
  const html = comprobante.tipo === 'venta'
    ? generarHtmlComprobanteVenta(comprobante as ComprobanteVenta)
    : generarHtmlComprobantePago(comprobante as ComprobantePago)

  const container = document.createElement('div')
  container.id = 'comprobante-descarga-img'
  container.style.cssText = 'position: fixed; left: -9999px; top: 0;'
  container.innerHTML = html
  document.body.appendChild(container)

  html2canvas(container, { scale: 2, backgroundColor: '#ffffff' })
    .then((canvas) => {
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = url
      link.download = `comprobante-${comprobante.numero}.png`
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

export function descargarPdf(comprobante: Comprobante): void {
  try {
    const negocio = { nombre: NOMBRE_NEGOCIO, ruc: RUC_NEGOCIO, direccion: DIRECCION_NEGOCIO, telefono: TELEFONO }
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 10

    if (comprobante.tipo === 'venta') {
      const v = comprobante as ComprobanteVenta

      doc.setFillColor(37, 99, 235)
      doc.rect(0, y, pageWidth, 28, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(negocio.nombre.toUpperCase(), pageWidth / 2, y + 12, { align: 'center' })
      doc.setFontSize(9)
      doc.text(`RUC: ${negocio.ruc} | ${negocio.direccion} | 📞 ${negocio.telefono}`, pageWidth / 2, y + 20, { align: 'center' })

      y += 35
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(9)
      doc.text(`${utilFormatFecha(v.fecha)}${v.hora ? ` ${v.hora}` : ''}`, 10, y)
      doc.setFont('helvetica', 'bold')
      doc.text(`Comprobante: ${v.numero}`, pageWidth - 10, y, { align: 'right' })

      y += 12
      doc.setTextColor(0, 0, 0)
      doc.text(v.cliente_nombre, 10, y)

      y += 10
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text('PRODUCTOS', 10, y)

      y += 8
      for (const item of v.items) {
        doc.text(`${item.cantidad} x ${item.nombre}`, 10, y)
        doc.text(formatMoneda(item.subtotal), pageWidth - 10, y, { align: 'right' })
        y += 6
      }

      y += 4
      doc.setDrawColor(200, 200, 200)
      doc.line(10, y, pageWidth - 10, y)
      y += 8

      doc.text('Subtotal:', 10, y)
      doc.text(formatMoneda(v.subtotal), pageWidth - 10, y, { align: 'right' })

      if (v.descuento > 0) {
        y += 6
        doc.setTextColor(22, 163, 74)
        doc.text('Descuento:', 10, y)
        doc.text(`-${formatMoneda(v.descuento)}`, pageWidth - 10, y, { align: 'right' })
      }

      if (v.igv > 0) {
        y += 6
        doc.setTextColor(100, 100, 100)
        doc.text('IGV (18%):', 10, y)
        doc.text(formatMoneda(v.igv), pageWidth - 10, y, { align: 'right' })
      }

      y += 6
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(37, 99, 235)
      doc.text('TOTAL:', 10, y)
      doc.text(formatMoneda(v.total), pageWidth - 10, y, { align: 'right' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      y += 15
      doc.text(`Método de pago: ${v.metodo_pago}`, 10, y)
      doc.text(`Vendedor: ${v.vendedor_nombre}`, pageWidth - 10, y, { align: 'right' })

    } else {
      const p = comprobante as ComprobantePago

      doc.setFillColor(22, 163, 74)
      doc.rect(0, y, pageWidth, 28, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('RECIBO DE PAGO', pageWidth / 2, y + 12, { align: 'center' })
      doc.setFontSize(9)
      doc.text(`RUC: ${negocio.ruc} | ${negocio.direccion} | 📞 ${negocio.telefono}`, pageWidth / 2, y + 20, { align: 'center' })

      y += 35
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(9)
      doc.text(`${utilFormatFecha(p.fecha)}${p.hora ? ` ${p.hora}` : ''}`, 10, y)
      doc.setFont('helvetica', 'bold')
      doc.text(`Recibo: ${p.numero}`, pageWidth - 10, y, { align: 'right' })

      y += 12
      doc.setTextColor(0, 0, 0)
      doc.text(p.cliente_nombre, 10, y)
      if (p.cliente_documento) {
        y += 6
        doc.setTextColor(100, 100, 100)
        doc.setFont('helvetica', 'normal')
        doc.text(`Documento: ${p.cliente_documento}`, 10, y)
      }

      y += 15
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('RESUMEN DE DEUDA', 10, y)

      y += 10
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      
      const totalDescuentos = p.ventas.reduce((sum, v) => sum + v.descuento, 0)

      if (p.total_ventas_sin_descuento > 0) {
        doc.text('Total sin descuentos:', 10, y)
        doc.text(formatMoneda(p.total_ventas_sin_descuento), pageWidth - 10, y, { align: 'right' })
        y += 6
      }

      doc.text('Total de ventas:', 10, y)
      doc.text(formatMoneda(p.deuda_total_original), pageWidth - 10, y, { align: 'right' })

      if (totalDescuentos > 0) {
        y += 6
        doc.setTextColor(22, 163, 74)
        doc.text('Descuentos:', 10, y)
        doc.text(`-${formatMoneda(totalDescuentos)}`, pageWidth - 10, y, { align: 'right' })
      }

      y += 6
      doc.setTextColor(100, 100, 100)
      doc.text('Ya se había geldigado:', 10, y)
      doc.text(formatMoneda(p.total_pagado_anterior), pageWidth - 10, y, { align: 'right' })

      y += 8
      doc.setDrawColor(200, 200, 200)
      doc.line(10, y, pageWidth - 10, y)
      y += 8
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Deuda actual:', 10, y)
      doc.text(formatMoneda(p.deuda_actual), pageWidth - 10, y, { align: 'right' })

      y += 15
      doc.setFillColor(219, 234, 254)
      doc.rect(10, y, pageWidth - 20, 20, 'F')
      doc.setFontSize(11)
      doc.setTextColor(30, 64, 175)
      doc.text('PAGO REALIZADO AHORA', 15, y + 8)
      doc.setFontSize(14)
      doc.text(formatMoneda(p.monto_pagado), pageWidth - 15, y + 13, { align: 'right' })

      y += 25
      doc.setFontSize(9)
      doc.setTextColor(30, 64, 175)
      doc.text('Nueva deuda:', 10, y)
      doc.text(formatMoneda(p.nueva_deuda), pageWidth - 10, y, { align: 'right' })

      y += 15
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text(`Método de pago: ${p.metodo_pago}`, 10, y)
      doc.text(`Atendido por: ${p.usuario_nombre}`, pageWidth - 10, y, { align: 'right' })
    }

    doc.save(`comprobante-${comprobante.numero}.pdf`)
  } catch (error) {
    console.error('Error al generar PDF:', error)
    throw error
  }
}