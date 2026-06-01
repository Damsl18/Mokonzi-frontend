import api from './axiosConfig'
export const getProducts = async () => { const r = await api.get('/products/'); return r.data }
export const getProduct = async (id) => { const r = await api.get(`/products/${id}/`); return r.data }
export const createProduct = async (data) => {
  const r = await api.post('/products/', {
    name: data.name, description: data.description || '',
    price: parseFloat(data.price), quantity_in_stock: parseInt(data.quantity_in_stock),
  })
  return r.data
}
export const updateProduct = async (id, data) => {
  const payload = {}
  if (data.name !== undefined) payload.name = data.name
  if (data.description !== undefined) payload.description = data.description
  if (data.price !== undefined) payload.price = parseFloat(data.price)
  if (data.quantity_in_stock !== undefined) payload.quantity_in_stock = parseInt(data.quantity_in_stock)
  const r = await api.patch(`/products/${id}/`, payload)
  return r.data
}
export const deleteProduct = async (id) => { await api.delete(`/products/${id}/`) }
export const setDailyPrice = async (id, price) => {
  const r = await api.patch(`/products/${id}/`, { daily_price: parseFloat(price) })
  return r.data
}
export const getLowStockProducts = async () => { const r = await api.get('/products/low_stock/'); return r.data }
export const updateStock = async (id, quantityToAdd) => {
  const product = await getProduct(id)
  const newQty = parseInt(product.quantity_in_stock || 0) + parseInt(quantityToAdd)
  const r = await api.patch(`/products/${id}/`, { quantity_in_stock: newQty })
  return r.data
}
