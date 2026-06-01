import api from './axiosConfig'
export const getInvoices = async () => { const r = await api.get('/invoices/'); return r.data }
export const createInvoice = async (data) => {
  const r = await api.post('/invoices/', { sales: data.sales, notes: data.notes || '' })
  return r.data
}
export const getInvoice = async (id) => { const r = await api.get(`/invoices/${id}/`); return r.data }
export const markAsPaid = async (id, amountPaid) => {
  const r = await api.post(`/invoices/${id}/mark_as_paid/`, amountPaid ? { amount_paid: amountPaid } : {})
  return r.data
}
export const markAsIssued = async (id) => {
  const r = await api.post(`/invoices/${id}/mark_as_issued/`)
  return r.data
}
