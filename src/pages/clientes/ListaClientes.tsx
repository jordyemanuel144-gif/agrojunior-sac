import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { FiltrosClientes } from './components/FiltrosClientes'
import { FilaCliente } from './components/FilaCliente'
import { FormularioCliente } from './components/FormularioCliente'
import { clientesService } from '@/services/clientes.service'
import type { Cliente, NuevoCliente } from '@/types/cliente.types'

type FiltroTipo = 'todos' | 'minorista' | 'mayorista' | 'especial' | 'pendientes'

export default function ListaClientes() {
  const [searchParams] = useSearchParams()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [verEliminados, setVerEliminados] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>(() => {
    const filtro = searchParams.get('filtro')
    if (filtro === 'pendientes') return 'pendientes'
    if (filtro === 'minorista') return 'minorista'
    if (filtro === 'mayorista') return 'mayorista'
    if (filtro === 'especial') return 'especial'
    return 'todos'
  })

  useEffect(() => {
    const init = async () => {
      try {
        setCargando(true)
        const data = await clientesService.obtenerTodos()
        setClientes(data)
      } catch (error) {
        console.error('Error al cargar clientes:', error)
      } finally {
        setCargando(false)
      }
    }
    init()
  }, [])

  const clientesFiltrados = useMemo(() => {
    return clientes.filter(c => {
      const matchActivo = verEliminados || c.activo

      const matchBusqueda =
        busqueda === '' ||
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.dni_ruc?.toLowerCase().includes(busqueda.toLowerCase()) ?? false) ||
        (c.telefono?.toLowerCase().includes(busqueda.toLowerCase()) ?? false)

      const matchTipo =
        filtroTipo === 'todos' || 
        (filtroTipo === 'pendientes' && c.pendiente_aprobacion) ||
        c.tipo === filtroTipo

      return matchActivo && matchBusqueda && matchTipo
    })
  }, [clientes, busqueda, filtroTipo, verEliminados])

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

  const minoristas = clientes.filter(c => c.tipo === 'minorista').length
  const mayoristas = clientes.filter(c => c.tipo === 'mayorista').length
  const especiales = clientes.filter(c => c.tipo === 'especial').length
  const pendientes = clientes.filter(c => c.pendiente_aprobacion).length

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <div className="p-4 md:p-6">
        <PageHeader
          titulo="Clientes"
          icono={Users}
          stats={[
            { label: 'Total', value: clientes.length, color: 'gray' },
            { label: 'Pendientes', value: pendientes, color: pendientes > 0 ? 'amber' : 'gray' },
            { label: 'Minoristas', value: minoristas, color: 'blue' },
            { label: 'Mayoristas', value: mayoristas, color: 'green' },
            { label: 'Especiales', value: especiales, color: 'purple' },
          ]}
        />

        <div className="max-w-screen-xl mx-auto">
          <button
            onClick={handleCrear}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-primary text-neutral-900 rounded-xl hover:bg-primary-hover transition-colors mb-4"
          >
            <Plus size={20} />
            <span className="font-medium">Nuevo Cliente</span>
          </button>

          <FiltrosClientes
            busqueda={busqueda}
            filtroTipo={filtroTipo}
            verEliminados={verEliminados}
            onBusquedaChange={setBusqueda}
            onTipoChange={setFiltroTipo}
            onVerEliminadosChange={setVerEliminados}
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
                  className="mt-4 text-primary hover:underline"
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
    </>
  )
}
