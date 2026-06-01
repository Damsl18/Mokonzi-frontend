import api from './axiosConfig'
export const getSales = async () => { const r = await api.get('/sales/'); return r.data }
export const createSale = async (data) => {
  const payload = { product: parseInt(data.product), quantity: parseInt(data.quantity) }
  if (data.discount) payload.discount = parseInt(data.discount)
  const r = await api.post('/sales/', payload)
  return r.data
}
export const getSale = async (id) => { const r = await api.get(`/sales/${id}/`); return r.data }
export const getTodaySales = async () => { const r = await api.get('/sales/today_sales/'); return r.data }
export const getSalesStatistics = async () => { const r = await api.get('/sales/sales_statistics/'); return r.data }
