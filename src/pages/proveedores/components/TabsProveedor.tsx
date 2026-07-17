// TabsProveedor - Navegación por tabs para el detalle de proveedor
import type { ReactNode } from 'react'

interface TabsProveedorProps {
  activo: 'datos' | 'compras'
  onChange: (tab: 'datos' | 'compras') => void
  children: ReactNode
}

export function TabsProveedor({ activo, onChange, children }: TabsProveedorProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => onChange('datos')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activo === 'datos'
              ? 'text-primary border-b-2 border-primary bg-primary-light/50'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          Datos del Proveedor
        </button>
        <button
          onClick={() => onChange('compras')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activo === 'compras'
              ? 'text-primary border-b-2 border-primary bg-primary-light/50'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          Historial de Compras
        </button>
      </div>
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  )
}
