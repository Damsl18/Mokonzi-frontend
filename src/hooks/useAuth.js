/**
 * useAuth.js
 * Hook pratique pour accéder au contexte d'authentification depuis n'importe quel composant.
 * Usage : const { user, role, login, logout } = useAuth()
 */
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider')
  }
  return context
}

export default useAuth
