// ============================================================
// FormularioProducto - Modal para crear/editar un producto
// ============================================================
import { useState, useEffect } from 'react'
import { X, Calculator } from 'lucide-react'
import type { Producto, NuevoProducto, TipoMedida } from '@/types/producto.types'
import { productosService } from '@/services/productos.service'
import { DESCUENTO_MAYORISTA, DESCUENTO_ESPECIAL } from '@/config/constantes'

interface Props {
  producto?: Producto | null
  onCerrar: () => void
  onGuardar: (datos: NuevoProducto) => Promise<void>
}

export function FormularioProducto({ producto, onCerrar, onGuardar }: Props) {
  const [form, setForm] = useState<NuevoProducto>({
    codigo: '',
    nombre: '',
    categoria_id: 'pollo',
    tipo_medida: 'kg',
    precio_costo: 0,
    precio_minorista: 0,
    precio_mayorista: 0,
    precio_especial: 0,
    stock_actual: 0,
    stock_minimo: 0,
    activo: true,
    imagen_url: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [categorias, setCategorias] = useState<{id: string, nombre: string}[]>([])

  useEffect(() => {
    productosService.obtenerCategorias().then(setCategorias)
  }, [])

  useEffect(() => {
    if (producto) {
      setForm({
        codigo: producto.codigo,
        nombre: producto.nombre,
        categoria_id: producto.categoria_id,
        tipo_medida: producto.tipo_medida,
        precio_costo: producto.precio_costo,
        precio_minorista: producto.precio_minorista,
        precio_mayorista: producto.precio_mayorista,
        precio_especial: producto.precio_especial,
        stock_actual: producto.stock_actual,
        stock_minimo: producto.stock_minimo,
        activo: producto.activo,
        imagen_url: producto.imagen_url ?? '',
        tag: producto.tag ?? null,
        destacado: producto.destacado ?? false,
      })
    }
  }, [producto])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.codigo.trim()) return

    setGuardando(true)
    try {
      await onGuardar(form)
      onCerrar()
    } finally {
      setGuardando(false)
    }
  }

  const actualizarCampo = (campo: keyof NuevoProducto, valor: string | number | boolean | null) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">
            {producto ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onCerrar} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Código y Nombre */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
              <input
                type="text"
                value={form.codigo}
                onChange={e => actualizarCampo('codigo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="P001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={e => actualizarCampo('nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Pollo Entero"
                required
              />
            </div>
          </div>

          {/* Categoría y Tipo de medida */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select
                value={form.categoria_id}
                onChange={e => actualizarCampo('categoria_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de medida *</label>
              <select
                value={form.tipo_medida}
                onChange={e => actualizarCampo('tipo_medida', e.target.value as TipoMedida)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="kg">Kilogramo (kg)</option>
                <option value="unidad">Unidad</option>
              </select>
            </div>
          </div>

          {/* Precios - Solo precio base, los demás se calculan automáticamente */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calculator size={16} />
              <span>Los precios para Mayorista y Especial se calculan automáticamente</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Minorista *</label>
                <input
                  type="number"
                  value={form.precio_minorista}
                  onChange={e => actualizarCampo('precio_minorista', Number(e.target.value))}
                  step="0.01"
                  min={0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mayorista (-{DESCUENTO_MAYORISTA}%)</label>
                <div className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-green-700 font-medium">
                  S/ {((form.precio_minorista || 0) * (1 - DESCUENTO_MAYORISTA / 100)).toFixed(2)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especial (-{DESCUENTO_ESPECIAL}%)</label>
                <div className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-purple-700 font-medium">
                  S/ {((form.precio_minorista || 0) * (1 - DESCUENTO_ESPECIAL / 100)).toFixed(2)}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio costo (opcional)</label>
              <input
                type="number"
                value={form.precio_costo}
                onChange={e => actualizarCampo('precio_costo', Number(e.target.value))}
                step="0.01"
                min={0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock actual</label>
              <input
                type="number"
                value={form.stock_actual}
                onChange={e => actualizarCampo('stock_actual', Number(e.target.value))}
                step={form.tipo_medida === 'kg' ? '0.1' : '1'}
                min={0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
              <input
                type="number"
                value={form.stock_minimo}
                onChange={e => actualizarCampo('stock_minimo', Number(e.target.value))}
                step={form.tipo_medida === 'kg' ? '0.1' : '1'}
                min={0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* URL de imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de imagen</label>
            <input
              type="url"
              value={form.imagen_url}
              onChange={e => actualizarCampo('imagen_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://..."
            />
          </div>

          {/* Etiqueta y Destacado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta</label>
              <select
                value={form.tag ?? ''}
                onChange={e => actualizarCampo('tag', e.target.value === '' ? null : e.target.value as 'oferta' | 'nuevo')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Ninguna</option>
                <option value="oferta">Oferta</option>
                <option value="nuevo">Nuevo</option>
              </select>
            </div>
            <div className="flex items-center justify-start md:justify-center pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.destacado}
                  onChange={e => actualizarCampo('destacado', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-gray-700">Producto destacado</span>
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
