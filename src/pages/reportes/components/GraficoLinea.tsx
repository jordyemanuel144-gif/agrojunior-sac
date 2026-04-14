import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { DatoGrafico } from '@/types/reportes.types'

interface GraficoLineaProps {
  datos: DatoGrafico[]
  titulo: string
}

export function GraficoLinea({ datos, titulo }: GraficoLineaProps) {
  if (datos.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[300px]">
        <h3 className="text-base font-bold text-gray-900 mb-4">{titulo}</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">Sin datos disponibles</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[300px]">
      <h3 className="text-base font-bold text-gray-900 mb-4">{titulo}</h3>
      <div className="h-64 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datos} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="nombre" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value) => [`S/ ${Number(value).toFixed(2)}`, 'Ingresos']}
            />
            <Line type="monotone" dataKey="valor" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
