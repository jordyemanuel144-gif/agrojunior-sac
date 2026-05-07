import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { HeaderDetalleCompra } from './components/HeaderDetalleCompra'
import { InfoProveedorCompra } from './components/InfoProveedorCompra'
import { FilaItemCompra } from './components/FilaItemCompra'
import { ModalAnularCompra, ConfirmarAnulacion } from './components/ModalAnularCompra'
import { comprasService } from '@/services/compras.service'
import { proveedoresService } from '@/services/proveedores.service'
import type { Compra } from '@/types/compra.types'

export default function DetalleCompra() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [compra, setCompra] = useState<Compra | null>(null)
  const [cargando, setCargando] = useState(true)
  const [mostrarAnular, setMostrarAnular] = useState(false)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)

  useEffect(() => {
    if (id) {
      Promise.all([
        comprasService.obtenerPorId(id),
        proveedoresService.obtenerTodos()
      ])
        .then(([data]) => {
          setCompra(data)
        })
        .finally(() => setCargando(false))
    }
  }, [id])

  const handleAnular = async () => {
    if (!id) return
    await comprasService.anular(id)
    setMostrarAnular(false)
    setMostrarConfirmacion(true)
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!compra) {
    return (
      <div className="p-6 max-w-screen-xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Compra no encontrada</p>
        </div>
      </div>
    )
  }

  const esAnulada = compra.estado === 'anulada'

  return (
    <>
      <HeaderDetalleCompra compra={compra} />

      <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Productos ({compra.items.length})</h3>
              <div>
                {compra.items.map(item => (
                  <FilaItemCompra key={item.id} item={item} />
                ))}
              </div>
            </div>

            {compra.notas && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Notas</h3>
                <p className="text-gray-700">{compra.notas}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <InfoProveedorCompra compra={compra} />

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Resumen</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">S/ {compra.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">IGV (18%)</span>
                  <span className="text-gray-900">S/ {compra.igv.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span className="text-gray-900">Total</span>
                  <span className={esAnulada ? 'text-gray-400 line-through' : 'text-blue-600'}>
                    S/ {compra.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {compra.estado === 'completada' && (
              <button
                onClick={() => setMostrarAnular(true)}
                className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
              >
                Anular Compra
              </button>
            )}
          </div>
        </div>
      </div>

      {mostrarAnular && (
        <ModalAnularCompra
          compra={compra}
          onAnular={handleAnular}
          onCerrar={() => setMostrarAnular(false)}
        />
      )}

      {mostrarConfirmacion && (
        <ConfirmarAnulacion
          onConfirm={() => {
            setMostrarConfirmacion(false)
            navigate('/compras')
          }}
        />
      )}
    </>
  )
}
