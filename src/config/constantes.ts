export const NOMBRE_NEGOCIO = 'Sam José Avícola'
export const MONEDA = 'S/'
export const IGV_PORCENTAJE = 18
export const STOCK_MINIMO_ALERTA = 5
export const TERMINAL_POS = 'Terminal 01'
export const CAJA_PRINCIPAL = 'Caja Principal'
export const RUC_NEGOCIO = '20000000000'
export const DIRECCION_NEGOCIO = 'Av. Principal 123, Arequipa'
export const TELEFONO = '+51 916 794 870'
export const WHATSAPP = '916794870'
export const HORARIO = {
  laboral: 'Lun - Sáb: 7am - 8pm',
  domingo: 'Dom: 8am - 2pm',
}

export const PRECIO_POR_TIPO_CLIENTE: Record<string, keyof import('@/types/producto.types').Producto> = {
  minorista: 'precio_minorista',
  mayorista: 'precio_mayorista',
  especial: 'precio_especial',
}

export const DESCUENTO_MAYORISTA = 10
export const DESCUENTO_ESPECIAL = 5
