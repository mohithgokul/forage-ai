import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-forge-bg">
        <div className="scanline-loader" />
        <p className="text-forge-text-secondary font-mono mt-4">
          // restoring session...
        </p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={`/auth?redirect=${location.pathname}`} replace />
  }

  return <Outlet />
}
