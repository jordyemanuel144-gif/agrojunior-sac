// Hook global para obtener configuración del negocio
// Usa configuracionService (single source of truth)
import { useMemo } from 'react'
import { configuracionService } from '@/services/configuracion.service'
import type { ConfigNegocio } from '@/types/configuracion.types'

export function useConfigNegocio() {
  const negocio = useMemo(() => configuracionService.getNegocio(), [])

  return {
    nombre: negocio.nombre,
    ruc: negocio.ruc,
    direccion: negocio.direccion,
    telefono: negocio.telefono,
    whatsapp: negocio.whatsapp,
    email: negocio.email,
    horario: negocio.horario,
    datos: negocio as ConfigNegocio,
  }
}