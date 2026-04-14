import { describe, it, expect, beforeEach } from 'vitest'
import { configuracionService } from '@/services/configuracion.service'

describe('configuracionService', () => {
  beforeEach(() => {
    localStorage.clear()
    configuracionService.resetear()
  })

  it('debería obtener configuración por defecto', () => {
    const config = configuracionService.obtener()
    expect(config.negocio.nombre).toBeDefined()
    expect(config.descuentos.mayorista).toBeDefined()
  })

  it('debería obtener IGV', () => {
    const igv = configuracionService.getIGV()
    expect(igv.porcentaje).toBeDefined()
  })

  it('debería obtener descuentos', () => {
    const descuentos = configuracionService.getDescuentos()
    expect(descuentos.mayorista).toBeDefined()
  })

  it('debería obtener negocio', () => {
    const negocio = configuracionService.getNegocio()
    expect(negocio.nombre).toBeDefined()
  })

  it('debería obtener stock mínimo', () => {
    const stockMinimo = configuracionService.getStockMinimo()
    expect(typeof stockMinimo).toBe('number')
  })

  it('debería actualizar negocio', () => {
    const config = configuracionService.actualizarNegocio({ nombre: 'Nuevo Nombre' })
    expect(config.negocio.nombre).toBe('Nuevo Nombre')
  })

  it('debería actualizar impuestos', () => {
    const config = configuracionService.actualizarImpuestos({ igv_activo: true, igv_porcentaje: 18 })
    expect(config.impuestos.igv_activo).toBe(true)
    expect(config.impuestos.igv_porcentaje).toBe(18)
  })

  it('debería actualizar descuentos', () => {
    const config = configuracionService.actualizarDescuentos({ mayorista: 15, especial: 20 })
    expect(config.descuentos.mayorista).toBe(15)
    expect(config.descuentos.especial).toBe(20)
  })

  it('debería actualizar sistema', () => {
    const config = configuracionService.actualizarSistema({ stock_minimo_alerta: 20 })
    expect(config.sistema.stock_minimo_alerta).toBe(20)
  })

  it('debería resetear a valores por defecto', () => {
    configuracionService.actualizarNegocio({ nombre: 'Test' })
    const config = configuracionService.resetear()
    expect(config.negocio.nombre).toBeDefined()
  })
})