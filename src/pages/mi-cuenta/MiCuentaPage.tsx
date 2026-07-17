import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, Receipt, FileText, CreditCard, Mail, Phone, Settings } from 'lucide-react'
import { RUTAS } from '@/config/rutas'
import { useAuthContext } from '@/context/AuthContext'
import { ventasService } from '@/services/ventas.service'
import { cuentaCorrienteService } from '@/services/cuenta-corriente.service'
import { PageHeaderCliente } from '@/components/layout/PageHeaderCliente'

interface ResumenCliente {
  totalCompras: number
  comprasPagadas: number
  comprasPendientes: number
  deudaTotal: number
}

export default function MiCuentaPage() {
  const { user, clienteData } = useAuthContext()
  const [resumen, setResumen] = useState<ResumenCliente>({
    totalCompras: 0,
    comprasPagadas: 0,
    comprasPendientes: 0,
    deudaTotal: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarResumen = async () => {
      if (!clienteData) return
      const ventas = await ventasService.obtenerPorCliente(clienteData.id)
      const cuentaCorriente = await cuentaCorrienteService.obtenerPorCliente(clienteData.id)
      const pagadas = ventas.filter(v => v.estado_pago === 'pagado').length
      const pendientes = ventas.filter(v => v.estado_pago !== 'pagado').length
      setResumen({
        totalCompras: ventas.length,
        comprasPagadas: pagadas,
        comprasPendientes: pendientes,
        deudaTotal: cuentaCorriente?.saldo_pendiente || 0,
      })
      setLoading(false)
    }
    cargarResumen()
  }, [clienteData])

  const getTipoLabel = (tipo?: string) => {
    switch (tipo) {
      case 'mayorista': return 'Mayorista'
      case 'especial': return 'Especial'
      default: return 'Minorista'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeaderCliente
        titulo="Mi Cuenta"
        icono={User}
        stats={[
          { label: 'Total', value: resumen.totalCompras, color: 'gray' },
          { label: 'Pagado', value: resumen.comprasPagadas, color: 'green' },
          { label: 'Pendiente', value: resumen.comprasPendientes, color: 'amber' },
        ]}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user?.name || 'Cliente'}</h2>
            <p className="text-sm text-primary font-medium">Cliente {getTipoLabel(clienteData?.tipo)}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Mis Datos</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          {clienteData?.email && (
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-700">{clienteData.email}</span>
            </div>
          )}
          {clienteData?.telefono && (
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-700">{clienteData.telefono}</span>
            </div>
          )}
          <Link to={RUTAS.CLIENTE.EDITAR} className="flex items-center gap-2 text-primary hover:text-primary-hover text-sm font-medium">
            <Settings size={16} />
            <span>Editar mis datos</span>
          </Link>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Accesos</h3>
        <div className="space-y-2">
          <Link to={RUTAS.CLIENTE.VENTAS} className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-gray-900">Mis Compras</span>
            </div>
            <span className="text-gray-400">→</span>
          </Link>
          <Link to={RUTAS.CLIENTE.COMPROBANTES} className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-gray-900">Mis Comprobantes</span>
            </div>
            <span className="text-gray-400">→</span>
          </Link>
          <Link to={RUTAS.CLIENTE.DEUDAS} className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-gray-900">Mis Deudas</span>
            </div>
            <span className="text-gray-400">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}