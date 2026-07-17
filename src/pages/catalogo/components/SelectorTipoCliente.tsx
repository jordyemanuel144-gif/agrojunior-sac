import type { TipoCliente } from '@/types/cliente.types'

interface SelectorTipoClienteProps {
  tipoSeleccionado: TipoCliente
  onCambiar: (tipo: TipoCliente) => void
}

const TIPOS: { value: TipoCliente; label: string; descuento: string }[] = [
  { value: 'minorista', label: 'Minorista', descuento: '' },
  { value: 'mayorista', label: 'Mayorista', descuento: '-10%' },
  { value: 'especial', label: 'Especial', descuento: '-5%' },
]

export function SelectorTipoCliente({ tipoSeleccionado, onCambiar }: SelectorTipoClienteProps) {
  return (
    <div className="flex gap-2">
      {TIPOS.map((tipo) => (
        <button
          key={tipo.value}
          onClick={() => onCambiar(tipo.value)}
          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 ${
            tipoSeleccionado === tipo.value
              ? 'bg-primary text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {tipo.label}
          {tipo.descuento && (
            <span className={`ml-1 text-[10px] ${tipoSeleccionado === tipo.value ? 'text-primary-light' : 'text-green-600'}`}>
              {tipo.descuento}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
