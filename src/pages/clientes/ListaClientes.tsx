import { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { HeaderClientes } from './components/HeaderClientes'
import { FiltrosClientes } from './components/FiltrosClientes'
import { FilaCliente } from './components/FilaCliente'
import { FormularioCliente } from './components/FormularioCliente'
import { clientesService } from '@/services/clientes.service'
import type { Cliente, NuevoCliente } from '@/types/cliente.types'

export default function ListaClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'minorista' | 'mayorista' | 'especial'>('todos')

  useEffect(() => {
    const init = async () => {
      const data = await clientesService.obtenerTodos()
      setClientes(data)
      setCargando(false)
    }
    init()
  }, [])

  const clientesFiltrados = useMemo(() => {
    return clientes.filter(c => {
      const matchBusqueda =
        busqueda === '' ||
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.dni_ruc?.toLowerCase().includes(busqueda.toLowerCase()) ?? false) ||
        (c.telefono?.toLowerCase().includes(busqueda.toLowerCase()) ?? false)

      const matchTipo =
        filtroTipo === 'todos' || c.tipo === filtroTipo

      return matchBusqueda && matchTipo
    })
  }, [clientes, busqueda, filtroTipo])

  const handleCrear = () => {
    setClienteEditando(null)
    setMostrarForm(true)
  }

  const handleGuardar = async (datos: NuevoCliente) => {
    if (clienteEditando) {
      await clientesService.actualizar(clienteEditando.id, datos)
    } else {
      await clientesService.crear(datos)
    }
    const data = await clientesService.obtenerTodos()
    setClientes(data)
  }

  if (cargando) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <HeaderClientes clientes={clientes} />

        <div className="max-w-screen-xl mx-auto">
          <button
            onClick={handleCrear}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors mb-4"
          >
            <Plus size={20} />
            <span className="font-medium">Nuevo Cliente</span>
          </button>

          <FiltrosClientes
            busqueda={busqueda}
            filtroTipo={filtroTipo}
            onBusquedaChange={setBusqueda}
            onTipoChange={setFiltroTipo}
          />

          {clientesFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500">
                {busqueda || filtroTipo !== 'todos'
                  ? 'No se encontraron clientes con los filtros aplicados'
                  : 'No hay clientes registrados'}
              </p>
              {(busqueda || filtroTipo !== 'todos') && (
                <button
                  onClick={() => { setBusqueda(''); setFiltroTipo('todos') }}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {clientesFiltrados.map(cliente => (
                <FilaCliente key={cliente.id} cliente={cliente} />
              ))}
            </div>
          )}
        </div>
      </div>

      {mostrarForm && (
        <FormularioCliente
          cliente={clienteEditando}
          onCerrar={() => setMostrarForm(false)}
          onGuardar={handleGuardar}
        />
      )}
    </Layout>
  )
}
