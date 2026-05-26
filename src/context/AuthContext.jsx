/**
 * AuthContext.jsx
 * Contexte global d'authentification.
 * Fournit : user, token, role, login(), logout(), loading
 * Persistance via localStorage pour survivre aux rechargements de page.
 */
import React, { createContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, logout as apiLogout, getMe } from '../api/authAPI'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  // Initialisation depuis localStorage (persistance de session)
  const [user, setUser]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [token, setToken]   = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)

  // Au montage : vérifie que le token est encore valide
  useEffect(() => {
    const verify = async () => {
      if (token) {
        try {
          const me = await getMe()
          setUser(me)
          localStorage.setItem('user', JSON.stringify(me))
        } catch {
          // Token invalide → nettoyage
          setToken(null)
          setUser(null)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }
    verify()
  }, []) // Ne dépend pas de token pour éviter une boucle infinie

  /**
   * Connexion : stocke token + user dans le state et localStorage
   */
  const login = useCallback(async (username, password) => {
    const data = await apiLogin(username, password)
    const { token: newToken, user: newUser } = data
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    return newUser // retourne le user pour que la page puisse rediriger selon le rôle
  }, [])

  /**
   * Déconnexion : nettoie tout
   */
  const logout = useCallback(async () => {
    try { await apiLogout() } catch { /* ignore les erreurs réseau */ }
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }, [])

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
