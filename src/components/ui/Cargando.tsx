import { Loader2 } from 'lucide-react'

interface Props {
  className?: string
}

export function Cargando({ className = '' }: Props) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
    </div>
  )
}

export function CargandoEsqueleto({ className = '' }: Props) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  )
}