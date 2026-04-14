type VarianteBadge = 'exito' | 'advertencia' | 'peligro' | 'info' | 'neutral'

interface Props {
  children: React.ReactNode
  variante?: VarianteBadge
}

const colores: Record<VarianteBadge, string> = {
  exito: 'bg-emerald-100 text-emerald-800',
  advertencia: 'bg-amber-100 text-amber-800',
  peligro: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-800',
}

export function Badge({ children, variante = 'neutral' }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colores[variante]}`}>
      {children}
    </span>
  )
}