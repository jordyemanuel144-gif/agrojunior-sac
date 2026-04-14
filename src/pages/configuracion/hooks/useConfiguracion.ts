import { useState, useCallback } from 'react'
import { configuracionService } from '@/services/configuracion.service'
import type { ConfiguracionCompleta, ConfigNegocio, ConfigImpuestos, ConfigDescuentos, ConfigSistema } from '@/types/configuracion.types'

export function useConfiguracion() {
  const [config, setConfig] = useState<ConfiguracionCompleta>(configuracionService.obtener())
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const mostrarMensaje = useCallback((msg: string) => {
    setMensaje(msg)
    setTimeout(() => setMensaje(''), 3000)
  }, [])

  const guardarNegocio = useCallback((datos: Partial<ConfigNegocio>) => {
    setGuardando(true)
    const nueva = configuracionService.actualizarNegocio(datos)
    setConfig(nueva)
    setGuardando(false)
    mostrarMensaje('Información del negocio guardada')
  }, [mostrarMensaje])

  const guardarImpuestos = useCallback((datos: Partial<ConfigImpuestos>) => {
    setGuardando(true)
    const nueva = configuracionService.actualizarImpuestos(datos)
    setConfig(nueva)
    setGuardando(false)
    mostrarMensaje('Configuración de impuestos guardada')
  }, [mostrarMensaje])

  const guardarDescuentos = useCallback((datos: Partial<ConfigDescuentos>) => {
    setGuardando(true)
    const nueva = configuracionService.actualizarDescuentos(datos)
    setConfig(nueva)
    setGuardando(false)
    mostrarMensaje('Descuentos guardados')
  }, [mostrarMensaje])

  const guardarSistema = useCallback((datos: Partial<ConfigSistema>) => {
    setGuardando(true)
    const nueva = configuracionService.actualizarSistema(datos)
    setConfig(nueva)
    setGuardando(false)
    mostrarMensaje('Configuración del sistema guardada')
  }, [mostrarMensaje])

  const resetear = useCallback(() => {
    if (confirm('¿Restablecer toda la configuración a valores por defecto?')) {
      const nueva = configuracionService.resetear()
      setConfig(nueva)
      mostrarMensaje('Configuración restablecida')
    }
  }, [mostrarMensaje])

  return {
    config,
    guardando,
    mensaje,
    guardarNegocio,
    guardarImpuestos,
    guardarDescuentos,
    guardarSistema,
    resetear,
  }
}
