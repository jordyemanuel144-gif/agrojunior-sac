import { useState } from 'react'
import { Wallet, MessageCircle, Download, Edit } from 'lucide-react'
import type { CuentaCorriente } from '@/types/cuenta-corriente.types'

interface AccionesCobranzaProps {
  cuenta: CuentaCorriente
  onPagar: () => void
  onWhatsApp: () => void
  onDescargar: (tipo: 'texto' | 'imagen' | 'pdf') => void
}

export function AccionesCobranza({ cuenta, onPagar, onWhatsApp, onDescargar }: AccionesCobranzaProps) {
  const [showDescargar, setShowDescargar] = useState(false)
  const tieneTelefono = Boolean(cuenta.cliente_telefono)

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h2 className="text-base font-bold text-gray-900 mb-4">Acciones</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {cuenta.saldo_pendiente > 0 && (
          <button
            onClick={onPagar}
            className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            <Wallet size={18} />
            Registrar Pago
          </button>
        )}

        {cuenta.saldo_pendiente > 0 && (
          <button
            onClick={onWhatsApp}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-colors ${
              tieneTelefono
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            <MessageCircle size={18} />
            {tieneTelefono ? 'WhatsApp' : 'Sin Teléfono'}
          </button>
        )}

        {cuenta.saldo_pendiente > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowDescargar(!showDescargar)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gray-700 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors"
            >
              <Download size={18} />
              Descargar
            </button>
            {showDescargar && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
                <button
                  onClick={() => { onDescargar('texto'); setShowDescargar(false) }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  💬 Texto
                </button>
                <button
                  onClick={() => { onDescargar('imagen'); setShowDescargar(false) }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  🖼️ Imagen
                </button>
                <button
                  onClick={() => { onDescargar('pdf'); setShowDescargar(false) }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  📄 PDF
                </button>
              </div>
            )}
          </div>
        )}

        <button
          className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-xl font-medium text-sm hover:bg-blue-100 transition-colors"
        >
          <Edit size={18} />
          Editar Cliente
        </button>
      </div>
    </div>
  )
}