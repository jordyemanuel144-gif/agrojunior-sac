// Header minimalista con estadísticas inline
import { Users } from 'lucide-react'
import type { Cliente } from '@/types/cliente.types'

interface Props {
  clientes: Cliente[]
}

export function HeaderClientes({ clientes }: Props) {
  const minoristas = clientes.filter(c => c.tipo === 'minorista').length
  const mayoristas = clientes.filter(c => c.tipo === 'mayorista').length
  const especiales = clientes.filter(c => c.tipo === 'especial').length

  return (
    <div className="mb-4 md:mb-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 md:w-12 bg-blue-100 rounded-xl md:rounded-2xl flex items-center justify-center">
            <Users size={18} className="text-blue-600 md:w-6" />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl md:text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-500 text-xs md:text-sm hidden md:block">
              {new Date().toLocaleDateString('es-PE', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <Badge label="Total" value={clientes.length} />
          <Badge label="Min." value={minoristas} color="blue" />
          <Badge label="May." value={mayoristas} color="green" />
          <Badge label="Esp." value={especiales} color="purple" />
        </div>
      </div>
    </div>
  )
}

function Badge({ label, value, color = 'gray' }: { label: string; value: number; color?: 'gray' | 'blue' | 'green' | 'purple' }) {
  const styles = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-medium ${styles[color]}`}>
      <span className="text-gray-500">{label}: </span>
      <span className="font-bold">{value}</span>
    </div>
  )
}
