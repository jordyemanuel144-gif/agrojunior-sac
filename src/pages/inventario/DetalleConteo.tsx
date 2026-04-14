// DetalleConteo - Vista para ver y editar un conteo de inventario en estado borrador
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, CheckCircle } from 'lucide-react'
import { inventarioService } from '@/services/inventario.service'
import { useAuth } from '@/hooks/useAuth'
import { formatFecha } from '@/lib/utils'
import { Cargando } from '@/components/ui/Cargando'
import { EstadoVacio } from '@/components/ui/EstadoVacio'
import type { ConteoInventario } from '@/types/inventario.types'

export default function DetalleConteo() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [conteo, setConteo] = useState<ConteoInventario | null>(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [stockEditando, setStockEditando] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!id) {
      navigate('/admin/inventario/conteo')
      return
    }
    inventarioService.obtenerConteoPorId(id).then(data => {
      setConteo(data)
      setCargando(false)
    })
  }, [id, navigate])

  const handleActualizarItem = (productoId: string, valor: string) => {
    setStockEditando(prev => ({ ...prev, [productoId]: valor }))
  }

  const handleGuardarItem = async (productoId: string) => {
    const valor = stockEditando[productoId]
    if (!valor || !conteo) return

    const stockFisico = parseFloat(valor)
    if (isNaN(stockFisico)) return

    setGuardando(true)
    try {
      const actualizado = await inventarioService.actualizarItemConteo(conteo.id, productoId, stockFisico)
      setConteo(actualizado)
      setStockEditando(prev => {
        const nuevo = { ...prev }
        delete nuevo[productoId]
        return nuevo
      })
    } finally {
      setGuardando(false)
    }
  }

  const handleCompletarConteo = async () => {
    if (!conteo) return
    
    const usuarioId = user?.id ?? 'usr_default'
    
    setGuardando(true)
    try {
      const resultado = await inventarioService.completarConteo(conteo.id, usuarioId)
      setConteo(resultado)
    } catch (error) {
      console.error('Error al completar conteo:', error)
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) return <Cargando />

  if (!conteo) {
    return <EstadoVacio titulo="Conteo no encontrado" mensaje="El conteo que buscas no existe" />
  }

  const esEditable = conteo.estado === 'borrador'
  const itemsConDiferencia = conteo.items.filter(i => i.diferencia !== 0)
  const totalEntradas = itemsConDiferencia.filter(i => i.diferencia > 0).reduce((acc, i) => acc + i.diferencia, 0)
  const totalSalidas = itemsConDiferencia.filter(i => i.diferencia < 0).reduce((acc, i) => acc + Math.abs(i.diferencia), 0)

return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/inventario/conteo')}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Conteo {conteo.numero}</h1>
          <p className="text-sm text-gray-500">
            {formatFecha(conteo.fecha)} • {conteo.usuario_nombre || 'Usuario'}
          </p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
          conteo.estado === 'borrador' ? 'bg-amber-100 text-amber-800' :
          conteo.estado === 'completado' ? 'bg-emerald-100 text-emerald-800' :
          'bg-red-100 text-red-800'
        }`}>
          {conteo.estado.charAt(0).toUpperCase() + conteo.estado.slice(1)}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase">
          <div className="col-span-4">Producto</div>
          <div className="col-span-2 text-center">Sistema</div>
          <div className="col-span-2 text-center">Físico</div>
          <div className="col-span-2 text-center">Diferencia</div>
          <div className="col-span-2"></div>
        </div>

        {conteo.items.map(item => {
          const editando = stockEditando[item.producto_id] !== undefined
          const diffColor = item.diferencia === 0 
            ? 'bg-green-50 text-green-600' 
            : item.diferencia > 0 
              ? 'bg-blue-50 text-blue-600' 
              : 'bg-red-50 text-red-600'
          
          return (
            <div key={item.producto_id} className="grid grid-cols-12 gap-2 p-3 border-b border-gray-100 items-center">
              <div className="col-span-4 min-w-0">
                <p className="font-medium text-gray-900 truncate text-sm">{item.producto_nombre}</p>
              </div>
              <div className="col-span-2 text-center text-gray-500 text-sm">
                {item.stock_sistema.toFixed(1)}
              </div>
              <div className="col-span-2 text-center">
                {esEditable ? (
                  editando ? (
                    <div className="flex gap-1 items-center justify-center">
                      <input
                        type="number"
                        step="0.1"
                        value={stockEditando[item.producto_id]}
                        onChange={e => handleActualizarItem(item.producto_id, e.target.value)}
                        className="w-16 px-2 py-1.5 text-center border border-gray-300 rounded-lg text-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => handleGuardarItem(item.producto_id)}
                        disabled={guardando}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <CheckCircle size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleActualizarItem(item.producto_id, item.stock_fisico.toString())}
                      className="px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      {item.stock_fisico.toFixed(1)}
                    </button>
                  )
                ) : (
                  <span className="font-medium text-gray-900 text-sm">{item.stock_fisico.toFixed(1)}</span>
                )}
              </div>
              <div className={`col-span-2 text-center text-sm font-bold rounded-lg py-1 ${diffColor}`}>
                {item.diferencia === 0 ? '—' : `${item.diferencia > 0 ? '+' : ''}${item.diferencia.toFixed(1)}`}
              </div>
              <div className="col-span-2 text-right">
                {esEditable && !editando && (
                  <button
                    onClick={() => handleActualizarItem(item.producto_id, item.stock_fisico.toString())}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <Save size={14} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {conteo.estado === 'borrador' && (
        <div className="mt-4 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="text-sm text-amber-800">
            <p className="font-medium">Conteo en progreso</p>
            <p>Entradas: {totalEntradas.toFixed(1)} • Salidas: {totalSalidas.toFixed(1)}</p>
          </div>
          <button
            onClick={handleCompletarConteo}
            disabled={guardando}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            <CheckCircle size={18} />
            Completar Conteo
          </button>
        </div>
      )}

      {conteo.estado === 'completado' && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-sm text-blue-600">Entradas</p>
            <p className="text-2xl font-bold text-blue-700">+{totalEntradas.toFixed(1)}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-sm text-red-600">Salidas</p>
            <p className="text-2xl font-bold text-red-700">-{totalSalidas.toFixed(1)}</p>
          </div>
        </div>
      )}
    </div>
  )
}