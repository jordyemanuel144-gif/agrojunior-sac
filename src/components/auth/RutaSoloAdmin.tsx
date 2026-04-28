import { Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '@/context/AuthContext'
import { RUTAS } from '@/config/rutas'

export function RutaSoloAdmin() {
  const { isAdmin } = useAuthContext()

  if (!isAdmin) {
    return <Navigate to={RUTAS.ADMIN.POS} replace />
  }

  return <Outlet />
}