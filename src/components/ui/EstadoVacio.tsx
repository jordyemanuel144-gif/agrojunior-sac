import { type ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface Props {
  titulo?: string
  mensaje?: string
  icono?: ReactNode
}

export function EstadoVacio({ titulo = 'No hay resultados', mensaje, icono }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {icono || <Inbox className="w-8 h-8 text-gray-400" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{titulo}</h3>
      {mensaje && <p className="text-sm text-gray-500 max-w-sm">{mensaje}</p>}
    </div>
  )
}