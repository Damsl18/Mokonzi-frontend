/**
 * discountsAPI.js — corrigé selon DiscountSerializer
 * Champs : id, product, discount_percentage, start_date, end_date, description, is_active, created_at
 * active_discounts : GET /api/discounts/active_discounts/
 * ATTENTION : le champ s'appelle discount_percentage (pas value ni discount_type)
 */
import api from './axiosConfig'

export const getDiscounts = async () => {
  const r = await api.get('/discounts/')
  return r.data
}

export const createDiscount = async (data) => {
  const r = await api.post('/discounts/', data)
  return r.data
}

export const updateDiscount = async (id, data) => {
  const r = await api.patch(`/discounts/${id}/`, data)
  return r.data
}

export const deleteDiscount = async (id) => {
  await api.delete(`/discounts/${id}/`)
}

export const getActiveDiscounts = async () => {
  const r = await api.get('/discounts/active_discounts/')
  return r.data
}
