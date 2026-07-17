// PageHeader - Header unificado para todas las páginas admin
// Muestra: título + icono + estadísticas (solo desktop)
// En móvil: solo título e icono (el MobileHeader maneja el menú)
import type { LucideIcon } from 'lucide-react'

interface StatBadge {
  label: string
  value: string | number
  color?: 'gray' | 'blue' | 'green' | 'red' | 'amber' | 'purple'
}

interface PageHeaderProps {
  titulo: string
  icono: LucideIcon
  stats?: StatBadge[]
  fecha?: boolean
}

export function PageHeader({ titulo, icono: Icono, stats = [], fecha = true }: PageHeaderProps) {
  const today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="mb-4 md:mb-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 md:w-12 bg-primary-light rounded-xl md:rounded-2xl flex items-center justify-center">
            <Icono size={18} className="text-primary md:size-6" />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl md:text-3xl font-bold text-gray-900">{titulo}</h1>
            {fecha && (
              <p className="text-gray-500 text-xs md:text-sm">{today}</p>
            )}
          </div>
        </div>

        {stats.length > 0 && (
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {stats.map((stat, idx) => (
              <StatBadge key={idx} {...stat} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatBadge({ label, value, color = 'gray' }: StatBadge) {
  const styles: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-primary-light text-primary-hover',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-700',
    purple: 'bg-purple-100 text-purple-700',
  }

  const shortLabels: Record<string, string> = {
    'Total': 'Total',
    'Completadas': 'Comp.',
    'Anuladas': 'Anul.',
    'Pendientes': 'Pend.',
    'Activos': 'Act.',
    'Inactivos': 'Inac.',
    'Minoristas': 'Min.',
    'Mayoristas': 'May.',
    'Especiales': 'Esp.',
    'Agotados': 'Agot.',
    'Bajo stock': 'Bajo',
  }

  return (
    <div className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-medium ${styles[color]}`}>
      <span className="text-gray-500">{shortLabels[label] || label}: </span>
      <span className="font-bold">{value}</span>
    </div>
  )
}
