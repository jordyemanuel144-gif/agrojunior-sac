import { describe, it, expect, beforeEach } from 'vitest'
import { clientesService } from '@/services/clientes.service'

describe('clientesService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('debería obtener todos los clientes', async () => {
    const clientes = await clientesService.obtenerTodos()
    expect(clientes.length).toBeGreaterThan(0)
  })

  it('debería buscar cliente por id', async () => {
    const clientes = await clientesService.obtenerTodos()
    const cliente = await clientesService.obtenerPorId(clientes[0].id)
    expect(cliente).not.toBeNull()
    expect(cliente?.id).toBe(clientes[0].id)
  })

  it('debería retornar null para id inexistente', async () => {
    const cliente = await clientesService.obtenerPorId('no-existe')
    expect(cliente).toBeNull()
  })

  it('debería obtener clientes pendientes', async () => {
    const pendientes = await clientesService.obtenerPendientes()
    expect(pendientes.every(c => c.pendiente_aprobacion)).toBe(true)
  })

  it('debería crear un nuevo cliente', async () => {
    const nuevoCliente = await clientesService.crear({
      nombre: 'Test Cliente',
      dni_ruc: '12345678',
      tipo: 'minorista',
    })
    expect(nuevoCliente.nombre).toBe('Test Cliente')
    expect(nuevoCliente.pendiente_aprobacion).toBe(true)
  })

  it('debería aprobar un cliente', async () => {
    const clientes = await clientesService.obtenerTodos()
    const cliente = clientes.find(c => c.pendiente_aprobacion)
    if (cliente) {
      const aprobado = await clientesService.aprobarCliente(cliente.id, 'mayorista')
      expect(aprobado.pendiente_aprobacion).toBe(false)
      expect(aprobado.tipo).toBe('mayorista')
    }
  })

  it('debería obtener nombre del cliente', async () => {
    const clientes = await clientesService.obtenerTodos()
    const nombre = clientesService.getCliente(clientes[0].id)
    expect(nombre).toBe(clientes[0].nombre)
  })

  it('debería retornar texto por defecto para cliente inexistente', async () => {
    const nombre = clientesService.getCliente('no-existe')
    expect(nombre).toBe('Cliente no encontrado')
  })
})