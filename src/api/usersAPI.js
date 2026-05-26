/**
 * usersAPI.js — corrigé selon UserListSerializer / UserProfileSerializer
 * Champs liste    : id, username, email, first_name, last_name, role
 * Champs profil   : + last_presence, activities_count, sales_count, is_locked
 */
import api from './axiosConfig'

export const getUsers = async () => {
  const r = await api.get('/users/')
  return r.data
}

export const getUser = async (id) => {
  const r = await api.get(`/users/${id}/`)
  return r.data
}

export const updateUser = async (id, data) => {
  const r = await api.patch(`/users/${id}/`, data)
  return r.data
}

export const deleteUser = async (id) => {
  await api.delete(`/users/${id}/`)
}

export const getUserActivities = async (id) => {
  const r = await api.get(`/users/${id}/activities/`)
  return r.data
}
