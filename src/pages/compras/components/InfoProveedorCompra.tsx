// Info del proveedor en detalle de compra
import { Building2, Phone, Mail, MapPin } from 'lucide-react'
import type { Compra } from '@/types/compra.types'
import { proveedoresService } from '@/services/proveedores.service'

interface Props {
  compra: Compra
}

export function InfoProveedorCompra({ compra }: Props) {
  const proveedor = proveedoresService.obtenerProveedorDelCache(compra.proveedor_id)

  if (!proveedor) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Proveedor</h3>
        <p className="text-gray-500">Proveedor no encontrado</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Proveedor</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{proveedor.nombre}</p>
            <p className="text-sm text-gray-500">RUC {proveedor.ruc}</p>
          </div>
        </div>
        {proveedor.telefono && (
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-gray-400" />
            <p className="text-sm text-gray-600">{proveedor.telefono}</p>
          </div>
        )}
        {proveedor.email && (
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-gray-400" />
            <p className="text-sm text-gray-600">{proveedor.email}</p>
          </div>
        )}
        {proveedor.direccion && (
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-gray-400" />
            <p className="text-sm text-gray-600">{proveedor.direccion}</p>
          </div>
        )}
      </div>
    </div>
  )
}
