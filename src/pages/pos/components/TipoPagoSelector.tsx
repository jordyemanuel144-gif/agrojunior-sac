// TipoPagoSelector - Selector de tipo de pago
import { CheckCircle2, Wallet, Clock } from 'lucide-react'

interface Props {
  tipoPago: 'completo' | 'parcial' | 'cuenta'
  setTipoPago: (tipo: 'completo' | 'parcial' | 'cuenta') => void
  esPublico: boolean
}

export function TipoPagoSelector({ tipoPago, setTipoPago, esPublico }: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 space-y-3">
      <h2 className="font-bold text-gray-900 mb-2">Tipo de Pago</h2>
      <div className="grid grid-cols-3 gap-3">
        <OpcionTipoPago
          activa={tipoPago === 'completo'}
          onClick={() => setTipoPago('completo')}
          icon={<CheckCircle2 size={28} className={tipoPago === 'completo' ? 'text-green-600' : 'text-gray-400'} />}
          label="Completo"
          sublabel="Paga todo"
          colorBorder={tipoPago === 'completo' ? 'border-green-500' : 'border-gray-200'}
          bgActive={tipoPago === 'completo' ? 'bg-green-50' : 'bg-white'}
        />
        <OpcionTipoPago
          activa={tipoPago === 'parcial'}
          onClick={() => !esPublico && setTipoPago('parcial')}
          disabled={esPublico}
          icon={<Wallet size={28} className={tipoPago === 'parcial' ? 'text-yellow-600' : 'text-gray-400'} />}
          label="Parcial"
          sublabel="Paga algo"
          colorBorder={esPublico ? 'border-gray-200' : tipoPago === 'parcial' ? 'border-yellow-500' : 'border-gray-200'}
          bgActive={esPublico ? 'bg-white' : tipoPago === 'parcial' ? 'bg-yellow-50' : 'bg-white'}
        />
        <OpcionTipoPago
          activa={tipoPago === 'cuenta'}
          onClick={() => !esPublico && setTipoPago('cuenta')}
          disabled={esPublico}
          icon={<Clock size={28} className={tipoPago === 'cuenta' ? 'text-red-600' : 'text-gray-400'} />}
          label="A cuenta"
          sublabel="Paga después"
          colorBorder={esPublico ? 'border-gray-200' : tipoPago === 'cuenta' ? 'border-red-500' : 'border-gray-200'}
          bgActive={esPublico ? 'bg-white' : tipoPago === 'cuenta' ? 'bg-red-50' : 'bg-white'}
        />
      </div>
      {esPublico && (
        <p className="text-xs text-center text-gray-400 bg-gray-50 py-2 rounded-lg">
          Para ventas a cuenta o parcial, selecciona un cliente registrado
        </p>
      )}
    </div>
  )
}

function OpcionTipoPago({ activa, onClick, disabled, icon, label, sublabel, colorBorder, bgActive }: {
  activa: boolean
  onClick: () => void
  disabled?: boolean
  icon: React.ReactNode
  label: string
  sublabel: string
  colorBorder: string
  bgActive: string
}) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${colorBorder} ${bgActive}`}
    >
      {icon}
      <div className="text-center">
        <p className={`font-semibold ${activa ? 'text-gray-900' : 'text-gray-700'}`}>{label}</p>
        <p className="text-xs text-gray-500">{sublabel}</p>
      </div>
    </button>
  )
}