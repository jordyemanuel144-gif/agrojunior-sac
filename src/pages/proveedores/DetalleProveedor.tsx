import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { HeaderDetalleProveedor, InfoProveedorCards } from './components/DetalleProveedorComponents'
import { FormularioProveedor } from './components/FormularioProveedor'
import { ModalConfirmarEliminar } from './components/ModalConfirmarEliminarProveedor'
import { TabsProveedor } from './components/TabsProveedor'
import { HistorialComprasProveedor } from './components/HistorialComprasProveedor'
import { proveedoresService } from '@/services/proveedores.service'
import { RUTAS } from '@/config/rutas'
import type { Proveedor, NuevoProveedor } from '@/types/proveedor.types'

export default function DetalleProveedor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [proveedor, setProveedor] = useState<Proveedor | null>(null)
  const [cargando, setCargando] = useState(true)
  const [mostrarEditar, setMostrarEditar] = useState(false)
  const [mostrarEliminar, setMostrarEliminar] = useState(false)
  const [tabActivo, setTabActivo] = useState<'datos' | 'compras'>('datos')

  useEffect(() => {
    if (id) {
      proveedoresService.obtenerPorId(id)
        .then(setProveedor)
        .finally(() => setCargando(false))
    }
  }, [id])

  const handleGuardar = async (datos: NuevoProveedor) => {
    if (!id) return
    const actualizado = await proveedoresService.actualizar(id, datos)
    setProveedor(actualizado)
    setMostrarEditar(false)
  }

  const handleEliminar = async () => {
    if (!id) return
    await proveedoresService.eliminar(id)
    navigate(RUTAS.ADMIN.PROVEEDORES)
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!proveedor) {
    return (
      <div className="p-6 max-w-screen-xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Proveedor no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <HeaderDetalleProveedor proveedor={proveedor} />

      <div className="p-4 md:p-6 max-w-screen-xl mx-auto space-y-4">
        <TabsProveedor activo={tabActivo} onChange={setTabActivo}>
          {tabActivo === 'datos' ? (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <InfoProveedorCards proveedor={proveedor} />
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Acciones</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setMostrarEditar(true)}
                      className="w-full px-4 py-2.5 bg-primary-light text-primary rounded-xl hover:bg-primary-light transition-colors font-medium text-sm"
                    >
                      Editar Proveedor
                    </button>
                    <button
                      onClick={() => setMostrarEliminar(true)}
                      className="w-full px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
                    >
                      Eliminar Proveedor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <HistorialComprasProveedor proveedorId={proveedor.id} />
          )}
        </TabsProveedor>
      </div>

      {mostrarEditar && (
        <FormularioProveedor
          proveedor={proveedor}
          onCerrar={() => setMostrarEditar(false)}
          onGuardar={handleGuardar}
        />
      )}

      {mostrarEliminar && (
        <ModalConfirmarEliminar
          proveedor={proveedor}
          onConfirmar={handleEliminar}
          onCancelar={() => setMostrarEliminar(false)}
        />
      )}
    </>
  )
}
