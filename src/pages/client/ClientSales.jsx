/**
 * ClientSales.jsx — Vue complète de toutes les ventes (lecture seule + nouvelle vente).
 */
import { useState, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import Spinner from '../../components/common/Spinner'
import { getSales, createSale } from '../../api/salesAPI'
import { getProducts } from '../../api/productsAPI'
import { getActiveDiscounts } from '../../api/discountsAPI'
import { formatCDF } from '../../utils/formatCurrency'
import { formatDateTime } from '../../utils/formatDate'
import { toast } from 'react-toastify'

const ClientSales = () => {
  const [sales, setSales]         = useState([])
  const [products, setProducts]   = useState([])
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ product: '', quantity: '', discount: '' })
  const [search, setSearch]       = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [sal, prods, discs] = await Promise.all([getSales(), getProducts(), getActiveDiscounts()])
        setSales(Array.isArray(sal) ? sal : sal.results || [])
        setProducts(Array.isArray(prods) ? prods : prods.results || [])
        setDiscounts(Array.isArray(discs) ? discs : discs.results || [])
      } catch { toast.error('Erreur de chargement.') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = sales.filter(s => {
    const term = search.toLowerCase()
    return (
      (s.product_name || s.product?.name || '').toLowerCase().includes(term) ||
      (s.worker_username || '').toLowerCase().includes(term)
    )
  })

  const totalRevenue = filtered.reduce((sum, s) => sum + parseFloat(s.total_price || s.total || 0), 0)

  const selectedProduct = products.find(p => p.id === parseInt(form.product))
  const unitPrice = selectedProduct ? parseFloat(parseFloat(selectedProduct.current_price || selectedProduct.price || 0)) : 0
  const qty = parseInt(form.quantity) || 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.product || !form.quantity || parseInt(form.quantity) < 1) { toast.error('Remplissez tous les champs.'); return }
    if (selectedProduct && parseInt(form.quantity) > selectedProduct.quantity_in_stock) {
      toast.error(`Stock insuffisant (${selectedProduct.quantity_in_stock} disponibles)`); return
    }
    setSubmitting(true)
    try {
      const payload = { product: parseInt(form.product), quantity: parseInt(form.quantity), ...(form.discount && { discount: parseInt(form.discount) }) }
      const newSale = await createSale(payload)
      setSales([newSale, ...sales])
      setForm({ product: '', quantity: '', discount: '' })
      setShowForm(false)
      toast.success('Vente enregistrée.')
    } catch (err) { toast.error(err.response?.data?.detail || 'Erreur.') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <Navbar title="Ventes" />
      <main className="main-content">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="page-title mb-1">Toutes les ventes</h2>
            <p className="page-subtitle mb-0">{filtered.length} vente{filtered.length > 1 ? 's' : ''} — Total : <strong style={{ color: '#2563eb' }}>{formatCDF(totalRevenue)}</strong></p>
          </div>
          <button className="btn-primary-mokonzi" onClick={() => setShowForm(true)}>
            <i className="bi bi-cart-plus" /> Enregistrer une vente
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="mb-3" style={{ maxWidth: 380 }}>
          <div className="input-group">
            <span className="input-group-text" style={{ background: '#f8faff', border: '1.5px solid #e2e8f0' }}>
              <i className="bi bi-search" style={{ color: '#64748b' }} />
            </span>
            <input type="text" className="form-control" placeholder="Rechercher par produit ou worker..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: '1.5px solid #e2e8f0', borderLeft: 'none' }} />
          </div>
        </div>

        {loading ? <Spinner /> : (
          <div className="card-mokonzi">
            <div className="card-body-mokonzi p-0">
              {filtered.length === 0
                ? <p className="text-secondary text-center py-4">Aucune vente trouvée.</p>
                : (
                  <div className="table-responsive">
                    <table className="table-mokonzi">
                      <thead>
                        <tr><th>#</th><th>Produit</th><th>Qté</th><th>Prix unit.</th><th>Total</th><th>Worker</th><th>Date</th></tr>
                      </thead>
                      <tbody>
                        {filtered.map(s => (
                          <tr key={s.id}>
                            <td style={{ fontSize: 12, color: '#94a3b8' }}>#{s.id}</td>
                            <td><strong>{s.product_name || s.product?.name}</strong></td>
                            <td>{s.quantity}</td>
                            <td>{formatCDF(s.unit_price)}</td>
                            <td><strong style={{ color: '#2563eb' }}>{formatCDF(s.total_price || s.total)}</strong></td>
                            <td>
                              <span className="badge-mokonzi badge-neutral">
                                <i className="bi bi-person me-1" />{s.worker_username || '—'}
                              </span>
                            </td>
                            <td style={{ fontSize: 12, color: '#64748b' }}>{formatDateTime(s.sale_date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              }
            </div>
          </div>
        )}

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h5 style={{ fontWeight: 700, marginBottom: 20 }}>Enregistrer une vente</h5>
              <form onSubmit={handleSubmit} className="form-mokonzi">
                <div className="mb-3">
                  <label className="form-label">Produit *</label>
                  <select name="product" className="form-select" value={form.product} onChange={e => setForm({ ...form, product: e.target.value })} required>
                    <option value="">-- Choisir un produit --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} disabled={p.quantity_in_stock === 0}>
                        {p.name} — {formatCDF(p.current_price || p.unit_price)} ({p.quantity_in_stock} en stock)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Quantité *</label>
                  <input type="number" className="form-control" placeholder="Ex: 3" min="1"
                    max={selectedProduct?.quantity_in_stock || 9999}
                    value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
                </div>
                <div className="mb-4">
                  <label className="form-label">Réduction (optionnel)</label>
                  <select className="form-select" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })}>
                    <option value="">Aucune</option>
                    {discounts.map(d => <option key={d.id} value={d.id}>{d.description || `Réduction #${d.id}`} — {d.discount_percentage}%</option>)}
                  </select>
                </div>
                {qty > 0 && selectedProduct && (
                  <div style={{ background: '#eff6ff', borderRadius: 8, padding: '12px 14px', marginBottom: 16, fontSize: 14, color: '#1e40af' }}>
                    Total estimé : <strong>{formatCDF(unitPrice * qty)}</strong>
                  </div>
                )}
                <div className="d-flex gap-3 justify-content-end">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowForm(false)} style={{ borderRadius: 8 }}>Annuler</button>
                  <button type="submit" className="btn-primary-mokonzi" disabled={submitting}>
                    {submitting ? <><span className="spinner-border spinner-border-sm me-2" />...</> : 'Valider'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
export default ClientSales
