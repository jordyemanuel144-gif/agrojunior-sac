import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { HeaderDetalleCliente, InfoClienteCards } from './components/DetalleClienteComponents'
import { FormularioCliente } from './components/FormularioCliente'
import { ModalConfirmarEliminar } from './components/ModalConfirmarEliminarCliente'
import { TabsCliente } from './components/TabsCliente'
import { HistorialVentasCliente } from './components/HistorialVentasCliente'
import { clientesService } from '@/services/clientes.service'
import type { Cliente, NuevoCliente } from '@/types/cliente.types'

export default function DetalleCliente() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [cargando, setCargando] = useState(true)
  const [mostrarEditar, setMostrarEditar] = useState(false)
  const [mostrarEliminar, setMostrarEliminar] = useState(false)
  const [tabActivo, setTabActivo] = useState<'datos' | 'ventas'>('datos')

  useEffect(() => {
    if (id) {
      clientesService.obtenerPorId(id)
        .then(setCliente)
        .finally(() => setCargando(false))
    }
  }, [id])

  const handleGuardar = async (datos: NuevoCliente) => {
    if (!id) return
    const actualizado = await clientesService.actualizar(id, datos)
    setCliente(actualizado)
    setMostrarEditar(false)
  }

  const handleEliminar = async () => {
    if (!id) return
    await clientesService.eliminar(id)
    navigate('/clientes')
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="p-6 max-w-screen-xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Cliente no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <HeaderDetalleCliente cliente={cliente} />

      <div className="p-4 md:p-6 max-w-screen-xl mx-auto space-y-4">
        <TabsCliente activo={tabActivo} onChange={setTabActivo}>
          {tabActivo === 'datos' ? (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <InfoClienteCards cliente={cliente} />
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Acciones</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setMostrarEditar(true)}
                      className="w-full px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-medium text-sm"
                    >
                      Editar Cliente
                    </button>
                    <button
                      onClick={() => setMostrarEliminar(true)}
                      className="w-full px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
                    >
                      Eliminar Cliente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <HistorialVentasCliente clienteId={cliente.id} />
          )}
        </TabsCliente>
      </div>

      {mostrarEditar && (
        <FormularioCliente
          cliente={cliente}
          onCerrar={() => setMostrarEditar(false)}
          onGuardar={handleGuardar}
        />
      )}

      {mostrarEliminar && (
        <ModalConfirmarEliminar
          cliente={cliente}
          onConfirmar={handleEliminar}
          onCancelar={() => setMostrarEliminar(false)}
        />
      )}
    </>
  )
}
