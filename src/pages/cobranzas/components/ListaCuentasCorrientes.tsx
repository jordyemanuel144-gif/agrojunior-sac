import { useState, useEffect } from 'react'
import { ChevronRight, CreditCard, Wallet } from 'lucide-react'
import type { CuentaCorriente } from '@/types/cuenta-corriente.types'
import { formatMoneda, formatFecha } from '@/lib/utils'

interface ListaCuentasCorrientesProps {
  cuentas: CuentaCorriente[]
  cargando: boolean
  onPagar: (clienteId: string) => void
  onVerDetalle: (clienteId: string) => void
  cuentaActualizada?: string | null
}

function TipoBadge({ tipo }: { tipo: CuentaCorriente['cliente_tipo'] }) {
  const styles = {
    mayorista: 'bg-green-100 text-green-700',
    especial: 'bg-purple-100 text-purple-700',
    minorista: 'bg-gray-100 text-gray-600',
  }
  const labels = {
    mayorista: 'Mayorista',
    especial: 'Especial',
    minorista: 'Minorista',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[tipo]}`}>
      {labels[tipo]}
    </span>
  )
}

function EstadoBadge({ saldo }: { saldo: number }) {
  if (saldo === 0) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        Al día
      </span>
    )
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
      Pendiente
    </span>
  )
}

function FilaCuenta({ 
  cuenta, 
  onPagar, 
  onVerDetalle, 
  actualizada 
}: { 
  cuenta: CuentaCorriente
  onPagar: (clienteId: string) => void
  onVerDetalle: (clienteId: string) => void
  actualizada: boolean
}) {
  const [animar, setAnimar] = useState(false)

  useEffect(() => {
    if (actualizada) {
      setAnimar(true)
      const timer = setTimeout(() => setAnimar(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [actualizada])

  return (
    <div
      className={`grid md:grid-cols-5 gap-3 md:gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors ${
        animar ? 'bg-gray-100 animate-pulse' : ''
      }`}
    >
      <div className="md:col-span-1">
        <p className="font-medium text-gray-900 truncate">{cuenta.cliente_nombre}</p>
        <p className="text-xs text-gray-400">{cuenta.cliente_telefono || 'Sin teléfono'}</p>
      </div>

      <div className="md:col-span-1">
        <TipoBadge tipo={cuenta.cliente_tipo} />
      </div>

      <div className="md:col-span-1">
        <p className="text-sm text-gray-700">{cuenta.cantidad_ventas_pendientes} pendiente(s)</p>
        {cuenta.ultima_venta_fecha && (
          <p className="text-xs text-gray-400">
            Última: {formatFecha(cuenta.ultima_venta_fecha)}
          </p>
        )}
      </div>

      <div className="md:col-span-1">
        <p className="font-bold text-blue-600">{formatMoneda(cuenta.saldo_pendiente)}</p>
        {cuenta.saldo_pendiente > 0 && (
          <EstadoBadge saldo={cuenta.saldo_pendiente} />
        )}
      </div>

      <div className="md:col-span-1 flex items-center gap-2 justify-end">
        <button
          onClick={() => onPagar(cuenta.cliente_id)}
          className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
        >
          <Wallet className="w-4 h-4" />
          <span className="hidden sm:inline">Pagar</span>
        </button>
        <button
          onClick={() => onVerDetalle(cuenta.cliente_id)}
          className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  )
}

export function ListaCuentasCorrientes({ cuentas, cargando, onPagar, onVerDetalle, cuentaActualizada }: ListaCuentasCorrientesProps) {
  if (cargando) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (cuentas.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="text-center py-8">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No hay cuentas por cobrar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="hidden md:grid md:grid-cols-5 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <span>Cliente</span>
        <span>Tipo</span>
        <span>Ventas</span>
        <span>Saldo</span>
        <span></span>
      </div>

      <div className="divide-y divide-gray-100">
        {cuentas.map(cuenta => (
          <FilaCuenta
            key={cuenta.cliente_id}
            cuenta={cuenta}
            onPagar={onPagar}
            onVerDetalle={onVerDetalle}
            actualizada={cuentaActualizada === cuenta.cliente_id}
          />
        ))}
      </div>
    </div>
  )
}
