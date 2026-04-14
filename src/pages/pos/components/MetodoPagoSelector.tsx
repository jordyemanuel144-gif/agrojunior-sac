// MetodoPagoSelector - Selector de método de pago
import { Banknote, QrCode, Building2 } from 'lucide-react'
import type { MetodoPago } from '@/types/venta.types'

interface Props {
  metodo: MetodoPago
  setMetodo: (metodo: MetodoPago) => void
}

const METODOS: { id: MetodoPago; label: string; icon: React.ReactNode }[] = [
  { id: 'efectivo', label: 'Efectivo', icon: <Banknote size={28} /> },
  { id: 'yape', label: 'Yape/Plin', icon: <QrCode size={28} /> },
  { id: 'transferencia', label: 'Transf.', icon: <Building2 size={28} /> },
]

export function MetodoPagoSelector({ metodo, setMetodo }: Props) {
  return (
    <div className="bg-white rounded-2xl p-4">
      <h2 className="font-bold text-gray-900 mb-3">Método de Pago</h2>
      <div className="grid grid-cols-3 gap-2">
        {METODOS.map(m => (
          <button 
            key={m.id} 
            onClick={() => setMetodo(m.id)}
            className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 ${
              metodo === m.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
          >
            <span className={metodo === m.id ? 'text-blue-600' : 'text-gray-400'}>{m.icon}</span>
            <span className={`text-xs font-semibold ${metodo === m.id ? 'text-blue-600' : 'text-gray-500'}`}>{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}