import api from './axiosConfig'
export const getUsers = async () => { const r = await api.get('/users/'); return r.data }
export const getUser = async (id) => { const r = await api.get(`/users/${id}/`); return r.data }
export const updateUser = async (id, data) => { const r = await api.patch(`/users/${id}/`, data); return r.data }
export const deleteUser = async (id) => { await api.delete(`/users/${id}/`) }
export const getUserActivities = async (id) => { const r = await api.get(`/users/${id}/activities/`); return r.data }
