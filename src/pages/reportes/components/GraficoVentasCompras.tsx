import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { DatoGraficoDual } from '@/types/reportes.types'
import { formatMoneda } from '@/lib/utils'

interface GraficoVentasComprasProps {
  datos: DatoGraficoDual[]
  titulo: string
}

export function GraficoVentasCompras({ datos, titulo }: GraficoVentasComprasProps) {
  if (datos.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[300px]">
        <h3 className="text-base font-bold text-gray-900 mb-4">{titulo}</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">Sin datos disponibles</div>
      </div>
    )
  }

  const formattedData = datos.map(d => ({
    nombre: d.nombre,
    Ventas: d.ventas,
    Compras: d.compras,
  }))

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[300px]">
      <h3 className="text-base font-bold text-gray-900 mb-4">{titulo}</h3>
      <div className="h-72 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="nombre" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis 
              tick={{ fontSize: 11 }} 
              stroke="#9ca3af"
              tickFormatter={(value) => `S/${value}`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value) => [formatMoneda(Number(value)), '']}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              formatter={(value) => <span className="text-gray-700">{value}</span>}
            />
            <Bar dataKey="Ventas" fill="#22c55e" radius={[4, 4, 0, 0]} name="Ventas" />
            <Bar dataKey="Compras" fill="#ef4444" radius={[4, 4, 0, 0]} name="Compras" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
