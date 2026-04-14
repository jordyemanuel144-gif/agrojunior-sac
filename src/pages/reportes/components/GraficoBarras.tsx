import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { DatoGrafico } from '@/types/reportes.types'

interface GraficoBarrasProps {
  datos: DatoGrafico[]
  titulo: string
  color?: string
}

const COLORES = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#c026d3', '#4f46e5', '#65a30d', '#ea580c']

export function GraficoBarras({ datos, titulo, color = '#2563eb' }: GraficoBarrasProps) {
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
          <BarChart data={datos} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} width={75} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value) => [Number(value).toLocaleString(), 'Cantidad']}
            />
            <Bar dataKey="valor" fill={color} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function GraficoBarrasColores({ datos, titulo }: { datos: DatoGrafico[]; titulo: string }) {
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
          <BarChart data={datos} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="nombre" tick={{ fontSize: 10 }} stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value) => [`S/ ${Number(value).toFixed(2)}`, 'Ingresos']}
            />
            <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
              {datos.map((_, index) => (
                <Bar key={index} dataKey="valor" fill={COLORES[index % COLORES.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
