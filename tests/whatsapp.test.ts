// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generarLinkWhatsApp, generarMensajeDeuda, abrirWhatsAppCliente } from '@/lib/whatsapp'
import type { Venta } from '@/types/venta.types'

// ===========================================================================
// generarLinkWhatsApp
// ===========================================================================

describe('generarLinkWhatsApp', () => {
  it('debería generar un link wa.me con código +51', () => {
    const link = generarLinkWhatsApp('916794870', 'Hola')
    expect(link).toBe('https://wa.me/51916794870?text=Hola')
  })

  it('debería limpiar caracteres no numéricos del teléfono', () => {
    const link = generarLinkWhatsApp('+51 916 794 870', 'Test')
    expect(link).toBe('https://wa.me/51916794870?text=Test')
  })

  it('debería codificar el mensaje como URI component', () => {
    const link = generarLinkWhatsApp('916794870', 'Hola ¿cómo estás?')
    expect(link).toContain(encodeURIComponent('Hola ¿cómo estás?'))
    expect(link).not.toContain(' ')
    expect(link).not.toContain('¿')
  })

  it('debería manejar mensajes vacíos', () => {
    const link = generarLinkWhatsApp('916794870', '')
    expect(link).toBe('https://wa.me/51916794870?text=')
  })

  it('debería manejar teléfonos con guiones', () => {
    const link = generarLinkWhatsApp('916-794-870', 'Hola')
    expect(link).toBe('https://wa.me/51916794870?text=Hola')
  })
})

// ===========================================================================
// generarMensajeDeuda
// ===========================================================================

describe('generarMensajeDeuda', () => {
  const ventasMock: Venta[] = [
    {
      id: 'v1',
      ticket_numero: 'SAM-00001',
      cliente_id: 'c1',
      vendedor_id: 'u1',
      items: [
        {
          producto: { id: 'p1', nombre: 'Pollo Entero' } as any,
          cantidad: 2,
          precio_unitario: 15,
          subtotal: 30,
        },
      ],
      metodo_pago: 'efectivo',
      subtotal: 35,
      descuento: 5,
      igv: 0,
      total: 30,
      monto_pagado: 0,
      estado_pago: 'pendiente',
      fecha: new Date().toISOString(),
      estado: 'completada',
    },
  ]

  it('debería incluir el nombre del cliente en el mensaje', () => {
    const msg = generarMensajeDeuda('Juan Pérez', 150, ventasMock)
    expect(msg).toContain('Juan Pérez')
  })

  it('debería incluir el total a pagar', () => {
    const msg = generarMensajeDeuda('Juan Pérez', 150, ventasMock)
    expect(msg).toContain('S/ 150.00')
  })

  it('debería listar los productos de cada venta', () => {
    const msg = generarMensajeDeuda('Juan Pérez', 150, ventasMock)
    expect(msg).toContain('Pollo Entero')
    expect(msg).toContain('x2')
    expect(msg).toContain('S/ 30.00')
  })

  it('debería incluir datos bancarios por defecto', () => {
    const msg = generarMensajeDeuda('Juan Pérez', 150, ventasMock)
    expect(msg).toContain('Yape: 970995140')
    expect(msg).toContain('Banco de Crédito')
  })

  it('debería manejar lista vacía de ventas pendientes', () => {
    const msg = generarMensajeDeuda('Juan Pérez', 0, [])
    expect(msg).toContain('Juan Pérez')
    expect(msg).toContain('S/ 0.00')
    expect(msg).toContain('Pedidos pendientes: 0')
  })

  it('debería indicar monto ya pagado cuando corresponde', () => {
    const ventaConAbono: Venta = {
      ...ventasMock[0],
      monto_pagado: 10,
      total: 30,
    }
    const msg = generarMensajeDeuda('Juan Pérez', 20, [ventaConAbono])
    expect(msg).toContain('Ya pagaste: S/ 10.00')
    expect(msg).toContain('FALTA: S/ 20.00')
  })

  it('debería incluir descuento cuando existe', () => {
    const msg = generarMensajeDeuda('Juan Pérez', 30, ventasMock)
    expect(msg).toContain('Descuento: -S/ 5.00')
    expect(msg).toContain('Total sin descu.: S/ 35.00')
  })
})

// ===========================================================================
// abrirWhatsAppCliente
// ===========================================================================

describe('abrirWhatsAppCliente', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      open: (url?: string) => {
        // store url for assertion
        ;(globalThis as any).__openedUrl = url
        return null
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete (globalThis as any).__openedUrl
  })

  it('debería abrir una ventana con el link de WhatsApp', () => {
    abrirWhatsAppCliente('916794870', 'Hola')
    const openedUrl = (globalThis as any).__openedUrl
    expect(openedUrl).toBe('https://wa.me/51916794870?text=Hola')
  })
})
