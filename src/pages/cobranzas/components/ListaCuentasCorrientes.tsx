import { useState, useEffect } from 'react'
import { ChevronRight, CreditCard, Wallet, MessageCircle, Download, FileTextIcon, ImageIcon, File } from 'lucide-react'
import type { CuentaCorriente } from '@/types/cuenta-corriente.types'
import { formatMoneda, formatFecha } from '@/lib/utils'
import { DropdownMenu } from '@/components/ui/DropdownMenu'

interface ListaCuentasCorrientesProps {
  cuentas: CuentaCorriente[]
  cargando: boolean
  onPagar: (clienteId: string) => void
  onVerDetalle: (clienteId: string) => void
  onWhatsApp: (clienteId: string) => void
  onDescargar: (cuenta: CuentaCorriente, tipo: 'texto' | 'imagen' | 'pdf') => void
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

function FilaCuenta(props: {
  cuenta: CuentaCorriente
  onPagar: (clienteId: string) => void
  onVerDetalle: (clienteId: string) => void
  onWhatsApp: (clienteId: string) => void
  onDescargar: (cuenta: CuentaCorriente, tipo: 'texto' | 'imagen' | 'pdf') => void
  actualizada: boolean
}) {
  const { cuenta, onPagar, onVerDetalle, onWhatsApp, onDescargar, actualizada } = props
  const [animate, setAnimar] = useState(false)

  useEffect(() => {
    if (actualizada) {
      setAnimar(true)
      const timer = setTimeout(() => setAnimar(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [actualizada])

  const handleFilaClick = () => {
    onVerDetalle(cuenta.cliente_id)
  }

  return (
    <div
      className={`grid md:grid-cols-5 gap-3 md:gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors cursor-pointer ${
        animate ? 'bg-gray-100 animate-pulse' : ''}`}
      onClick={handleFilaClick}
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

      <div className="md:col-span-1 flex items-center gap-1.5 justify-end" onClick={e => e.stopPropagation()}>
        {cuenta.saldo_pendiente > 0 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPagar(cuenta.cliente_id) }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pagar</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onWhatsApp(cuenta.cliente_id) }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <DropdownMenu
              align="right"
              trigger={
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors cursor-pointer">
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Descargar</span>
                </span>
              }
              options={[
                { 
                  label: 'Texto (.txt)', 
                  icon: <FileTextIcon className="w-4 h-4" />,
                  onClick: () => onDescargar(cuenta, 'texto') 
                },
                { 
                  label: 'Imagen (.png)', 
                  icon: <ImageIcon className="w-4 h-4" />,
                  onClick: () => onDescargar(cuenta, 'imagen') 
                },
                { 
                  label: 'PDF (.pdf)', 
                  icon: <File className="w-4 h-4" />,
                  onClick: () => onDescargar(cuenta, 'pdf') 
                },
              ]}
            />
          </>
        )}
        <button
          onClick={() => onVerDetalle(cuenta.cliente_id)}
          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          title="Ver detalle"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  )
}

export function ListaCuentasCorrientes({ cuentas, cargando, onPagar, onVerDetalle, onWhatsApp, onDescargar, cuentaActualizada }: ListaCuentasCorrientesProps) {
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible">
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
            onWhatsApp={onWhatsApp}
            onDescargar={onDescargar}
            actualizada={cuentaActualizada === cuenta.cliente_id}
          />
        ))}
      </div>
    </div>
  )
}