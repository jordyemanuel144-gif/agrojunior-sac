// Servicio de cuenta corriente - Gestion de cuentas por cobrar
import { ventasService } from './ventas.service'
import { CLIENTES_MOCK } from '@/datos-mock/clientes.mock'
import { USUARIOS_MOCK } from '@/datos-mock/usuarios.mock'
import type { CuentaCorriente, ResumenCuentasPorCobrar, MovimientoCuentaCorriente } from '@/types/cuenta-corriente.types'
import type { Venta } from '@/types/venta.types'
import type { Cliente } from '@/types/cliente.types'
import type { VentaPago, NuevoVentaPago } from '@/types/venta-pago.types'
import { generarId } from '@/lib/utils'

let pagosRegistrados: VentaPago[] = []

function getCliente(clienteId: string): Cliente | undefined {
  return CLIENTES_MOCK.find(c => c.id === clienteId)
}

function getUsuario(usuarioId: string): string {
  const usuario = USUARIOS_MOCK.find(u => u.id === usuarioId)
  return usuario?.name ?? 'Usuario'
}

function calcularSaldosCliente(ventas: Venta[]) {
  const totalDeuda = ventas.reduce((sum, v) => sum + v.total, 0)
  const totalPagado = ventas.reduce((sum, v) => sum + v.monto_pagado, 0)
  return { totalDeuda, totalPagado, saldoPendiente: totalDeuda - totalPagado }
}

