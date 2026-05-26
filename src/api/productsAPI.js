/**
 * productsAPI.js — corrigé selon ProductSerializer
 * Champs produit : id, name, description, price, daily_price,
 *                  current_price, quantity_in_stock, active_discount,
 *                  created_at, updated_at
 * Prix du jour : PATCH /api/products/{id}/ avec { daily_price: valeur }
 * Stock        : PATCH /api/products/{id}/ avec { quantity_in_stock: nouvelle_valeur }
 * low_stock    : GET /api/products/low_stock/
 * update_daily_price (bulk) : POST /api/products/update_daily_price/
 */
import api from './axiosConfig'

export const getProducts = async () => {
  const r = await api.get('/products/')
  return r.data
}

export const getProduct = async (id) => {
  const r = await api.get(`/products/${id}/`)
  return r.data
}

export const createProduct = async (data) => {
  const r = await api.post('/products/', data)
  return r.data
}

export const updateProduct = async (id, data) => {
  const r = await api.patch(`/products/${id}/`, data)
  return r.data
}

export const deleteProduct = async (id) => {
  await api.delete(`/products/${id}/`)
}

/**
 * Modifier le prix du jour d'un produit
 * Utilise PATCH sur le produit avec le champ daily_price
 */
export const setDailyPrice = async (id, price) => {
  const r = await api.patch(`/products/${id}/`, { daily_price: price })
  return r.data
}

/**
 * Produits en stock faible (< 10 unités)
 */
export const getLowStockProducts = async () => {
  const r = await api.get('/products/low_stock/')
  return r.data
}

/**
 * Réceptionner du stock — PATCH quantity_in_stock avec la nouvelle valeur totale
 * On récupère d'abord le produit pour calculer : ancien stock + quantité reçue
 */
export const updateStock = async (id, quantityToAdd) => {
  const product = await getProduct(id)
  const newQty = (product.quantity_in_stock || 0) + parseInt(quantityToAdd)
  const r = await api.patch(`/products/${id}/`, { quantity_in_stock: newQty })
  return r.data
}
