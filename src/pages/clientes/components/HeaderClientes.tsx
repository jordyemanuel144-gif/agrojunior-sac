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
    <div className="mb-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Users size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-500 text-sm">
              {new Date().toLocaleDateString('es-PE', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Badge label="Total" value={clientes.length} />
          <Badge label="Minoristas" value={minoristas} color="blue" />
          <Badge label="Mayoristas" value={mayoristas} color="green" />
          <Badge label="Especiales" value={especiales} color="purple" />
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
    <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${styles[color]}`}>
      <span className="text-gray-500">{label}: </span>
      <span className="font-bold">{value}</span>
    </div>
  )
}
