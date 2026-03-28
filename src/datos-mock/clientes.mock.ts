import type { Cliente } from '@/types/cliente.types'

export const CLIENTES_MOCK: Cliente[] = [
  { id: 'publico', nombre: 'Público General', tipo: 'minorista', created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
  { id: 'c1', nombre: 'Distribuidora Alimentos S.A.', dni_ruc: '20512345678', telefono: '999888777', tipo: 'mayorista', created_at: '2024-02-10T09:30:00Z', updated_at: '2024-06-20T14:15:00Z' },
  { id: 'c2', nombre: 'María Rodríguez', dni_ruc: '12345678', telefono: '987654321', tipo: 'minorista', created_at: '2024-03-05T11:00:00Z', updated_at: '2024-03-05T11:00:00Z' },
  { id: 'c3', nombre: 'Juan Pérez', dni_ruc: '87654321', telefono: '912345678', tipo: 'especial', created_at: '2024-03-22T16:45:00Z', updated_at: '2024-08-10T09:00:00Z' },
  { id: 'c4', nombre: 'Restaurante El Buen Sabor', dni_ruc: '20654321987', telefono: '956789123', tipo: 'mayorista', created_at: '2024-04-18T08:20:00Z', updated_at: '2024-04-18T08:20:00Z' },
  { id: 'c5', nombre: 'Café Restaurant La Terraza', dni_ruc: '10456789012', telefono: '923456789', tipo: 'especial', created_at: '2024-05-12T13:30:00Z', updated_at: '2024-09-05T17:45:00Z' },
  { id: 'c6', nombre: 'Rosa Huamán', dni_ruc: '45678901', telefono: '978912345', tipo: 'minorista', created_at: '2024-06-08T10:15:00Z', updated_at: '2024-06-08T10:15:00Z' },
]
