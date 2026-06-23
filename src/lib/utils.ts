import { MONEDA } from '@/config/constantes'

export { generarLinkWhatsApp } from './whatsapp'

export function formatMoneda(monto: number | undefined | null): string {
  if (monto === undefined || monto === null || isNaN(monto)) {
    return `${MONEDA} 0.00`
  }
  return `${MONEDA} ${Number(monto).toFixed(2)}`
}

export function formatFecha(fecha: Date | string | undefined | null): string {
  if (!fecha) return '-'
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatHora(fecha: Date | string | undefined | null): string {
  if (!fecha) return '-'
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  return date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatFechaHoraCorta(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  return date.toLocaleDateString('es-PE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }) + ' ' + date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

let contadorTicket = 5

export function generarNumeroTicket(): string {
  contadorTicket++
  return `SAM-${String(contadorTicket).padStart(5, '0')}`
}

let contadorComprobanteVenta = 15
let contadorComprobantePago = 0

export function generarNumeroComprobanteVenta(): string {
  contadorComprobanteVenta++
  return `VTA-${String(contadorComprobanteVenta).padStart(5, '0')}`
}

export function generarNumeroComprobantePago(): string {
  contadorComprobantePago++
  return `CPP-${String(contadorComprobantePago).padStart(5, '0')}`
}

export function generarId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export type RangoFecha = 'hoy' | 'semana' | 'mes' | 'rango' | 'todos'

export function getFechaISO(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  const offset = date.getTimezoneOffset() * 60000
  const localDate = new Date(date.getTime() - offset)
  return localDate.toISOString().split('T')[0]
}

export function esHoy(fecha: Date | string): boolean {
  const hoy = new Date()
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
  
  const fechaLocal = getFechaISO(fechaObj)
  const hoyLocal = getFechaISO(hoy)
  
  return fechaLocal === hoyLocal
}

export function esEstaSemana(fecha: Date | string): boolean {
  const ahora = new Date()
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
  
  const inicioSemana = new Date(ahora)
  const dia = ahora.getDay()
  const diff = ahora.getDate() - dia + (dia === 0 ? -6 : 1)
  inicioSemana.setDate(diff)
  inicioSemana.setHours(0, 0, 0, 0)

  const finSemana = new Date(inicioSemana)
  finSemana.setDate(inicioSemana.getDate() + 6)
  finSemana.setHours(23, 59, 59, 999)

  const fechaLocal = new Date(fechaObj.getTime() - fechaObj.getTimezoneOffset() * 60000)
  const inicioLocal = new Date(inicioSemana.getTime() - inicioSemana.getTimezoneOffset() * 60000)
  const finLocal = new Date(finSemana.getTime() - finSemana.getTimezoneOffset() * 60000)

  return fechaLocal >= inicioLocal && fechaLocal <= finLocal
}

export function esEsteMes(fecha: Date | string): boolean {
  const ahora = new Date()
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
  
  const offset = fechaObj.getTimezoneOffset() * 60000
  const fechaLocal = new Date(fechaObj.getTime() - offset)
  
  return (
    fechaLocal.getMonth() === ahora.getMonth() &&
    fechaLocal.getFullYear() === ahora.getFullYear()
  )
}

export function estaEnRango(fecha: Date | string, inicio: string, fin: string): boolean {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
  const fechaISO = getFechaISO(fechaObj)
  return fechaISO >= inicio && fechaISO <= fin
}

export function formatearFechaCorta(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
  })
}
