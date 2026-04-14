// TotalesCard - Card de totales en ConfirmarPedido
import type { Cliente } from '@/types/cliente.types'

interface Props {
  subtotal: number
  descuento: number
  igv: number
  total: number
  cliente: Cliente
  igvActivo: boolean
}

export function TotalesCard({ subtotal, descuento, igv, total, cliente, igvActivo }: Props) {
  const pctDescuento = cliente.tipo !== 'minorista' ? (cliente.tipo === 'mayorista' ? 10 : 5) : 0
  const tipoLabel = { minorista: 'Minorista', mayorista: 'Mayorista', especial: 'Especial' }
  
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-2">
      <div className="flex justify-between text-sm text-gray-500">
        <span>Subtotal</span>
        <span className="font-medium text-gray-900">S/ {subtotal.toFixed(2)}</span>
      </div>
      {pctDescuento > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Descuento {tipoLabel[cliente.tipo]}</span>
          <span>-S/ {descuento.toFixed(2)}</span>
        </div>
      )}
      {igvActivo && (
        <div className="flex justify-between text-sm text-gray-500">
          <span>IGV (18%)</span>
          <span>S/ {igv.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between pt-2 border-t border-gray-100">
        <span className="font-bold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-blue-600">S/ {total.toFixed(2)}</span>
      </div>
    </div>
  )
}