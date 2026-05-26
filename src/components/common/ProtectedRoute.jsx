/**
 * ProtectedRoute.jsx
 * Composant qui protège les routes par rôle.
 * Si non connecté → redirige vers /login-worker
 * Si mauvais rôle → redirige vers le dashboard du bon rôle
 */
import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import Spinner from './Spinner'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth()

  if (loading) return <Spinner text="Vérification de la session..." />

  if (!isAuthenticated) return <Navigate to="/login-worker" replace />

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirige vers le bon dashboard selon le rôle réel
    if (role === 'client') return <Navigate to="/client/dashboard" replace />
    if (role === 'worker') return <Navigate to="/worker/dashboard" replace />
    return <Navigate to="/login-worker" replace />
  }

  return children
}
export default ProtectedRoute
