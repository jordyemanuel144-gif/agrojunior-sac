import { useState } from 'react'
import { Users, Building2, Percent, Settings, AlertTriangle } from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'
import { useUsuarios } from './hooks/useUsuarios'
import { useConfiguracion } from './hooks/useConfiguracion'
import { FilaUsuario } from './components/FilaUsuario'
import { FormularioUsuario } from './components/FormularioUsuario'
import { FormularioNegocio } from './components/FormularioNegocio'
import { FormularioImpuestos } from './components/FormularioImpuestos'
import { FormularioDescuentos } from './components/FormularioDescuentos'
import { FormularioSistema } from './components/FormularioSistema'
import type { User, NuevoUsuario } from '@/types/usuario.types'

export default function Configuracion() {
  const { isAdmin } = useAuthContext()
  const { usuarios, crearUsuario, actualizarUsuario, toggleActivo, eliminarUsuario } = useUsuarios()
  const { config, guardando, mensaje, guardarNegocio, guardarImpuestos, guardarDescuentos, guardarSistema, resetear } = useConfiguracion()
  
  const [mostrarForm, setMostrarForm] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState<User | null>(null)
  const [tabActivo, setTabActivo] = useState<'negocio' | 'impuestos' | 'sistema' | 'usuarios'>('negocio')

  const handleCrear = () => {
    setUsuarioEditando(null)
    setMostrarForm(true)
  }

  const handleEditar = (usuario: User) => {
    setUsuarioEditando(usuario)
    setMostrarForm(true)
  }

  const handleGuardarUsuario = async (datos: Omit<NuevoUsuario, 'id' | 'created_at' | 'updated_at'>) => {
    if (usuarioEditando) {
      await actualizarUsuario(usuarioEditando.id, datos)
    } else {
      await crearUsuario(datos)
    }
    setMostrarForm(false)
  }

  const handleEliminar = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      await eliminarUsuario(id)
    }
  }

  const tabs = [
    { id: 'negocio', label: 'Negocio', icon: Building2 },
    { id: 'impuestos', label: 'Impuestos', icon: Percent },
    { id: 'sistema', label: 'Sistema', icon: Settings },
    ...(isAdmin ? [{ id: 'usuarios', label: 'Usuarios', icon: Users }] : []),
  ]

  if (!isAdmin) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-2">No tienes acceso a esta sección.</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        {mensaje && (
          <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium animate-fade-in">
            {mensaje}
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setTabActivo(tab.id as typeof tabActivo)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition ${
              tabActivo === tab.id
                ? 'bg-primary text-white rounded-xl'
                : 'text-gray-500 hover:bg-gray-100 rounded-xl'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {tabActivo === 'negocio' && (
        <FormularioNegocio config={config.negocio} onGuardar={guardarNegocio} guardando={guardando} />
      )}

      {tabActivo === 'impuestos' && (
        <div className="space-y-4">
          <FormularioImpuestos config={config.impuestos} onGuardar={guardarImpuestos} guardando={guardando} />
          <FormularioDescuentos config={config.descuentos} onGuardar={guardarDescuentos} guardando={guardando} />
        </div>
      )}

      {tabActivo === 'sistema' && (
        <div className="space-y-4">
          <FormularioSistema config={config.sistema} onGuardar={guardarSistema} guardando={guardando} />
          <button onClick={resetear} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition text-sm">
            <AlertTriangle size={16} />
            Restablecer valores por defecto
          </button>
        </div>
      )}

      {tabActivo === 'usuarios' && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-500 text-sm">Gestiona los usuarios del sistema</p>
            <button onClick={handleCrear} className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition text-sm font-medium">
              + Nuevo Usuario
            </button>
          </div>
          {usuarios.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500">No hay usuarios registrados</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Usuario</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Rol</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(usuario => (
                    <FilaUsuario key={usuario.id} usuario={usuario} onEditar={handleEditar} onEliminar={handleEliminar} onToggleActivo={toggleActivo} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {mostrarForm && (
        <FormularioUsuario usuario={usuarioEditando} onCerrar={() => setMostrarForm(false)} onGuardar={handleGuardarUsuario} />
      )}
    </div>
  )
}
