import type { Categoria, Producto } from '@/types/producto.types'

export const CATEGORIAS: Categoria[] = [
  { id: 'all', nombre: 'Todo' },
  { id: 'pollo', nombre: 'Pollo' },
  { id: 'huevos', nombre: 'Huevos' },
  { id: 'cerdo', nombre: 'Cerdo' },
  { id: 'ofertas', nombre: 'Ofertas' },
]

export const PRODUCTOS_MOCK: Producto[] = [
  {
    id: '1', codigo: 'P001', nombre: 'Pollo Entero Grado A',
    categoria_id: 'pollo', tipo_medida: 'kg',
    precio_costo: 8.0, precio_minorista: 8.50, precio_mayorista: 7.80, precio_especial: 7.50,
    stock_actual: 85.4, stock_minimo: 10, activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=300&q=80',
    tag: 'oferta',
    destacado: true,
  },
  {
    id: '2', codigo: 'H001', nombre: 'Cartón Huevos x30',
    categoria_id: 'huevos', tipo_medida: 'unidad',
    precio_costo: 14.0, precio_minorista: 18.00, precio_mayorista: 16.50, precio_especial: 15.50,
    stock_actual: 45, stock_minimo: 5, activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&q=80',
    tag: null,
    destacado: true,
  },
  {
    id: '3', codigo: 'P002', nombre: 'Pechuga Especial',
    categoria_id: 'pollo', tipo_medida: 'kg',
    precio_costo: 10.0, precio_minorista: 12.00, precio_mayorista: 11.00, precio_especial: 10.50,
    stock_actual: 32.0, stock_minimo: 5, activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&q=80',
    tag: 'nuevo',
    destacado: true,
  },
  {
    id: '4', codigo: 'P003', nombre: 'Muslos de Pollo',
    categoria_id: 'pollo', tipo_medida: 'kg',
    precio_costo: 6.0, precio_minorista: 7.20, precio_mayorista: 6.50, precio_especial: 6.20,
    stock_actual: 28.5, stock_minimo: 5, activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=300&q=80',
    tag: null,
  },
  {
    id: '5', codigo: 'C001', nombre: 'Chuleta de Cerdo',
    categoria_id: 'cerdo', tipo_medida: 'kg',
    precio_costo: 11.0, precio_minorista: 14.50, precio_mayorista: 13.00, precio_especial: 12.50,
    stock_actual: 18.0, stock_minimo: 3, activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=300&q=80',
    tag: null,
  },
  {
    id: '6', codigo: 'P004', nombre: 'Alas de Pollo',
    categoria_id: 'pollo', tipo_medida: 'kg',
    precio_costo: 5.0, precio_minorista: 6.50, precio_mayorista: 6.00, precio_especial: 5.80,
    stock_actual: 0, stock_minimo: 5, activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=300&q=80',
    tag: null,
  },
  {
    id: '7', codigo: 'H002', nombre: 'Bandeja Huevos x12',
    categoria_id: 'huevos', tipo_medida: 'unidad',
    precio_costo: 7.0, precio_minorista: 9.00, precio_mayorista: 8.00, precio_especial: 7.50,
    stock_actual: 3, stock_minimo: 10, activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1491524062933-cb188fc9b932?w=300&q=80',
    tag: null,
  },
]
