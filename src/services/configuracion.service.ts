/**
 * Service de configuración del sistema.
 * SUPABASE: Lee/escribe en tabla configuracion (clave-valor JSONB).
 * Mantiene cache local para lecturas síncronas frecuentes.
 */
import { supabase, handleError } from '@/lib/supabase'
import type {
  ConfiguracionCompleta,
  ConfigNegocio,
  ConfigImpuestos,
  ConfigDescuentos,
  ConfigSistema,
} from '@/types/configuracion.types'
import {
  NOMBRE_NEGOCIO, IGV_PORCENTAJE, STOCK_MINIMO_ALERTA,
  TERMINAL_POS, CAJA_PRINCIPAL, RUC_NEGOCIO, DIRECCION_NEGOCIO,
  TELEFONO, WHATSAPP, HORARIO, DESCUENTO_MAYORISTA, DESCUENTO_ESPECIAL,
  YAPE_DEFAULT, BANCO_NOMBRE_DEFAULT, BANCO_TITULAR_DEFAULT, BANCO_CUENTA_DEFAULT,
} from '@/config/constantes'

// Valores por defecto usados si Supabase no tiene datos aún
const configDefault: ConfiguracionCompleta = {
  negocio: {
    nombre: NOMBRE_NEGOCIO, ruc: RUC_NEGOCIO, direccion: DIRECCION_NEGOCIO,
    telefono: TELEFONO, whatsapp: WHATSAPP, horario: { ...HORARIO },
    yape: YAPE_DEFAULT, banco_nombre: BANCO_NOMBRE_DEFAULT,
    banco_titular: BANCO_TITULAR_DEFAULT, banco_cuenta: BANCO_CUENTA_DEFAULT,
  },
  impuestos: { igv_activo: false, igv_porcentaje: IGV_PORCENTAJE },
  descuentos: { mayorista: DESCUENTO_MAYORISTA, especial: DESCUENTO_ESPECIAL },
  sistema: { stock_minimo_alerta: STOCK_MINIMO_ALERTA, terminal: TERMINAL_POS, caja_principal: CAJA_PRINCIPAL },
}

// Cache en memoria para lecturas síncronas
let cache: ConfiguracionCompleta = { ...configDefault }
let cacheLoaded = false

async function cargarDesdeSupabase(): Promise<ConfiguracionCompleta> {
  const { data, error } = await supabase
    .from('configuracion')
    .select('clave, valor')

  if (error || !data || data.length === 0) return { ...configDefault }

  const config = { ...configDefault }
  for (const row of data) {
    const valor = row.valor as Record<string, unknown>
    switch (row.clave) {
      case 'negocio':
        config.negocio = { ...config.negocio, ...valor } as ConfigNegocio
        break
      case 'impuestos':
        config.impuestos = { ...config.impuestos, ...valor } as ConfigImpuestos
        break
      case 'descuentos':
        config.descuentos = { ...config.descuentos, ...valor } as ConfigDescuentos
        break
      case 'sistema':
        config.sistema = { ...config.sistema, ...valor } as ConfigSistema
        break
    }
  }
  return config
}

async function guardarSeccion(clave: string, valor: Record<string, unknown>): Promise<void> {
  const { error } = await supabase
    .from('configuracion')
    .upsert({ clave, valor }, { onConflict: 'clave' })

  handleError(error, `Error al guardar configuración: ${clave}`)
}

// Inicializar cache al importar (sin await para no bloquear)
cargarDesdeSupabase().then(c => { 
  cache = c
  cacheLoaded = true 
})

export const configuracionService = {
  obtener: (): ConfiguracionCompleta => {
    return cache
  },

  obtenerAsync: async (): Promise<ConfiguracionCompleta> => {
    cache = await cargarDesdeSupabase()
    cacheLoaded = true
    return cache
  },

  actualizarNegocio: async (datos: Partial<ConfigNegocio>): Promise<ConfiguracionCompleta> => {
    cache.negocio = { ...cache.negocio, ...datos }
    await guardarSeccion('negocio', cache.negocio as unknown as Record<string, unknown>)
    return cache
  },

  actualizarImpuestos: async (datos: Partial<ConfigImpuestos>): Promise<ConfiguracionCompleta> => {
    cache.impuestos = { ...cache.impuestos, ...datos }
    await guardarSeccion('impuestos', cache.impuestos as unknown as Record<string, unknown>)
    return cache
  },

  actualizarDescuentos: async (datos: Partial<ConfigDescuentos>): Promise<ConfiguracionCompleta> => {
    cache.descuentos = { ...cache.descuentos, ...datos }
    await guardarSeccion('descuentos', cache.descuentos as unknown as Record<string, unknown>)
    return cache
  },

  actualizarSistema: async (datos: Partial<ConfigSistema>): Promise<ConfiguracionCompleta> => {
    cache.sistema = { ...cache.sistema, ...datos }
    await guardarSeccion('sistema', cache.sistema as unknown as Record<string, unknown>)
    return cache
  },

  getIGV: (): { activo: boolean; porcentaje: number } => {
    return { activo: cache.impuestos.igv_activo, porcentaje: cache.impuestos.igv_porcentaje }
  },

  getDescuentos: (): { mayorista: number; especial: number } => {
    return cache.descuentos
  },

  getNegocio: (): ConfigNegocio => {
    return cache.negocio
  },

  getStockMinimo: (): number => {
    return cache.sistema.stock_minimo_alerta
  },

  resetear: async (): Promise<ConfiguracionCompleta> => {
    cache = { ...configDefault }
    const secciones = ['negocio', 'impuestos', 'descuentos', 'sistema'] as const
    for (const clave of secciones) {
      await guardarSeccion(clave, cache[clave] as unknown as Record<string, unknown>)
    }
    return cache
  },
}
