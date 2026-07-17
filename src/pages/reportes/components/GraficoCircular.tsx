import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { ResumenMetodoPago } from '@/types/reportes.types'

interface GraficoCircularProps {
  datos: ResumenMetodoPago[]
  titulo: string
}

const COLORES: Record<string, string> = {
  efectivo: '#059669',
  yape: '#7c3aed',
  transferencia: '#D4A017',
}

const METODO_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  yape: 'Yape',
  transferencia: 'Transferencia',
}

export function GraficoCircular({ datos, titulo }: GraficoCircularProps) {
  if (datos.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[300px]">
        <h3 className="text-base font-bold text-gray-900 mb-4">{titulo}</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">Sin datos disponibles</div>
      </div>
    )
  }

  const datosGrafico = datos.map(d => ({
    name: METODO_LABELS[d.metodo] || d.metodo,
    value: d.total,
    cantidad: d.cantidad,
    color: COLORES[d.metodo] || '#9ca3af',
  }))

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[300px]">
      <h3 className="text-base font-bold text-gray-900 mb-4">{titulo}</h3>
      <div className="h-64 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={datosGrafico}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {datosGrafico.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value, _name, props) => {
                const cantidad = (props?.payload as { cantidad?: number })?.cantidad || 0
                return [`S/ ${Number(value).toFixed(2)} (${cantidad} ventas)`]
              }}
            />
            <Legend formatter={(value) => <span className="text-sm text-gray-700">{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
