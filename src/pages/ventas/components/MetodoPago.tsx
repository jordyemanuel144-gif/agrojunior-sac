// Componente reutilizable para los íconos de método de pago
import { Banknote, QrCode, Building2 } from 'lucide-react'

export const METODO_ICONS: Record<string, React.ReactNode> = {
  efectivo: <Banknote size={14} />,
  yape: <QrCode size={14} />,
  transferencia: <Building2 size={14} />,
}

export const METODO_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  yape: 'Yape/Plin',
  transferencia: 'Transferencia',
}
