import { useState, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import Spinner from '../../components/common/Spinner'
import { getProducts } from '../../api/productsAPI'
import { createSale, getSales } from '../../api/salesAPI'
import { getActiveDiscounts } from '../../api/discountsAPI'
import { formatCDF } from '../../utils/formatCurrency'
import { formatDateTime } from '../../utils/formatDate'
import { toast } from 'react-toastify'

const WorkerSales = () => {
  const [products, setProducts]   = useState([])
  const [discounts, setDiscounts] = useState([])
  const [sales, setSales]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ product: '', quantity: '', discount: '' })

  useEffect(() => {
    const load = async () => {
      try {
        const [prods, discs, sal] = await Promise.all([getProducts(), getActiveDiscounts(), getSales()])
        setProducts(Array.isArray(prods) ? prods : prods.results || [])
        setDiscounts(Array.isArray(discs) ? discs : discs.results || [])
        setSales(Array.isArray(sal) ? sal : sal.results || [])
      } catch { toast.error('Erreur de chargement.') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const selectedProduct = products.find(p => p.id === parseInt(form.product))
  // Champ prix : current_price ou price (selon ProductSerializer)
  const unitPrice = selectedProduct ? parseFloat(selectedProduct.current_price || selectedProduct.price || 0) : 0
  const qty = parseInt(form.quantity) || 0
  const estimatedTotal = unitPrice * qty

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.product) { toast.error('Choisissez un produit.'); return }
    if (!form.quantity || qty < 1) { toast.error('Quantité invalide.'); return }
    if (selectedProduct && qty > selectedProduct.quantity_in_stock) {
      toast.error(`Stock insuffisant. Disponible : ${selectedProduct.quantity_in_stock}`); return
    }
    setSubmitting(true)
    try {
      const payload = {
        product: parseInt(form.product),
        quantity: qty,
        ...(form.discount && { discount: parseInt(form.discount) })
      }
      const newSale = await createSale(payload)
      setSales([newSale, ...sales])
      setForm({ product: '', quantity: '', discount: '' })
      toast.success('Vente enregistrée !')
    } catch (err) {
      toast.error(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Erreur.')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <Navbar title="Nouvelle vente" />
      <main className="main-content">
        <h2 className="page-title">Enregistrer une vente</h2>
        <p className="page-subtitle">Vente de sacs de farine — ETS Mokonzi</p>
        {loading ? <Spinner /> : (
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="card-mokonzi">
                <div className="card-header-mokonzi">
                  <h5><i className="bi bi-cart-plus me-2 text-primary" />Détails de la vente</h5>
                </div>
                <div className="card-body-mokonzi">
                  <form onSubmit={handleSubmit} className="form-mokonzi">
                    <div className="mb-3">
                      <label className="form-label">Produit *</label>
                      <select className="form-select" value={form.product}
                        onChange={e => setForm({ ...form, product: e.target.value })} required>
                        <option value="">-- Choisir un produit --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id} disabled={p.quantity_in_stock === 0}>
                            {p.name} — {formatCDF(p.current_price || p.price)}
                            {p.quantity_in_stock === 0 ? ' (Épuisé)' : ` (${p.quantity_in_stock} en stock)`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Quantité *</label>
                      <input type="number" className="form-control" placeholder="Ex: 5" min="1"
                        max={selectedProduct?.quantity_in_stock || 9999}
                        value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
                      {selectedProduct && (
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                          Disponible : <strong>{selectedProduct.quantity_in_stock}</strong>
                        </div>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="form-label">Réduction (optionnel)</label>
                      <select className="form-select" value={form.discount}
                        onChange={e => setForm({ ...form, discount: e.target.value })}>
                        <option value="">-- Aucune --</option>
                        {discounts.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.description || `Réduction #${d.id}`} — {d.discount_percentage}%
                          </option>
                        ))}
                      </select>
                    </div>
                    {qty > 0 && selectedProduct && (
                      <div style={{ background: '#eff6ff', borderRadius: 10, padding: '14px 16px', marginBottom: 20, border: '1.5px solid #bfdbfe' }}>
                        <div style={{ fontSize: 13, color: '#374151' }}>{qty} × {formatCDF(unitPrice)}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#2563eb', marginTop: 4 }}>
                          Total estimé : {formatCDF(estimatedTotal)}
                        </div>
                      </div>
                    )}
                    <button type="submit" className="btn-primary-mokonzi w-100 justify-content-center" disabled={submitting}>
                      {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Enregistrement...</> : <><i className="bi bi-check-circle me-2" />Valider la vente</>}
                    </button>
                  </form>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="card-mokonzi">
                <div className="card-header-mokonzi">
                  <h5><i className="bi bi-clock-history me-2 text-primary" />Historique</h5>
                  <span className="badge-mokonzi badge-info">{sales.length}</span>
                </div>
                <div className="card-body-mokonzi p-0">
                  {sales.length === 0
                    ? <p className="text-secondary text-center py-4">Aucune vente.</p>
                    : (
                      <div className="table-responsive" style={{ maxHeight: 480, overflowY: 'auto' }}>
                        <table className="table-mokonzi">
                          <thead><tr><th>#</th><th>Produit</th><th>Qté</th><th>Total</th><th>Date</th></tr></thead>
                          <tbody>
                            {sales.map(s => (
                              <tr key={s.id}>
                                <td style={{ fontSize: 12, color: '#94a3b8' }}>#{s.id}</td>
                                <td><strong>{s.product_name}</strong></td>
                                <td>{s.quantity}</td>
                                <td><strong style={{ color: '#2563eb' }}>{formatCDF(s.total_price)}</strong></td>
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
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
export default WorkerSales
