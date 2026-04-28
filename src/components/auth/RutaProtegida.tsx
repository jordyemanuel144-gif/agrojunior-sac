import { Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '@/context/AuthContext'
import { Cargando } from '@/components/ui/Cargando'

export function RutaProtegida() {
  const { user, loading } = useAuthContext()

  if (loading) {
    return <Cargando />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}