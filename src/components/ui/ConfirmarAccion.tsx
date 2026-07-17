import { AlertTriangle, CheckCircle } from 'lucide-react'

interface ConfirmarAccionProps {
  abierto: boolean
  titulo: string
  mensaje: string
  mensajeSecundario?: string
  tipo?: 'info' | 'warning' | 'success'
  textoConfirmar?: string
  textoCancelar?: string
  onConfirmar: () => void
  onCancelar: () => void
  cargando?: boolean
}

export function ConfirmarAccion({
  abierto,
  titulo,
  mensaje,
  mensajeSecundario,
  tipo = 'info',
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  onConfirmar,
  onCancelar,
  cargando = false,
}: ConfirmarAccionProps) {
  if (!abierto) return null

  const iconBg = {
    info: 'bg-primary-light',
    warning: 'bg-amber-50',
    success: 'bg-green-50',
  }[tipo]

  const iconColor = {
    info: 'text-primary',
    warning: 'text-amber-600',
    success: 'text-green-600',
  }[tipo]

  const icon: React.ReactNode = {
    info: <CheckCircle className={`w-12 h-12 ${iconColor}`} />,
    warning: <AlertTriangle className={`w-12 h-12 ${iconColor}`} />,
    success: <CheckCircle className={`w-12 h-12 ${iconColor}`} />,
  }[tipo]

  const botonConfirmar = {
    info: 'bg-primary hover:bg-primary-hover',
    warning: 'bg-amber-600 hover:bg-amber-700',
    success: 'bg-green-600 hover:bg-green-700',
  }[tipo]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancelar} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full ${iconBg} flex items-center justify-center mb-4`}>
            {icon}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{titulo}</h3>
          <p className="text-gray-600 mb-1">{mensaje}</p>
          {mensajeSecundario && (
            <p className="text-sm text-gray-500 mb-6">{mensajeSecundario}</p>
          )}

          <div className="flex gap-3 w-full">
            <button
              onClick={onCancelar}
              disabled={cargando}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {textoCancelar}
            </button>
            <button
              onClick={onConfirmar}
              disabled={cargando}
              className={`flex-1 py-3 px-4 text-white font-medium rounded-xl transition-colors disabled:opacity-50 ${botonConfirmar}`}
            >
              {cargando ? 'Procesando...' : textoConfirmar}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}