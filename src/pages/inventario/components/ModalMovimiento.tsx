// ModalMovimiento - Modal para registrar ajustes de inventario
import { useState } from 'react'
import { X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { inventarioService } from '@/services/inventario.service'
import { useAuth } from '@/hooks/useAuth'
import type { ItemStock, TipoMovimiento, MotivoMovimiento } from '@/types/inventario.types'

interface Props {
  producto: ItemStock
  onCerrar: () => void
  onRegistrado: () => void
}

export function ModalMovimiento({ producto, onCerrar, onRegistrado }: Props) {
  const { user } = useAuth()
  const [tipo, setTipo] = useState<TipoMovimiento>('entrada')
  const [cantidad, setCantidad] = useState('')
  const [motivo, setMotivo] = useState<MotivoMovimiento>('ajuste')
  const [notas, setNotas] = useState('')
  const [guardando, setGuardando] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cantidad || parseFloat(cantidad) <= 0) return

    setGuardando(true)
    try {
      await inventarioService.registrarMovimiento({
        producto_id: producto.id,
        producto_nombre: producto.nombre,
        tipo,
        cantidad: parseFloat(cantidad),
        motivo,
        notas: notas || undefined,
        fecha: new Date(),
        usuario_id: user?.id ?? 'user-1',
      })
      onRegistrado()
    } finally {
      setGuardando(false)
    }
  }

  const motivosPorTipo: Record<TipoMovimiento, MotivoMovimiento[]> = {
    entrada: ['ajuste', 'correccion'],
    salida: ['ajuste', 'regalo', 'correccion'],
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCerrar} />
      <div className="relative bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-2xl p-4 md:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Registrar Movimiento</h2>
          <button onClick={onCerrar} className="p-2 hover:bg-gray-100 rounded-xl">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-500">Producto</p>
          <p className="font-medium text-gray-900">{producto.nombre}</p>
          <p className="text-sm text-gray-500">
            Stock actual: {producto.stock_actual.toFixed(producto.tipo_medida === 'kg' ? 1 : 0)} {producto.tipo_medida}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Tipo de Movimiento
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setTipo('entrada'); setMotivo('ajuste') }}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-colors ${
                  tipo === 'entrada'
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ArrowUpCircle size={18} />
                Entrada
              </button>
              <button
                type="button"
                onClick={() => { setTipo('salida'); setMotivo('merma') }}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-colors ${
                  tipo === 'salida'
                    ? 'bg-red-100 text-red-700 border-2 border-red-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ArrowDownCircle size={18} />
                Salida
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Cantidad ({producto.tipo_medida})
            </label>
            <input
              type="number"
              step={producto.tipo_medida === 'kg' ? '0.1' : '1'}
              min="0"
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              className="w-full text-base font-medium text-gray-900 outline-none bg-transparent border-b-2 border-gray-200 focus:border-blue-500 py-2"
              placeholder="0.0"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Motivo
            </label>
            <select
              value={motivo}
              onChange={e => setMotivo(e.target.value as MotivoMovimiento)}
              className="w-full text-base font-medium text-gray-900 outline-none bg-transparent border-b-2 border-gray-200 focus:border-blue-500 py-2"
            >
              {motivosPorTipo[tipo].map(m => (
                <option key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              className="w-full text-base font-medium text-gray-900 outline-none bg-transparent border-b-2 border-gray-200 focus:border-blue-500 py-2 resize-none"
              rows={2}
              placeholder="Agregar una nota..."
            />
          </div>

          <button
            type="submit"
            disabled={guardando || !cantidad || parseFloat(cantidad) <= 0}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {guardando ? 'Guardando...' : 'Registrar Movimiento'}
          </button>
        </form>
      </div>
    </div>
  )
}
