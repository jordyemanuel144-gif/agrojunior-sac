import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useConfiguracion } from '@/pages/configuracion/hooks/useConfiguracion'
import { configuracionService } from '@/services/configuracion.service'

vi.mock('@/services/configuracion.service', () => ({
  configuracionService: {
    obtener: vi.fn().mockReturnValue({
      negocio: { nombre: 'Test', ruc: '123', direccion: 'test' },
      impuestos: { igv_activo: false, igv_porcentaje: 18 },
      descuentos: { mayorista: 10, especial: 5 },
      sistema: { stock_minimo_alerta: 10 },
    }),
    actualizarNegocio: vi.fn().mockImplementation((datos) => ({
      negocio: { ...datos },
      impuestos: { igv_activo: false, igv_porcentaje: 18 },
      descuentos: { mayorista: 10, especial: 5 },
      sistema: { stock_minimo_alerta: 10 },
    })),
    actualizarImpuestos: vi.fn().mockImplementation((datos) => ({
      negocio: { nombre: 'Test' },
      impuestos: { ...datos },
      descuentos: { mayorista: 10, especial: 5 },
      sistema: { stock_minimo_alerta: 10 },
    })),
    actualizarDescuentos: vi.fn().mockImplementation((datos) => ({
      negocio: { nombre: 'Test' },
      impuestos: { igv_activo: false },
      descuentos: { ...datos },
      sistema: { stock_minimo_alerta: 10 },
    })),
    actualizarSistema: vi.fn().mockImplementation((datos) => ({
      negocio: { nombre: 'Test' },
      impuestos: { igv_activo: false },
      descuentos: { mayorista: 10 },
      sistema: { ...datos },
    })),
    resetear: vi.fn().mockReturnValue({
      negocio: { nombre: 'Default' },
      impuestos: { igv_activo: false },
      descuentos: { mayorista: 10 },
      sistema: { stock_minimo_alerta: 10 },
    }),
  },
}))

describe('useConfiguracion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    configuracionService.resetear()
  })

  it('debería cargar configuración inicial', () => {
    const { result } = renderHook(() => useConfiguracion())
    
    expect(result.current.config.negocio.nombre).toBeDefined()
    expect(result.current.guardando).toBe(false)
    expect(result.current.mensaje).toBe('')
  })

  it('debería guardar negocio', () => {
    const { result } = renderHook(() => useConfiguracion())
    
    act(() => {
      result.current.guardarNegocio({ nombre: 'Nuevo Nombre' })
    })

    expect(configuracionService.actualizarNegocio).toHaveBeenCalledWith({ nombre: 'Nuevo Nombre' })
  })

  it('debería guardar impuestos', () => {
    const { result } = renderHook(() => useConfiguracion())
    
    act(() => {
      result.current.guardarImpuestos({ igv_activo: true, igv_porcentaje: 18 })
    })

    expect(configuracionService.actualizarImpuestos).toHaveBeenCalledWith({ igv_activo: true, igv_porcentaje: 18 })
  })

  it('debería guardar descuentos', () => {
    const { result } = renderHook(() => useConfiguracion())
    
    act(() => {
      result.current.guardarDescuentos({ mayorista: 15, especial: 10 })
    })

    expect(configuracionService.actualizarDescuentos).toHaveBeenCalledWith({ mayorista: 15, especial: 10 })
  })

  it('debería guardar sistema', () => {
    const { result } = renderHook(() => useConfiguracion())
    
    act(() => {
      result.current.guardarSistema({ stock_minimo_alerta: 20 })
    })

    expect(configuracionService.actualizarSistema).toHaveBeenCalledWith({ stock_minimo_alerta: 20 })
  })

  it('debería resetear configuración', () => {
    const { result } = renderHook(() => useConfiguracion())
    
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    
    act(() => {
      result.current.resetear()
    })

    expect(configuracionService.resetear).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})