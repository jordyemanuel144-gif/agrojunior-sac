export interface ConfigNegocio {
  nombre: string
  ruc: string
  direccion: string
  telefono: string
  whatsapp: string
  email?: string
  horario: {
    laboral: string
    domingo: string
  }
}

export interface ConfigImpuestos {
  igv_activo: boolean
  igv_porcentaje: number
}

export interface ConfigDescuentos {
  mayorista: number
  especial: number
}

export interface ConfigSistema {
  stock_minimo_alerta: number
  terminal: string
  caja_principal: string
}

export interface ConfiguracionCompleta {
  negocio: ConfigNegocio
  impuestos: ConfigImpuestos
  descuentos: ConfigDescuentos
  sistema: ConfigSistema
}

export type SeccionConfig = 'negocio' | 'impuestos' | 'descuentos' | 'sistema'
