import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

type Variante = 'primario' | 'secundario' | 'peligro' | 'ghost'
type Tamano = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamano?: Tamano
  cargando?: boolean
}

const estilos = {
  primario: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800',
  secundario: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 border border-gray-300',
  peligro: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200',
}

const tamanos = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-6 py-3 text-lg',
}

export const Boton = forwardRef<HTMLButtonElement, Props>(
  ({ variante = 'primario', tamano = 'md', cargando, children, className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || cargando}
        className={`
          inline-flex items-center justify-center gap-2 rounded-lg font-medium
          transition-colors duration-150 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${estilos[variante]}
          ${tamanos[tamano]}
          ${className}
        `}
        {...props}
      >
        {cargando && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Boton.displayName = 'Boton'