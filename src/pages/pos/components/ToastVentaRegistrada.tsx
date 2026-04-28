import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { RUTAS } from '@/config/rutas'

interface ToastVentaRegistradaProps {
  comprobanteId: string
  ticketNumero: string
  tipo: 'venta' | 'cuenta'
  onCerrar: () => void
}

export function ToastVentaRegistrada({ comprobanteId, ticketNumero, tipo, onCerrar }: ToastVentaRegistradaProps) {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onCerrar, 300)
    }, 4000)
    return () => clearTimeout(timer)
  }, [onCerrar])

  const handleVerComprobante = () => {
    navigate(`${RUTAS.ADMIN.COMPROBANTES}/${comprobanteId}`)
    setVisible(false)
    setTimeout(onCerrar, 300)
  }

  const handleCerrar = () => {
    setVisible(false)
    setTimeout(onCerrar, 300)
  }

  if (!visible) return null

  const isCuenta = tipo === 'cuenta'
  const bgColor = isCuenta ? 'bg-blue-600' : 'bg-green-600'
  const textColor = isCuenta ? 'text-blue-100' : 'text-green-100'
  const buttonColor = isCuenta ? 'text-blue-700 hover:bg-blue-50' : 'text-green-700 hover:bg-green-50'
  const iconBg = isCuenta ? 'bg-blue-100' : 'bg-white/20'

  return createPortal(
    <div className={`fixed bottom-6 right-6 ${bgColor} text-white rounded-xl shadow-lg p-4 max-w-sm animate-in slide-in-from-bottom-4 z-[100]`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
          {isCuenta ? <Clock className="w-5 h-5 text-white" /> : <Check className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <p className="font-bold">{isCuenta ? 'Venta registrada a cuenta' : '¡Venta completada!'}</p>
          <p className={`text-sm ${textColor}`}>Ticket: {ticketNumero}</p>
        </div>
        <button onClick={handleCerrar} className={`${isCuenta ? 'text-blue-200' : 'text-green-200'} hover:text-white`}>
          <X size={18} />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        {!isCuenta && (
          <button 
            onClick={handleVerComprobante}
            className={`flex-1 bg-white ${buttonColor} py-2 rounded-lg text-sm font-medium`}
          >
            Ver comprobante
          </button>
        )}
        {isCuenta && (
          <button 
            onClick={handleCerrar}
            className="flex-1 bg-white text-blue-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-50"
          >
            Aceptar
          </button>
        )}
      </div>
    </div>,
    document.body
  )
}