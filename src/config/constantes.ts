export const NOMBRE_NEGOCIO = 'AGROJUNIOR SAC'
export const MONEDA = 'S/'
export const IGV_PORCENTAJE = 18
export const STOCK_MINIMO_ALERTA = 5
export const TERMINAL_POS = 'Terminal 01'
export const CAJA_PRINCIPAL = 'Caja Principal'
export const RUC_NEGOCIO = '20000000000'
export const DIRECCION_NEGOCIO = 'Parcela 316, Los Molles, Sección A — Majes, Arequipa'
export const TELEFONO = '+51 970 995 140'
export const WHATSAPP = '970995140'
export const FACEBOOK = 'Darly Sanchez Cutipa'
export const TIKTOK = '@darlysanchez85'
export const PROPIETARIO = 'Darly Junior Sanchez Cutipa'
export const HORARIO = {
  laboral: 'Lun - Sáb: 7am - 6pm',
  domingo: 'Dom: 8am - 12pm',
}

export const PRECIO_POR_TIPO_CLIENTE: Record<string, keyof import('@/types/producto.types').Producto> = {
  minorista: 'precio_minorista',
  mayorista: 'precio_mayorista',
  especial: 'precio_especial',
}

export const DESCUENTO_MAYORISTA = 10
export const DESCUENTO_ESPECIAL = 5

export const YAPE_DEFAULT = '970995140'
export const BANCO_NOMBRE_DEFAULT = 'Banco de Crédito'
export const BANCO_TITULAR_DEFAULT = 'Darly Sanchez Cutipa'
export const BANCO_CUENTA_DEFAULT = '215-55555555'
