// Fila clickeable de proveedor
import { useNavigate } from 'react-router-dom'
import { Building2, ChevronRight, Phone, Mail } from 'lucide-react'
import type { Proveedor } from '@/types/proveedor.types'
import { RUTAS } from '@/config/rutas'

interface Props {
  proveedor: Proveedor
}

export function FilaProveedor({ proveedor }: Props) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`${RUTAS.PROVEEDORES}/${proveedor.id}`)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 md:gap-4 p-4 bg-white hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
    >
      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
        <Building2 size={24} className="text-blue-600" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900">{proveedor.nombre}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-blue-100 text-blue-700">
            RUC {proveedor.ruc}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
          {proveedor.telefono && (
            <p className="flex items-center gap-1">
              <Phone size={14} className="text-gray-400" />
              {proveedor.telefono}
            </p>
          )}
          {proveedor.email && (
            <p className="flex items-center gap-1">
              <Mail size={14} className="text-gray-400" />
              <span className="hidden lg:inline">{proveedor.email}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          proveedor.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          {proveedor.activo ? 'Activo' : 'Inactivo'}
        </span>
        <ChevronRight size={18} className="text-gray-400" />
      </div>
    </button>
  )
}
