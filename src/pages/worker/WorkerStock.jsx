/**
 * WorkerStock.jsx
 * Le worker peut réceptionner du stock (ajouter des unités à un produit).
 */
import { useState, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import AlertBadge from '../../components/common/AlertBadge'
import Spinner from '../../components/common/Spinner'
import { getProducts, getLowStockProducts, updateStock } from '../../api/productsAPI'
import { formatCDF } from '../../utils/formatCurrency'
import { toast } from 'react-toastify'

const WorkerStock = () => {
  const [products, setProducts] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading]   = useState(true)
  const [form, setForm]         = useState({ product: '', quantity: '' })
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      const [prods, low] = await Promise.all([getProducts(), getLowStockProducts()])
      setProducts(Array.isArray(prods) ? prods : prods.results || [])
      setLowStock(Array.isArray(low) ? low : low.results || [])
    } catch { toast.error('Erreur de chargement.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.product) { toast.error('Sélectionnez un produit.'); return }
    if (!form.quantity || parseInt(form.quantity) < 1) { toast.error('Quantité invalide.'); return }
    setSubmitting(true)
    try {
      await updateStock(parseInt(form.product), parseInt(form.quantity))
      toast.success(`Stock mis à jour ! +${form.quantity} unité(s) ajoutée(s).`)
      setForm({ product: '', quantity: '' })
      await load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur lors de la mise à jour du stock.')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <Navbar title="Réception de stock" lowStockCount={lowStock.length} />
      <main className="main-content">
        <AlertBadge products={lowStock} />
        <h2 className="page-title">Réception de stock</h2>
        <p className="page-subtitle">Enregistrez les nouvelles entrées de marchandises</p>

        {loading ? <Spinner /> : (
          <div className="row g-4">
            {/* Formulaire réception */}
            <div className="col-lg-5">
              <div className="card-mokonzi">
                <div className="card-header-mokonzi">
                  <h5><i className="bi bi-box-arrow-in-down me-2 text-primary" />Nouvelle réception</h5>
                </div>
                <div className="card-body-mokonzi">
                  <form onSubmit={handleSubmit} className="form-mokonzi">
                    <div className="mb-3">
                      <label className="form-label">Produit *</label>
                      <select name="product" className="form-select" value={form.product}
                        onChange={e => setForm({ ...form, product: e.target.value })} required>
                        <option value="">-- Sélectionner un produit --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Stock actuel : {p.quantity_in_stock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="form-label">Quantité reçue *</label>
                      <input
                        type="number" className="form-control"
                        placeholder="Ex: 50" min="1"
                        value={form.quantity}
                        onChange={e => setForm({ ...form, quantity: e.target.value })} required
                      />
                    </div>
                    <button type="submit" className="btn-primary-mokonzi w-100 justify-content-center" disabled={submitting}>
                      {submitting
                        ? <><span className="spinner-border spinner-border-sm me-2" />Enregistrement...</>
                        : <><i className="bi bi-plus-circle me-2" />Confirmer la réception</>
                      }
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* État du stock */}
            <div className="col-lg-7">
              <div className="card-mokonzi">
                <div className="card-header-mokonzi">
                  <h5><i className="bi bi-boxes me-2 text-primary" />État du stock</h5>
                </div>
                <div className="card-body-mokonzi p-0">
                  <div className="table-responsive">
                    <table className="table-mokonzi">
                      <thead>
                        <tr><th>Produit</th><th>Prix du jour</th><th>Quantité</th><th>Statut</th></tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.id}>
                            <td><strong>{p.name}</strong></td>
                            <td>{formatCDF(p.current_price || p.price)}</td>
                            <td><strong>{p.quantity_in_stock}</strong></td>
                            <td>
                              {p.quantity_in_stock === 0
                                ? <span className="badge-mokonzi badge-danger"><i className="bi bi-x-circle me-1" />Épuisé</span>
                                : p.quantity_in_stock < 10
                                  ? <span className="badge-mokonzi badge-warning"><i className="bi bi-exclamation-triangle me-1" />Stock faible</span>
                                  : <span className="badge-mokonzi badge-success"><i className="bi bi-check-circle me-1" />Disponible</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
export default WorkerStock
