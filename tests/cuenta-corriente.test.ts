import { describe, it, expect, beforeEach } from 'vitest'
import { cuentaCorrienteService } from '@/services/cuenta-corriente.service'

describe('cuentaCorrienteService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('debería obtener resumen de cuentas por cobrar', async () => {
    const resumen = await cuentaCorrienteService.obtenerResumen()
    expect(resumen).toHaveProperty('total_deuda')
    expect(resumen).toHaveProperty('total_pendiente')
    expect(resumen).toHaveProperty('cantidad_clientes_con_deuda')
  })

  it('debería obtener todas las cuentas corrientes', async () => {
    const cuentas = await cuentaCorrienteService.obtenerTodas()
    expect(Array.isArray(cuentas)).toBe(true)
  })

  it('debería obtener cuenta por cliente', async () => {
    const cuentas = await cuentaCorrienteService.obtenerTodas()
    if (cuentas.length > 0) {
      const cuenta = await cuentaCorrienteService.obtenerPorCliente(cuentas[0].cliente_id)
      expect(cuenta).not.toBeNull()
      expect(cuenta?.cliente_id).toBe(cuentas[0].cliente_id)
    }
  })

  it('debería retornar null para cliente inexistente', async () => {
    const cuenta = await cuentaCorrienteService.obtenerPorCliente('no-existe')
    expect(cuenta).toBeNull()
  })

  it('debería obtener ventas pendientes por cliente', async () => {
    const cuentas = await cuentaCorrienteService.obtenerTodas()
    if (cuentas.length > 0) {
      const ventas = await cuentaCorrienteService.obtenerVentasPendientes(cuentas[0].cliente_id)
      expect(Array.isArray(ventas))
    }
  })

  it('debería obtener movimientos por cliente', async () => {
    const cuentas = await cuentaCorrienteService.obtenerTodas()
    if (cuentas.length > 0) {
      const movimientos = await cuentaCorrienteService.obtenerMovimientos(cuentas[0].cliente_id)
      expect(Array.isArray(movimientos))
    }
  })

  it('debería registrar pago correctamente', async () => {
    const cuentas = await cuentaCorrienteService.obtenerTodas()
    if (cuentas.length > 0) {
      const ventas = await cuentaCorrienteService.obtenerVentasPendientes(cuentas[0].cliente_id)
      if (ventas.length > 0) {
        const pagos = await cuentaCorrienteService.registrarPago(cuentas[0].cliente_id, {
          ventasSeleccionadas: [ventas[0].id],
          monto: 50,
          metodo_pago: 'efectivo',
          observaciones: 'Pago test',
          usuario_id: 'usr_001',
        })
        expect(pagos.length).toBeGreaterThan(0)
        expect(pagos[0].monto).toBe(50)
      }
    }
  })
})