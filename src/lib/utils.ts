import { MONEDA } from '@/config/constantes'

export function formatMoneda(monto: number): string {
  return `${MONEDA} ${monto.toFixed(2)}`
}

export function formatFecha(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatHora(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  return date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function generarNumeroTicket(): string {
  return `SAM-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`
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
