import api from './axiosConfig'
export const getDiscounts = async () => { const r = await api.get('/discounts/'); return r.data }
export const createDiscount = async (data) => {
  const payload = {
    discount_percentage: parseFloat(data.discount_percentage),
    description: data.description || '',
    start_date: data.start_date,
    end_date: data.end_date,
  }
  if (data.product) payload.product = parseInt(data.product)
  const r = await api.post('/discounts/', payload)
  return r.data
}
export const updateDiscount = async (id, data) => {
  const payload = {}
  if (data.discount_percentage !== undefined) payload.discount_percentage = parseFloat(data.discount_percentage)
  if (data.description !== undefined) payload.description = data.description
  if (data.start_date !== undefined) payload.start_date = data.start_date
  if (data.end_date !== undefined) payload.end_date = data.end_date
  if (data.product !== undefined) payload.product = data.product ? parseInt(data.product) : null
  const r = await api.patch(`/discounts/${id}/`, payload)
  return r.data
}
export const deleteDiscount = async (id) => { await api.delete(`/discounts/${id}/`) }
export const getActiveDiscounts = async () => { const r = await api.get('/discounts/active_discounts/'); return r.data }
