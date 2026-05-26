/**
 * invoicesAPI.js — corrigé selon InvoiceDetailSerializer / InvoiceListSerializer
 * Champs liste    : id, invoice_number, worker_name, total_amount, amount_paid, status, sales_count, created_at
 * Champs détail   : + sales[], remaining_amount, notes, issued_at, status_display
 * Créer facture   : POST /api/invoices/ { sales: [id,...], notes?: string }
 *   ATTENTION : invoice_number et worker sont ajoutés côté serveur automatiquement
 */
import api from './axiosConfig'

export const getInvoices = async () => {
  const r = await api.get('/invoices/')
  return r.data
}

export const createInvoice = async (data) => {
  const r = await api.post('/invoices/', { sales: data.sales, notes: data.notes || '' })
  return r.data
}

export const getInvoice = async (id) => {
  const r = await api.get(`/invoices/${id}/`)
  return r.data
}

export const markAsPaid = async (id, amountPaid) => {
  const payload = amountPaid ? { amount_paid: amountPaid } : {}
  const r = await api.post(`/invoices/${id}/mark_as_paid/`, payload)
  return r.data
}

export const markAsIssued = async (id) => {
  const r = await api.post(`/invoices/${id}/mark_as_issued/`)
  return r.data
}
