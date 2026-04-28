import type { Cliente } from '@/types/cliente.types'

export const CLIENTES_MOCK: Cliente[] = [
  { id: 'publico', nombre: 'Público General', tipo: 'minorista', pendiente_aprobacion: false, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
  { id: 'c1', nombre: 'Distribuidora Alimentos S.A.', dni_ruc: '20512345678', telefono: '999888777', tipo: 'mayorista', pendiente_aprobacion: false, created_at: '2024-02-10T09:30:00Z', updated_at: '2024-06-20T14:15:00Z', email: 'dist@email.com', password_hash: 'password123', activo: true },
  { id: 'c2', nombre: 'María Rodríguez', dni_ruc: '12345678', telefono: '987654321', tipo: 'minorista', pendiente_aprobacion: false, created_at: '2024-03-05T11:00:00Z', updated_at: '2024-03-05T11:00:00Z', email: 'maria@email.com', password_hash: 'password123', activo: true },
  { id: 'c3', nombre: 'Juan Pérez', dni_ruc: '87654321', telefono: '966780316', tipo: 'especial', pendiente_aprobacion: false, created_at: '2024-03-22T16:45:00Z', updated_at: '2024-08-10T09:00:00Z', email: 'juan@email.com', password_hash: 'password123', activo: true },
  { id: 'c4', nombre: 'Restaurante El Buen Sabor', dni_ruc: '20654321987', telefono: '956789123', tipo: 'mayorista', pendiente_aprobacion: false, created_at: '2024-04-18T08:20:00Z', updated_at: '2024-04-18T08:20:00Z' },
  { id: 'c5', nombre: 'Café Restaurant La Terraza', dni_ruc: '10456789012', telefono: '923456789', tipo: 'especial', pendiente_aprobacion: false, created_at: '2024-05-12T13:30:00Z', updated_at: '2024-09-05T17:45:00Z' },
  { id: 'c6', nombre: 'Rosa Huamán', dni_ruc: '45678901', telefono: '978912345', tipo: 'minorista', pendiente_aprobacion: false, created_at: '2024-06-08T10:15:00Z', updated_at: '2024-06-08T10:15:00Z' },
  { id: 'c7', nombre: 'Restaurante Mi Tierra', dni_ruc: '20123456789', telefono: '966780316', tipo: 'mayorista', pendiente_aprobacion: false, created_at: '2024-07-15T08:00:00Z', updated_at: '2024-07-15T08:00:00Z' },
  { id: 'c8', nombre: 'Lucía Gonzales', dni_ruc: '76543210', telefono: '966780316', tipo: 'minorista', pendiente_aprobacion: false, created_at: '2024-08-20T10:30:00Z', updated_at: '2024-08-20T10:30:00Z' },
  { id: 'c9', nombre: 'Carnicería El Rojo', dni_ruc: '20234567890', telefono: '966780316', tipo: 'mayorista', pendiente_aprobacion: false, created_at: '2024-09-10T14:00:00Z', updated_at: '2024-09-10T14:00:00Z' },
  { id: 'c10', nombre: 'Sandra Málaga', dni_ruc: '61234567', telefono: '966780316', tipo: 'especial', pendiente_aprobacion: false, created_at: '2024-10-05T09:00:00Z', updated_at: '2024-10-05T09:00:00Z' },
  { id: 'c11', nombre: 'Pollería Express', dni_ruc: '20345678901', telefono: '966780316', tipo: 'mayorista', pendiente_aprobacion: false, created_at: '2024-11-12T11:00:00Z', updated_at: '2024-11-12T11:00:00Z' },
  { id: 'c12', nombre: 'Amanda Quispe', dni_ruc: '59876543', telefono: '966780316', tipo: 'minorista', pendiente_aprobacion: false, created_at: '2024-12-01T15:00:00Z', updated_at: '2024-12-01T15:00:00Z' },
  { id: 'nuevo1', nombre: 'Carlos Mendoza', telefono: '951234567', pendiente_aprobacion: true, tipo: 'minorista', created_at: '2026-03-28T14:30:00Z', updated_at: '2026-03-28T14:30:00Z' },
  { id: 'nuevo2', nombre: 'Supermercado Don José', dni_ruc: '20765432109', telefono: '912345678', pendiente_aprobacion: true, tipo: 'minorista', created_at: '2026-03-29T09:15:00Z', updated_at: '2026-03-29T09:15:00Z' },
]
