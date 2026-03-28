// Mock data para compras
import type { Compra } from '@/types/compra.types'

export const COMPRAS_MOCK: Compra[] = [
  {
    id: 'comp1',
    numero: 'C-00001',
    proveedor_id: 'prov1',
    usuario_id: 'user1',
    items: [
      { id: 'ic1', producto_id: '1', cantidad: 50, precio_unitario: 7.50, total: 375.00 },
      { id: 'ic2', producto_id: '3', cantidad: 20, precio_unitario: 9.00, total: 180.00 },
    ],
    subtotal: 555.00,
    igv: 99.90,
    total: 654.90,
    estado: 'completada',
    notas: 'Pollo de buena calidad',
    fecha: '2026-03-18T08:30:00Z',
    created_at: '2026-03-18T08:30:00Z',
  },
  {
    id: 'comp2',
    numero: 'C-00002',
    proveedor_id: 'prov2',
    usuario_id: 'user1',
    items: [
      { id: 'ic3', producto_id: '5', cantidad: 30, precio_unitario: 10.50, total: 315.00 },
    ],
    subtotal: 315.00,
    igv: 56.70,
    total: 371.70,
    estado: 'completada',
    notas: '',
    fecha: '2026-03-17T10:15:00Z',
    created_at: '2026-03-17T10:15:00Z',
  },
  {
    id: 'comp3',
    numero: 'C-00003',
    proveedor_id: 'prov3',
    usuario_id: 'user1',
    items: [
      { id: 'ic4', producto_id: '2', cantidad: 20, precio_unitario: 13.00, total: 260.00 },
    ],
    subtotal: 260.00,
    igv: 46.80,
    total: 306.80,
    estado: 'completada',
    notas: 'Huevos frescos',
    fecha: '2026-03-16T14:00:00Z',
    created_at: '2026-03-16T14:00:00Z',
  },
]
