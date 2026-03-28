// Header minimalista con estadísticas inline
import { Truck } from 'lucide-react'
import type { Proveedor } from '@/types/proveedor.types'

interface Props {
  proveedores: Proveedor[]
}

export function HeaderProveedores({ proveedores }: Props) {
  const activos = proveedores.filter(p => p.activo).length
  const inactivos = proveedores.length - activos

  return (
    <div className="mb-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Truck size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Proveedores</h1>
            <p className="text-gray-500 text-sm">
              {new Date().toLocaleDateString('es-PE', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Badge label="Total" value={proveedores.length} />
          <Badge label="Activos" value={activos} color="green" />
          <Badge label="Inactivos" value={inactivos} color="red" />
        </div>
      </div>
    </div>
  )
}

function Badge({ label, value, color = 'gray' }: { label: string; value: number; color?: 'gray' | 'green' | 'red' }) {
  const styles = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-600',
  }

  return (
    <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${styles[color]}`}>
      <span className="text-gray-500">{label}: </span>
      <span className="font-bold">{value}</span>
    </div>
  )
}
