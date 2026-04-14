// TabsCliente - Navegación por tabs para el detalle de cliente
import type { ReactNode } from 'react'

interface TabsClienteProps {
  activo: 'datos' | 'ventas'
  onChange: (tab: 'datos' | 'ventas') => void
  children: ReactNode
}

export function TabsCliente({ activo, onChange, children }: TabsClienteProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => onChange('datos')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activo === 'datos'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          Datos del Cliente
        </button>
        <button
          onClick={() => onChange('ventas')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activo === 'ventas'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          Historial de Ventas
        </button>
      </div>
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  )
}