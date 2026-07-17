import { useState } from 'react'
import { SidebarCliente } from './SidebarCliente'
import { Menu } from 'lucide-react'

interface LayoutClienteProps {
  children: React.ReactNode
}

export function LayoutCliente({ children }: LayoutClienteProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarCliente isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="md:ml-64">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} className="text-gray-600" />
          </button>
          <span className="ml-3 font-semibold text-gray-900">AGROJUNIOR SAC</span>
        </header>

        <main>{children}</main>
      </div>
    </div>
  )
}
