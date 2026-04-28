import type { LucideIcon } from 'lucide-react'

interface StatBadge {
  label: string
  value: string | number
  color?: 'gray' | 'blue' | 'green' | 'red' | 'amber' | 'purple'
}

interface PageHeaderClienteProps {
  titulo: string
  icono: LucideIcon
  stats?: StatBadge[]
}

export function PageHeaderCliente({ titulo, icono: Icono, stats = [] }: PageHeaderClienteProps) {
  return (
    <div className="mb-4 md:mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 md:w-12 bg-blue-100 rounded-xl md:rounded-2xl flex items-center justify-center">
            <Icono size={18} className="text-blue-600 md:size-6" />
          </div>
          <h1 className="text-lg md:text-2xl md:text-3xl font-bold text-gray-900">{titulo}</h1>
        </div>
        {stats.length > 0 && (
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {stats.map((stat, idx) => (
              <div key={idx} className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-medium ${
                stat.color === 'green' ? 'bg-green-100 text-green-700' :
                stat.color === 'red' ? 'bg-red-100 text-red-600' :
                stat.color === 'amber' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                <span className="text-gray-500">{stat.label}: </span>
                <span className="font-bold">{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}