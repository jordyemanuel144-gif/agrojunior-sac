// MontoParcialInput - Input para monto parcial compacto

interface Props {
  montoRecibido: string
  setMontoRecibido: (valor: string) => void
  total: number
  cambio: number
  saldoPendiente: number
}

export function MontoParcialInput({ montoRecibido, setMontoRecibido, total, cambio, saldoPendiente }: Props) {
  const handlePagarCompleto = () => setMontoRecibido(total.toString())
  
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Monto recibido</span>
        <button 
          onClick={handlePagarCompleto}
          className="text-xs text-primary hover:underline font-medium"
        >
          Pagar todo
        </button>
      </div>
      
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">S/</span>
        <input 
          type="number" 
          value={montoRecibido} 
          onChange={e => setMontoRecibido(e.target.value)} 
          placeholder="0.00" 
          step="0.01" 
          min="0" 
          max={total} 
          autoFocus
          className="w-full pl-10 pr-3 py-2.5 text-base font-bold text-gray-900 outline-none bg-gray-50 border border-gray-200 rounded-xl focus:border-primary" 
        />
      </div>
      
      <div className="flex justify-between text-xs border-t border-gray-100 pt-2">
        <div className="flex flex-col">
          <span className="text-gray-400">Total</span>
          <span className="font-bold text-gray-700">S/ {total.toFixed(2)}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-gray-400">Falta</span>
          <span className="font-bold text-yellow-600">S/ {saldoPendiente.toFixed(2)}</span>
        </div>
        {cambio > 0 && (
          <div className="flex flex-col text-right">
            <span className="text-gray-400">Cambio</span>
            <span className="font-bold text-green-600">S/ {cambio.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  )
}