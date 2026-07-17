import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { RUTAS } from '@/config/rutas'
import { HeaderDetalleCliente, InfoClienteCards } from './components/DetalleClienteComponents'
import { FormularioCliente } from './components/FormularioCliente'
import { ModalConfirmarEliminar } from './components/ModalConfirmarEliminarCliente'
import { TabsCliente } from './components/TabsCliente'
import { HistorialVentasCliente } from './components/HistorialVentasCliente'
import { clientesService } from '@/services/clientes.service'
import { cuentaCorrienteService } from '@/services/cuenta-corriente.service'
import { ventasService } from '@/services/ventas.service'
import { formatFecha, formatHora } from '@/lib/utils'
import { descargarTexto, descargarImagen, descargarPdf } from '@/lib/deuda'
import type { Cliente, NuevoCliente } from '@/types/cliente.types'
import type { CuentaCorriente } from '@/types/cuenta-corriente.types'
import { MessageCircle, Download } from 'lucide-react'

export default function DetalleCliente() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [cargando, setCargando] = useState(true)
  const [mostrarEditar, setMostrarEditar] = useState(false)
  const [mostrarEliminar, setMostrarEliminar] = useState(false)
  const [tabActivo, setTabActivo] = useState<'datos' | 'ventas'>('datos')
  const [cuenta, setCuenta] = useState<CuentaCorriente | null>(null)
  const [showDescargar, setShowDescargar] = useState(false)

  useEffect(() => {
    if (id) {
      clientesService.obtenerPorId(id)
        .then(setCliente)
        .finally(() => setCargando(false))
    }
  }, [id])

  useEffect(() => {
    if (id) {
      cuentaCorrienteService.obtenerPorCliente(id).then(setCuenta)
    }
  }, [id])

  const handleGuardar = async (datos: NuevoCliente) => {
    if (!id) return
    const actualizado = await clientesService.actualizar(id, datos)
    setCliente(actualizado)
    setMostrarEditar(false)
  }

  const handleEliminar = async () => {
    if (!id) return
    await clientesService.eliminar(id)
    navigate(RUTAS.ADMIN.CLIENTES)
  }

  const handleReactivar = async () => {
    if (!id) return
    if (!confirm('¿Reactivar este cliente? Podrá volver a realizar compras.')) return
    try {
      console.log('Reactivando cliente:', id)
      const actualizado = await clientesService.reactivar(id)
      console.log('Resultado:', actualizado)
      setCliente(actualizado)
    } catch (e) {
      console.error('Error:', e)
      alert('Error al reactivAR: ' + e)
    }
  }

  const generarLinkWhatsApp = (telefono: string, mensaje: string): string => {
    const telefonoLimpio = telefono.replace(/\D/g, '')
    const mensajeEncoded = encodeURIComponent(mensaje)
    return `https://wa.me/51${telefonoLimpio}?text=${mensajeEncoded}`
  }

  const abrirWhatsApp = async () => {
    if (!id || !cuenta || !cliente) return
    if (cuenta.saldo_pendiente <= 0) return

    if (!cliente.telefono) {
      alert('El cliente no tiene teléfono registrado. Usa el botón Descargar para guardar el número.')
      return
    }

    const todasVentas = await ventasService.obtenerTodos()
    const ventasPendientes = todasVentas.filter(
      v => v.cliente_id === id && 
      v.estado === 'completada' && 
      v.estado_pago !== 'pagado'
    )

    const lineasVentas = ventasPendientes.map((venta) => {
      const pendiente = venta.total - venta.monto_pagado
      const items = (venta.items || []).map(i => `│ • ${i.producto.nombre} x${i.cantidad} = S/ ${i.subtotal.toFixed(2)}`).join('\n')
      const descuento = venta.descuento > 0 ? `\n│ Descuento: -S/ ${venta.descuento.toFixed(2)}` : ''
      const yaPagado = venta.monto_pagado > 0 ? `\n│ (Ya pagaste: S/ ${venta.monto_pagado.toFixed(2)})` : ''
      const fechaDia = formatFecha(venta.fecha)
      const hora = formatHora(venta.fecha)
      return `┌─ ${venta.ticket_numero.toUpperCase()} - ${fechaDia} ${hora} ─┐\n${items}${descuento}${yaPagado}\n└ 💰 Total: S/ ${venta.total.toFixed(2)} → Falta: S/ ${pendiente.toFixed(2)} ┘`
    }).join('\n\n')

    const mensaje = `RESUMEN DE CUENTA
━━━━━━━━━━━━━━━━━━━━
Hola ${cliente.nombre}, gracias por tu preferencia 👋

📋 Pedidos pendientes: ${ventasPendientes.length}

${lineasVentas}

━━━━━━━━━━━━━━━━━━━━
💰 TOTAL A PAGAR: S/${cuenta.saldo_pendiente.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━

📱 Yape: 970995140
🏦 Banco de Crédito
Titular: Darly Sanchez Cutipa
Cbta: 215-55555555

Cuando puedes cancelar? Gracias 🙏`

    const link = generarLinkWhatsApp(cliente.telefono, mensaje)
    window.open(link, '_blank')
  }

  const handleDescargar = async (tipo: 'texto' | 'imagen' | 'pdf') => {
    if (!cuenta || !id) return
    const todasVentas = await ventasService.obtenerTodos()
    const ventasPendientes = todasVentas.filter(
      v => v.cliente_id === id && 
      v.estado === 'completada' && 
      v.estado_pago !== 'pagado'
    )
    
    if (tipo === 'texto') {
      descargarTexto(cuenta, ventasPendientes)
    } else if (tipo === 'imagen') {
      descargarImagen(cuenta, ventasPendientes)
    } else {
      descargarPdf(cuenta, ventasPendientes)
    }
    setShowDescargar(false)
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="p-6 max-w-screen-xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Cliente no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <HeaderDetalleCliente cliente={cliente} saldoPendiente={cuenta?.saldo_pendiente} />

      <div className="p-4 md:p-6 max-w-screen-xl mx-auto space-y-4">
        <TabsCliente activo={tabActivo} onChange={setTabActivo}>
          {tabActivo === 'datos' ? (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <InfoClienteCards cliente={cliente} />
              </div>

              <div className="space-y-4">
                {cuenta && cuenta.saldo_pendiente > 0 && (
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Deuda pendiente
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      S/ {cuenta.saldo_pendiente.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Envía por WhatsApp o descarga el detalle
                    </p>
                  </div>
                )}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Acciones</h3>
                  <div className="space-y-2">
                    {cuenta && cuenta.saldo_pendiente > 0 && (
                      <div className="relative">
                        <button
                          onClick={abrirWhatsApp}
                          className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 ${
                            cliente?.telefono
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }`}
                        >
                          <MessageCircle className="w-4 h-4" />
                          {cliente?.telefono ? 'WhatsApp' : 'Registrar'}
                        </button>
                      </div>
                    )}
                    {cuenta && cuenta.saldo_pendiente > 0 && (
                      <div className="relative">
                        <button
                          onClick={() => setShowDescargar(!showDescargar)}
                          className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-800"
                        >
                          <Download className="w-4 h-4" />
                          Descargar
                        </button>
                        {showDescargar && (
                          <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
                            <button
                              onClick={() => handleDescargar('texto')}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              💬 Texto
                            </button>
                            <button
                              onClick={() => handleDescargar('imagen')}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              🖼️ Imagen
                            </button>
                            <button
                              onClick={() => handleDescargar('pdf')}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              📄 PDF
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => setMostrarEditar(true)}
                      className="w-full px-4 py-2.5 bg-primary-light text-primary rounded-xl hover:bg-primary-light transition-colors font-medium text-sm"
                    >
                      Editar Cliente
                    </button>
                    {!cliente?.activo ? (
                      <button
                        onClick={handleReactivar}
                        className="w-full px-4 py-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors font-medium text-sm"
                      >
                        Reactivar Cliente
                      </button>
                    ) : (
                      <button
                        onClick={() => setMostrarEliminar(true)}
                        className="w-full px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
                      >
                        Eliminar Cliente
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <HistorialVentasCliente clienteId={cliente.id} />
          )}
        </TabsCliente>
      </div>

      {mostrarEditar && (
        <FormularioCliente
          cliente={cliente}
          onCerrar={() => setMostrarEditar(false)}
          onGuardar={handleGuardar}
        />
      )}

      {mostrarEliminar && (
        <ModalConfirmarEliminar
          cliente={cliente}
          onConfirmar={handleEliminar}
          onCancelar={() => setMostrarEliminar(false)}
        />
      )}
    </>
  )
}
