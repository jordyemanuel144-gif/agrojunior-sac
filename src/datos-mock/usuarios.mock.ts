import type { User } from '@/types/usuario.types'

export const USUARIOS_MOCK: User[] = [
  {
    id: 'usr_001',
    email: 'admin@samjose.com',
    name: 'Administrador',
    role: 'admin',
    active: true,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'usr_002',
    email: 'vendedor@samjose.com',
    name: 'Juan Pérez',
    role: 'vendedor',
    active: true,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
]
