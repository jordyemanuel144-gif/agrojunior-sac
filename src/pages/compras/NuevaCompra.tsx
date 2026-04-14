import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { FormularioNuevaCompra } from './components/FormularioNuevaCompra'
import { RUTAS } from '@/config/rutas'

export default function NuevaCompra() {
  const navigate = useNavigate()

  const handleGuardar = () => {
    navigate(RUTAS.ADMIN.COMPRAS)
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(RUTAS.ADMIN.COMPRAS)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft size={20} />
        <span>Volver a compras</span>
      </button>

      <FormularioNuevaCompra
        onCerrar={() => navigate(RUTAS.ADMIN.COMPRAS)}
        onGuardar={handleGuardar}
      />
    </div>
  )
}
