import { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { HeaderProveedores } from './components/HeaderProveedores'
import { FiltrosProveedores } from './components/FiltrosProveedores'
import { FilaProveedor } from './components/FilaProveedor'
import { FormularioProveedor } from './components/FormularioProveedor'
import { proveedoresService } from '@/services/proveedores.service'
import type { Proveedor, NuevoProveedor } from '@/types/proveedor.types'

export default function ListaProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [proveedorEditando, setProveedorEditando] = useState<Proveedor | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos')

  useEffect(() => {
    const init = async () => {
      const data = await proveedoresService.obtenerTodos()
      setProveedores(data)
      setCargando(false)
    }
    init()
  }, [])

  const proveedoresFiltrados = useMemo(() => {
    return proveedores.filter(p => {
      const matchBusqueda =
        busqueda === '' ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.ruc.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.email?.toLowerCase().includes(busqueda.toLowerCase()) ?? false)

      const matchEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'activo' && p.activo) ||
        (filtroEstado === 'inactivo' && !p.activo)

      return matchBusqueda && matchEstado
    })
  }, [proveedores, busqueda, filtroEstado])

  const handleCrear = () => {
    setProveedorEditando(null)
    setMostrarForm(true)
  }

  const handleGuardar = async (datos: NuevoProveedor) => {
    if (proveedorEditando) {
      await proveedoresService.actualizar(proveedorEditando.id, datos)
    } else {
      await proveedoresService.crear(datos)
    }
    const data = await proveedoresService.obtenerTodos()
    setProveedores(data)
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
        <HeaderProveedores proveedores={proveedores} />

        <div className="max-w-screen-xl mx-auto">
          <button
            onClick={handleCrear}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors mb-4"
          >
            <Plus size={20} />
            <span className="font-medium">Nuevo Proveedor</span>
          </button>

          <FiltrosProveedores
            busqueda={busqueda}
            filtroEstado={filtroEstado}
            onBusquedaChange={setBusqueda}
            onEstadoChange={setFiltroEstado}
          />

          {proveedoresFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500">
                {busqueda || filtroEstado !== 'todos'
                  ? 'No se encontraron proveedores con los filtros aplicados'
                  : 'No hay proveedores registrados'}
              </p>
              {(busqueda || filtroEstado !== 'todos') && (
                <button
                  onClick={() => { setBusqueda(''); setFiltroEstado('todos') }}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {proveedoresFiltrados.map(proveedor => (
                <FilaProveedor key={proveedor.id} proveedor={proveedor} />
              ))}
            </div>
          )}
        </div>
      </div>

      {mostrarForm && (
        <FormularioProveedor
          proveedor={proveedorEditando}
          onCerrar={() => setMostrarForm(false)}
          onGuardar={handleGuardar}
        />
      )}
    </Layout>
  )
}
