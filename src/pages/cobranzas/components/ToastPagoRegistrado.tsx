import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { RUTAS } from '@/config/rutas'

interface ToastPagoRegistradoProps {
  comprobanteId: string
  onCerrar: () => void
}

export function ToastPagoRegistrado({ comprobanteId, onCerrar }: ToastPagoRegistradoProps) {
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

  return createPortal(
    <div className="fixed bottom-6 right-6 bg-green-600 text-white rounded-xl shadow-lg p-4 max-w-sm animate-in slide-in-from-bottom-4 z-[100]">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Check className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-bold">¡Pago registrado!</p>
          <p className="text-sm text-green-100">El comprobante se ha guardado</p>
        </div>
        <button onClick={handleCerrar} className="text-green-200 hover:text-white">
          <X size={18} />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button 
          onClick={handleVerComprobante}
          className="flex-1 bg-white text-green-700 py-2 rounded-lg text-sm font-medium hover:bg-green-50"
        >
          Ver comprobante
        </button>
      </div>
    </div>,
    document.body
  )
}