export const cuentaCorrienteService = {
  obtenerResumen: async (): Promise<ResumenCuentasPorCobrar> => {
    const allVentas = await ventasService.obtenerTodos()
    const clientesConDeuda = new Map<string, { ventas: Venta[]; cliente: Cliente }>()

    for (const venta of allVentas) {
      if (venta.estado === 'completada' && venta.estado_pago !== 'pagado') {
        const cliente = getCliente(venta.cliente_id)
        if (cliente) {
          if (!clientesConDeuda.has(venta.cliente_id)) {
            clientesConDeuda.set(venta.cliente_id, { ventas: [], cliente })
          }
          clientesConDeuda.get(venta.cliente_id)!.ventas.push(venta)
        }
      }
    }

    let totalDeuda = 0
    let totalPendiente = 0
    const clientesMayoresDeudores: Array<{ cliente_id: string; cliente_nombre: string; saldo: number }> = []

    for (const [, data] of clientesConDeuda) {
      const suma = data.ventas.reduce((sum, v) => sum + v.total, 0)
      const pagado = data.ventas.reduce((sum, v) => sum + v.monto_pagado, 0)
      const saldo = suma - pagado
      totalDeuda += suma
      totalPendiente += saldo
      clientesMayoresDeudores.push({ cliente_id: data.cliente.id, cliente_nombre: data.cliente.nombre, saldo })
    }

    clientesMayoresDeudores.sort((a, b) => b.saldo - a.saldo)

    return {
      total_deuda: totalDeuda,
      total_pendiente: totalPendiente,
      cantidad_clientes_con_deuda: clientesConDeuda.size,
      cantidad_ventas_pendientes: Array.from(clientesConDeuda.values()).reduce((sum, d) => sum + d.ventas.length, 0),
      clientes_mayores_deudores: clientesMayoresDeudores.slice(0, 5),
    }
  },

  obtenerTodas: async (): Promise<CuentaCorriente[]> => {
    const allVentas = await ventasService.obtenerTodos()
    const cuentas = new Map<string, CuentaCorriente>()

    for (const cliente of CLIENTES_MOCK) {
      if (cliente.id === 'publico') continue

      const ventasCliente = allVentas.filter(v => v.cliente_id === cliente.id && v.estado === 'completada' && v.estado_pago !== 'pagado')
      if (ventasCliente.length === 0) continue

      const { totalDeuda, totalPagado, saldoPendiente } = calcularSaldosCliente(ventasCliente)
      const ventasOrdenadas = [...ventasCliente].sort((a, b) => b.fecha.getTime() - a.fecha.getTime())

      cuentas.set(cliente.id, {
        cliente_id: cliente.id,
        cliente_nombre: cliente.nombre,
        cliente_dni_ruc: cliente.dni_ruc,
        cliente_telefono: cliente.telefono,
        cliente_tipo: cliente.tipo,
        total_deuda: totalDeuda,
        total_pagado: totalPagado,
        saldo_pendiente: saldoPendiente,
        cantidad_ventas_pendientes: ventasCliente.length,
        ultima_venta_fecha: ventasOrdenadas[0]?.fecha,
        ultima_venta_monto: ventasOrdenadas[0]?.total,
        estado: 'activa',
      })
    }

    return Array.from(cuentas.values()).sort((a, b) => b.saldo_pendiente - a.saldo_pendiente)
  },

  obtenerPorCliente: async (clienteId: string): Promise<CuentaCorriente | null> => {
    const cliente = getCliente(clienteId)
    if (!cliente) return null

    const allVentas = await ventasService.obtenerTodos()
    const ventas = allVentas.filter(v => v.cliente_id === clienteId && v.estado === 'completada' && v.estado_pago !== 'pagado')
    const { totalDeuda, totalPagado, saldoPendiente } = calcularSaldosCliente(ventas)

    return {
      cliente_id: cliente.id,
      cliente_nombre: cliente.nombre,
      cliente_dni_ruc: cliente.dni_ruc,
      cliente_telefono: cliente.telefono,
      cliente_tipo: cliente.tipo,
      total_deuda: totalDeuda,
      total_pagado: totalPagado,
      saldo_pendiente: saldoPendiente,
      cantidad_ventas_pendientes: ventas.length,
      ultima_venta_fecha: ventas[0]?.fecha,
      ultima_venta_monto: ventas[0]?.total,
      estado: 'activa',
    }
  },

  obtenerVentasPendientes: async (clienteId: string): Promise<Venta[]> => {
    const allVentas = await ventasService.obtenerTodos()
    return allVentas.filter(v => v.cliente_id === clienteId && v.estado === 'completada' && v.estado_pago !== 'pagado')
  },

  registrarPago: async (
    _clienteId: string,
    datos: { ventasSeleccionadas: string[]; monto: number; metodo_pago: NuevoVentaPago['metodo_pago']; observaciones?: string; usuario_id: string }
  ): Promise<VentaPago[]> => {
    const { ventasSeleccionadas, monto, metodo_pago, observaciones, usuario_id } = datos
    const pagos: VentaPago[] = []
    let montoRestante = monto

    const allVentas = await ventasService.obtenerTodos()
    const ventas = ventasSeleccionadas
      .map(id => allVentas.find(v => v.id === id))
      .filter((v): v is Venta => v !== undefined)
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())

    for (const venta of ventas) {
      if (montoRestante <= 0) break
      const saldoVenta = venta.total - venta.monto_pagado
      const montoAplicar = Math.min(montoRestante, saldoVenta)

      if (montoAplicar <= 0) continue

      const pago: VentaPago = {
        id: generarId(),
        venta_id: venta.id,
        monto: montoAplicar,
        metodo_pago,
        fecha: new Date(),
        observaciones,
        usuario_id,
        usuario_nombre: getUsuario(usuario_id),
      }

      const nuevoMontoPagado = venta.monto_pagado + montoAplicar
      await ventasService.actualizar(venta.id, {
        monto_pagado: nuevoMontoPagado,
        estado_pago: nuevoMontoPagado >= venta.total ? 'pagado' : 'parcial',
      })

      pagosRegistrados.push(pago)
      pagos.push(pago)
      montoRestante -= montoAplicar
    }

    return pagos
  },

  obtenerMovimientos: async (clienteId: string): Promise<MovimientoCuentaCorriente[]> => {
    const allVentas = await ventasService.obtenerTodos()
    const movimientos: MovimientoCuentaCorriente[] = []
    let saldoAcumulado = 0

    const ventas = allVentas.filter(v => v.cliente_id === clienteId && v.estado === 'completada' && v.estado_pago !== 'pagado')
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())

    for (const venta of ventas) {
      saldoAcumulado += venta.total
      movimientos.push({
        id: generarId(),
        tipo: 'venta',
        documento_id: venta.id,
        documento_tipo: 'venta',
        documento_numero: venta.ticket_numero,
        monto: venta.total,
        saldo_antes: saldoAcumulado - venta.total,
        saldo_despues: saldoAcumulado,
        fecha: venta.fecha,
      })
    }

    return movimientos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
  },
}