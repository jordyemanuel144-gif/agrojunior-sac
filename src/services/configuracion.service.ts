// Servicio de configuración del sistema
// Usa localStorage para persistencia (luego Supabase)
import type { 
  ConfiguracionCompleta, 
  ConfigNegocio, 
  ConfigImpuestos, 
  ConfigDescuentos, 
  ConfigSistema 
} from '@/types/configuracion.types'
import { NOMBRE_NEGOCIO, IGV_PORCENTAJE, STOCK_MINIMO_ALERTA, TERMINAL_POS, CAJA_PRINCIPAL, RUC_NEGOCIO, DIRECCION_NEGOCIO, TELEFONO, WHATSAPP, HORARIO, DESCUENTO_MAYORISTA, DESCUENTO_ESPECIAL } from '@/config/constantes'

const STORAGE_KEY = 'samjose_configuracion'

const configDefault: ConfiguracionCompleta = {
  negocio: {
    nombre: NOMBRE_NEGOCIO,
    ruc: RUC_NEGOCIO,
    direccion: DIRECCION_NEGOCIO,
    telefono: TELEFONO,
    whatsapp: WHATSAPP,
    horario: { ...HORARIO },
  },
  impuestos: {
    igv_activo: false,
    igv_porcentaje: IGV_PORCENTAJE,
  },
  descuentos: {
    mayorista: DESCUENTO_MAYORISTA,
    especial: DESCUENTO_ESPECIAL,
  },
  sistema: {
    stock_minimo_alerta: STOCK_MINIMO_ALERTA,
    terminal: TERMINAL_POS,
    caja_principal: CAJA_PRINCIPAL,
  },
}

function getStoredConfig(): ConfiguracionCompleta {
  if (typeof window === 'undefined') return configDefault
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return configDefault
  
  try {
    return { ...configDefault, ...JSON.parse(stored) }
  } catch {
    return configDefault
  }
}

function saveConfig(config: ConfiguracionCompleta): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export const configuracionService = {
  obtener: (): ConfiguracionCompleta => {
    return getStoredConfig()
  },

  actualizarNegocio: (datos: Partial<ConfigNegocio>): ConfiguracionCompleta => {
    const config = getStoredConfig()
    config.negocio = { ...config.negocio, ...datos }
    saveConfig(config)
    return config
  },

  actualizarImpuestos: (datos: Partial<ConfigImpuestos>): ConfiguracionCompleta => {
    const config = getStoredConfig()
    config.impuestos = { ...config.impuestos, ...datos }
    saveConfig(config)
    return config
  },

  actualizarDescuentos: (datos: Partial<ConfigDescuentos>): ConfiguracionCompleta => {
    const config = getStoredConfig()
    config.descuentos = { ...config.descuentos, ...datos }
    saveConfig(config)
    return config
  },

  actualizarSistema: (datos: Partial<ConfigSistema>): ConfiguracionCompleta => {
    const config = getStoredConfig()
    config.sistema = { ...config.sistema, ...datos }
    saveConfig(config)
    return config
  },

  // Helpers rápidos
  getIGV: (): { activo: boolean; porcentaje: number } => {
    const config = getStoredConfig()
    return { activo: config.impuestos.igv_activo, porcentaje: config.impuestos.igv_porcentaje }
  },

  getDescuentos: (): { mayorista: number; especial: number } => {
    const config = getStoredConfig()
    return config.descuentos
  },

  getNegocio: (): ConfigNegocio => {
    return getStoredConfig().negocio
  },

  getStockMinimo: (): number => {
    return getStoredConfig().sistema.stock_minimo_alerta
  },

  resetear: (): ConfiguracionCompleta => {
    localStorage.removeItem(STORAGE_KEY)
    return configDefault
  },
}
