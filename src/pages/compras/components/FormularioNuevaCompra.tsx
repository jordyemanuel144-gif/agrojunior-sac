// FormularioNuevaCompra - Flujo de 3 pasos para registrar una compra
// Paso 1: Proveedor, Paso 2: Productos, Paso 3: Confirmar
import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCompra } from '../hooks/useCompra'
import { IndicadorProgreso } from './IndicadorProgreso'
import { PasoProveedor } from './PasoProveedor'
import { PasoProductos } from './PasoProductos'
import { PasoConfirmar } from './PasoConfirmar'
import { productosService } from '@/services/productos.service'
import { proveedoresService } from '@/services/proveedores.service'
import type { Producto } from '@/types/producto.types'
import type { Proveedor } from '@/types/proveedor.types'

interface Props {
  onCerrar: () => void
  onGuardar: () => void
}

export function FormularioNuevaCompra({ onCerrar, onGuardar }: Props) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [proveedor, setProveedor] = useState<Proveedor | null>(null)
  const [guardando, setGuardando] = useState(false)

  const {
    paso,
    proveedorId,
    setProveedorId,
    fecha,
    setFecha,
    notas,
    setNotas,
    items,
    productosSeleccionados,
    puedeAvanzarPaso1,
    puedeAvanzarPaso2,
    totalCompra,
    irASiguiente,
    irAAnterior,
    actualizarItem,
  } = useCompra(productos)

  useEffect(() => {
    productosService.obtenerTodos().then(setProductos)
  }, [])

  useEffect(() => {
    if (proveedorId) {
      proveedoresService.obtenerPorId(proveedorId).then(setProveedor)
    } else {
      setProveedor(null)
    }
  }, [proveedorId])

  const handleConfirmar = async () => {
    setGuardando(true)
    try {
      const { comprasService } = await import('@/services/compras.service')
      await comprasService.crear(
        {
          proveedor_id: proveedorId!,
          usuario_id: 'user1',
          notas,
        },
        productosSeleccionados.map(item => ({
          producto_id: item.producto.id,
          cantidad: item.cantidad,
          precio_unitario: item.precioUnitario,
        }))
      )
      onGuardar()
      onCerrar()
    } finally {
      setGuardando(false)
    }
  }

  const puedeIrAtras = paso > 1
  const puedeIrAdelante = paso === 1 ? puedeAvanzarPaso1 : puedeAvanzarPaso2
  const esPasoFinal = paso === 3

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Nueva Compra</h2>
          <button onClick={onCerrar} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <IndicadorProgreso pasoActual={paso} />

        <div className="flex-1 overflow-y-auto">
          {paso === 1 && (
            <PasoProveedor
              proveedorId={proveedorId}
              onProveedorChange={setProveedorId}
              fecha={fecha}
              onFechaChange={setFecha}
              notas={notas}
              onNotasChange={setNotas}
            />
          )}
          {paso === 2 && (
            <PasoProductos
              productos={productos}
              items={items}
              onActualizarItem={actualizarItem}
              puedeAvanzar={puedeAvanzarPaso2}
              totalCompra={totalCompra}
            />
          )}
          {paso === 3 && (
            <PasoConfirmar
              proveedor={proveedor}
              fecha={fecha}
              notas={notas}
              productosSeleccionados={productosSeleccionados}
              totalCompra={totalCompra}
              guardando={guardando}
              onConfirmar={handleConfirmar}
            />
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex gap-3">
          <button
            onClick={puedeIrAtras ? irAAnterior : onCerrar}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={18} />
            {puedeIrAtras ? 'Anterior' : 'Cancelar'}
          </button>
          {!esPasoFinal && (
            <button
              onClick={irASiguiente}
              disabled={!puedeIrAdelante}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
