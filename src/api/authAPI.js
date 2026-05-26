/**
 * authAPI.js — corrigé selon le format réel de l'API
 * Login retourne : { token, user_id, username, role, message }
 * /users/me/ retourne : { id, username, email, first_name, last_name, role, ... }
 * Register attend : { username, email, password, password_confirm, role, first_name, last_name }
 */
import api from './axiosConfig'

export const login = async (username, password) => {
  const response = await api.post('/auth/login/', { username, password })
  const d = response.data
  // Normalise en objet { token, user } attendu par AuthContext
  return {
    token: d.token,
    user: {
      id: d.user_id,
      username: d.username,
      role: d.role,
    }
  }
}

export const logout = async () => {
  try { await api.post('/auth/logout/') } catch {}
}

export const getMe = async () => {
  const response = await api.get('/users/me/')
  return response.data // { id, username, email, role, ... }
}

/**
 * Créer un worker — password_confirm obligatoire, min 8 caractères
 */
export const register = async (data) => {
  const payload = {
    username: data.username,
    email: data.email || '',
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    password: data.password,
    password_confirm: data.password,
    role: data.role || 'worker',
  }
  const response = await api.post('/auth/register/', payload)
  return response.data
}
