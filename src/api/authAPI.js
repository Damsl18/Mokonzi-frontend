import api from './axiosConfig'
export const login = async (username, password) => {
  const r = await api.post('/auth/login/', { username, password })
  const d = r.data
  return { token: d.token, user: { id: d.user_id, username: d.username, role: d.role } }
}
export const logout = async () => { try { await api.post('/auth/logout/') } catch {} }
export const getMe = async () => { const r = await api.get('/users/me/'); return r.data }
export const register = async (data) => {
  const r = await api.post('/auth/register/', {
    username: data.username, email: data.email || '',
    first_name: data.first_name || '', last_name: data.last_name || '',
    password: data.password, password_confirm: data.password,
    role: data.role || 'worker',
  })
  return r.data
}
