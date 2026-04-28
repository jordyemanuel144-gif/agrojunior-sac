import { DollarSign, CreditCard, TrendingUp, Receipt, Tag } from 'lucide-react'
import type { CuentaCorriente } from '@/types/cuenta-corriente.types'
import { formatMoneda } from '@/lib/utils'

interface ResumenCuentaProps {
  cuenta: CuentaCorriente
}

export function ResumenCuenta({ cuenta }: ResumenCuentaProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Tag size={16} className="text-blue-600" />
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total S/Desc.</span>
        </div>
        <p className="text-xl font-bold text-gray-900">{formatMoneda(cuenta.total_ventas_sin_descuento || 0)}</p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <DollarSign size={16} className="text-blue-600" />
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Deuda</span>
        </div>
        <p className="text-xl font-bold text-gray-900">{formatMoneda(cuenta.total_deuda)}</p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-green-600" />
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Pagado</span>
        </div>
        <p className="text-xl font-bold text-green-600">{formatMoneda(cuenta.total_pagado)}</p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <CreditCard size={16} className="text-red-600" />
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Saldo Pendiente</span>
        </div>
        <p className="text-xl font-bold text-red-600">{formatMoneda(cuenta.saldo_pendiente)}</p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Receipt size={16} className="text-yellow-600" />
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ventas Pend.</span>
        </div>
        <p className="text-xl font-bold text-gray-900">{cuenta.cantidad_ventas_pendientes}</p>
      </div>
    </div>
  )
}