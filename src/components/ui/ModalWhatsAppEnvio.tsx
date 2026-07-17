import { useState } from 'react'
import { X, MessageSquare, Image, Send, Loader2, Phone } from 'lucide-react'
import type { Venta } from '@/types/venta.types'
import type { CuentaCorriente } from '@/types/cuenta-corriente.types'
import { generarMensajeDeuda, generarHtmlDeuda } from '@/lib/deuda'
import { generarLinkWhatsApp, formatMoneda } from '@/lib/utils'
import { generarImagenDesdeElemento, descargarImagen } from '@/lib/imagen'
import { clientesService } from '@/services/clientes.service'

interface Props {
  cuenta: CuentaCorriente
  ventas: Venta[]
  onCerrar: () => void
  onTelefonoGuardado?: () => void
}

export function ModalWhatsAppEnvio({ cuenta, ventas, onCerrar, onTelefonoGuardado }: Props) {
  const [paso, setPaso] = useState<'seleccion' | 'telefono' | 'enviando'>('seleccion')
  const [telefono, setTelefono] = useState(cuenta.cliente_telefono || '')
  const [tipoEnvio, setTipoEnvio] = useState<'texto' | 'imagen' | null>(null)
  const [guardandoTelefono, setGuardandoTelefono] = useState(false)

  const handleSeleccionarTexto = () => {
    setTipoEnvio('texto')
    if (!telefono) {
      setPaso('telefono')
    } else {
      enviarMensajeTexto()
    }
  }

  const handleSeleccionarImagen = () => {
    setTipoEnvio('imagen')
    if (!telefono) {
      setPaso('telefono')
    } else {
      enviarMensajeImagen()
    }
  }

  const guardarTelefonoYEnviar = async () => {
    if (!telefono.trim()) return
    
    setGuardandoTelefono(true)
    try {
      await clientesService.actualizarTelefono(cuenta.cliente_id, telefono.trim())
      if (onTelefonoGuardado) onTelefonoGuardado()
      
      if (tipoEnvio === 'texto') {
        await enviarMensajeTexto()
      } else if (tipoEnvio === 'imagen') {
        await enviarMensajeImagen()
      }
    } finally {
      setGuardandoTelefono(false)
    }
  }

  const enviarMensajeTexto = async () => {
    setPaso('enviando')
    const mensaje = generarMensajeDeuda(cuenta, ventas)
    const link = generarLinkWhatsApp(telefono, mensaje)
    window.open(link, '_blank')
    onCerrar()
  }

  const enviarMensajeImagen = async () => {
    setPaso('enviando')
    try {
      const html = generarHtmlDeuda(cuenta, ventas)
      
      const container = document.createElement('div')
      container.id = 'deuda-imagen-temporal'
      container.style.cssText = 'position: fixed; left: -9999px; top: 0;'
      container.innerHTML = html
      document.body.appendChild(container)

      const dataUrl = await generarImagenDesdeElemento('deuda-imagen-temporal', { scale: 2 })
      document.body.removeChild(container)

      if (dataUrl) {
        descargarImagen(dataUrl, `deuda-${cuenta.cliente_nombre.replace(/\s+/g, '-')}.png`)
      }

      const mensaje = generarMensajeDeuda(cuenta, ventas)
      const link = generarLinkWhatsApp(telefono, mensaje)
      window.open(link, '_blank')

      onCerrar()
    } catch (error) {
      console.error('Error al generar imagen:', error)
      setPaso('seleccion')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Enviar Deuda por WhatsApp</h2>
          <button onClick={onCerrar} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {paso === 'seleccion' && (
          <div className="p-4 space-y-4">
            <div className="text-center mb-4">
              <p className="text-gray-600">
                Cliente: <span className="font-medium">{cuenta.cliente_nombre}</span>
              </p>
              <p className="text-2xl font-bold text-primary mt-2">
                {formatMoneda(cuenta.saldo_pendiente)}
              </p>
              <p className="text-sm text-gray-500">
                {ventas.length} venta{ventas.length !== 1 ? 's' : ''} pendiente{ventas.length !== 1 ? 's' : ''}
              </p>
            </div>

            <p className="text-sm text-gray-600 text-center">
              ¿Cómo deseas enviar el resumen de cuenta?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSeleccionarTexto}
                className="flex flex-col items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition"
              >
                <MessageSquare className="w-8 h-8 text-green-600" />
                <span className="font-medium text-green-700">Texto</span>
              </button>
              <button
                onClick={handleSeleccionarImagen}
                className="flex flex-col items-center gap-2 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition"
              >
                <Image className="w-8 h-8 text-purple-600" />
                <span className="font-medium text-purple-700">Imagen</span>
              </button>
            </div>

            <button
              onClick={onCerrar}
              className="w-full py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              Cancelar
            </button>
          </div>
        )}

        {paso === 'telefono' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3 bg-yellow-50 p-3 rounded-xl">
              <Phone className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                El cliente no tiene teléfono registrado
              </p>
            </div>

            <p className="text-sm text-gray-600">
              Ingresa el número de WhatsApp para guardar y enviar:
            </p>

            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="999123456"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary-light"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setPaso('seleccion')}
                className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
              >
                Volver
              </button>
              <button
                onClick={guardarTelefonoYEnviar}
                disabled={!telefono.trim() || guardandoTelefono}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {guardandoTelefono ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Guardar y Enviar
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {paso === 'enviando' && (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Abriendo WhatsApp...</p>
          </div>
        )}
      </div>
    </div>
  )
}