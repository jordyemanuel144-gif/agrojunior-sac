import type { Comprobante, ComprobanteVenta, ComprobantePago, ItemComprobante, VentaEnComprobante } from '@/types/comprobante.types'
import type { Venta } from '@/types/venta.types'
import type { CuentaCorriente } from '@/types/cuenta-corriente.types'
import { generarId, generarNumeroComprobanteVenta, generarNumeroComprobantePago } from '@/lib/utils'
import { NOMBRE_NEGOCIO, RUC_NEGOCIO, DIRECCION_NEGOCIO, TELEFONO } from '@/config/constantes'

let comprobantes: Comprobante[] = []

function mapItemsFromVenta(items: Venta['items']): ItemComprobante[] {
  return items.map(item => ({
    nombre: item.producto.nombre,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    subtotal: item.subtotal,
  }))
}

export const comprobantesService = {
  crearVenta: (venta: Venta): ComprobanteVenta => {
    const comprobante: ComprobanteVenta = {
      id: generarId(),
      numero: generarNumeroComprobanteVenta(),
      tipo: 'venta',
      fecha: new Date(),
      estado: 'activo',
      
      negocio_nombre: NOMBRE_NEGOCIO,
      negocio_ruc: RUC_NEGOCIO,
      negocio_direccion: DIRECCION_NEGOCIO,
      negocio_telefono: TELEFONO,
      
      cliente_id: venta.cliente_id,
      cliente_nombre: venta.items[0]?.producto?.nombre || 'Cliente Mostrador',
      cliente_documento: undefined,
      
      items: mapItemsFromVenta(venta.items),
      subtotal: venta.subtotal,
      descuento: venta.descuento,
      igv: venta.igv,
      total: venta.total,
      metodo_pago: venta.metodo_pago,
      efectivo: venta.metodo_pago === 'efectivo' ? venta.total : undefined,
      vuelto: venta.metodo_pago === 'efectivo' ? 0 : undefined,
      vendedor_nombre: venta.vendedor_nombre,
    }
    
    comprobantes.push(comprobante)
    return comprobante
  },

  crearPago: (
    cuenta: CuentaCorriente,
    ventas: Venta[],
    montoPagado: number,
    metodoPago: string,
    observaciones: string | undefined,
    usuarioNombre: string
  ): ComprobantePago => {
    const totalOriginal = ventas.reduce((sum, v) => sum + v.total, 0)
    const totalPagadoAnterior = ventas.reduce((sum, v) => sum + v.monto_pagado, 0)
    
    let montoRestante = montoPagado
    
    const ventasEnComprobante: VentaEnComprobante[] = ventas
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
      .map(venta => {
        const saldo = venta.total - venta.monto_pagado
        const montoAplicar = Math.min(montoRestante, saldo)
        
        const item: VentaEnComprobante = {
          ticket: venta.ticket_numero,
          fecha: venta.fecha,
          items: mapItemsFromVenta(venta.items),
          subtotal: venta.subtotal,
          descuento: venta.descuento,
          igv: venta.igv,
          total: venta.total,
          monto_pagado_anterior: venta.monto_pagado,
          monto_pagado_ahora: montoAplicar,
          nuevo_saldo: Math.max(0, venta.total - venta.monto_pagado - montoAplicar),
          estado: venta.monto_pagado + montoAplicar >= venta.total ? 'pagado' : 'parcial',
        }
        
        montoRestante -= montoAplicar
        return item
      })
    
    const ventasPagadas = ventasEnComprobante.filter(v => v.estado === 'pagado').length
    const ventasParciales = ventasEnComprobante.filter(v => v.estado === 'parcial').length
    
    const comprobante: ComprobantePago = {
      id: generarId(),
      numero: generarNumeroComprobantePago(),
      tipo: 'pago_cobranza',
      fecha: new Date(),
      estado: 'activo',
      
      negocio_nombre: NOMBRE_NEGOCIO,
      negocio_ruc: RUC_NEGOCIO,
      negocio_direccion: DIRECCION_NEGOCIO,
      negocio_telefono: TELEFONO,
      
      cliente_id: cuenta.cliente_id,
      cliente_nombre: cuenta.cliente_nombre,
      cliente_documento: cuenta.cliente_dni_ruc,
      
      deuda_total_original: totalOriginal,
      total_pagado_anterior: totalPagadoAnterior,
      deuda_actual: totalOriginal - totalPagadoAnterior,
      monto_pagado: montoPagado,
      nueva_deuda: totalOriginal - totalPagadoAnterior - montoPagado,
      metodo_pago: metodoPago,
      observaciones,
      ventas: ventasEnComprobante,
      ventas_pagadas_count: ventasPagadas,
      ventas_parciales_count: ventasParciales,
      usuario_nombre: usuarioNombre,
      total: montoPagado,
    }
    
    comprobantes.push(comprobante)
    return comprobante
  },

  obtenerTodos: (): Comprobante[] => {
    return [...comprobantes].sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
  },

  obtenerPorId: (id: string): Comprobante | null => {
    return comprobantes.find(c => c.id === id) ?? null
  },

  obtenerPorCliente: (clienteId: string): Comprobante[] => {
    return comprobantes.filter(c => c.cliente_id === clienteId)
  },

  obtenerPorTipo: (tipo: 'venta' | 'pago_cobranza'): Comprobante[] => {
    return comprobantes.filter(c => c.tipo === tipo)
  },

  buscar: (termino: string): Comprobante[] => {
    const busq = termino.toLowerCase()
    return comprobantes.filter(c => 
      c.numero.toLowerCase().includes(busq) ||
      c.cliente_nombre.toLowerCase().includes(busq) ||
      (c.tipo === 'venta' && (c as ComprobanteVenta).items.some(i => i.nombre.toLowerCase().includes(busq)))
    )
  },
}