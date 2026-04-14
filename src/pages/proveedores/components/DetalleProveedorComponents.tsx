import { ArrowLeft, Building2, Phone, Mail, MapPin, User, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { RUTAS } from '@/config/rutas'
import type { Proveedor } from '@/types/proveedor.types'

interface Props {
  proveedor: Proveedor
}

export function HeaderDetalleProveedor({ proveedor }: Props) {
  const navigate = useNavigate()

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => navigate(RUTAS.ADMIN.PROVEEDORES)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Volver</span>
          </button>
          <div className="flex-1" />
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            proveedor.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}>
            {proveedor.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        <div className="flex items-center gap-4 px-4 pb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Building2 size={32} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{proveedor.nombre}</h1>
            <p className="text-gray-500">RUC {proveedor.ruc}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function InfoProveedorCards({ proveedor }: Props) {
  const fechaRegistro = new Date(proveedor.created_at)
  const fechaActualizacion = new Date(proveedor.updated_at)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Información de contacto</h3>
        <div className="space-y-3">
          {proveedor.contacto && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <User size={16} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Persona de contacto</p>
                <p className="text-sm font-medium text-gray-900">{proveedor.contacto}</p>
              </div>
            </div>
          )}
          {proveedor.telefono && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Phone size={16} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Teléfono</p>
                <p className="text-sm font-medium text-gray-900">{proveedor.telefono}</p>
              </div>
            </div>
          )}
          {proveedor.email && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Mail size={16} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900">{proveedor.email}</p>
              </div>
            </div>
          )}
          {proveedor.direccion && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <MapPin size={16} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Dirección</p>
                <p className="text-sm font-medium text-gray-900">{proveedor.direccion}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Datos del registro</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar size={16} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Fecha de registro</p>
              <p className="text-sm font-medium text-gray-900">
                {fechaRegistro.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar size={16} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Última actualización</p>
              <p className="text-sm font-medium text-gray-900">
                {fechaActualizacion.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
