/**
 * salesAPI.js — corrigé selon SaleSerializer
 * Champs vente : id, worker, worker_username, product, product_name,
 *                quantity, unit_price, discount, discount_percentage,
 *                total_price, sale_date
 * Créer vente  : POST /api/sales/ { product: id, quantity: int, discount?: id }
 * today_sales  : GET /api/sales/today_sales/
 * statistics   : GET /api/sales/sales_statistics/  (pas /statistics/)
 *   Retourne   : { total_sales_count, total_sales_amount, total_quantity_sold, average_sale_price }
 */
import api from './axiosConfig'

export const getSales = async () => {
  const r = await api.get('/sales/')
  return r.data
}

export const createSale = async (data) => {
  const r = await api.post('/sales/', data)
  return r.data
}

export const getSale = async (id) => {
  const r = await api.get(`/sales/${id}/`)
  return r.data
}

export const getTodaySales = async () => {
  const r = await api.get('/sales/today_sales/')
  return r.data
}

export const getSalesStatistics = async () => {
  const r = await api.get('/sales/sales_statistics/')
  return r.data
  // Retourne : { total_sales_count, total_sales_amount, total_quantity_sold, average_sale_price }
}
