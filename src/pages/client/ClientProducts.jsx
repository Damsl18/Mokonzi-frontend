/**
 * ClientProducts.jsx
 * CRUD produits + gestion du prix du jour (set_daily_price).
 */
import { useState, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import Spinner from '../../components/common/Spinner'
import ConfirmModal from '../../components/common/ConfirmModal'
import { getProducts, createProduct, updateProduct, deleteProduct, setDailyPrice, getLowStockProducts } from '../../api/productsAPI'
import { formatCDF } from '../../utils/formatCurrency'
import { toast } from 'react-toastify'

const emptyForm = { name: '', description: '', price: '', quantity_in_stock: '' }

const ClientProducts = () => {
  const [products, setProducts]   = useState([])
  const [lowStock, setLowStock]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editMode, setEditMode]   = useState(false)
  const [editId, setEditId]       = useState(null)
  const [form, setForm]           = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' })
  const [priceModal, setPriceModal]   = useState({ open: false, id: null, name: '', current: '' })
  const [newPrice, setNewPrice]       = useState('')

  const load = async () => {
    try {
      const [prods, low] = await Promise.all([getProducts(), getLowStockProducts()])
      setProducts(Array.isArray(prods) ? prods : prods.results || [])
      setLowStock(Array.isArray(low) ? low : low.results || [])
    } catch { toast.error('Erreur de chargement.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const openAdd = () => { setForm(emptyForm); setEditMode(false); setEditId(null); setShowForm(true) }
  const openEdit = (p) => {
    setForm({ name: p.name, description: p.description || '', price: p.price, quantity_in_stock: p.quantity_in_stock })
    setEditMode(true); setEditId(p.id); setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Le nom est requis.'); return }
    if (!form.price || parseFloat(form.price) <= 0) { toast.error('Prix invalide.'); return }
    if (!form.quantity_in_stock || parseInt(form.quantity_in_stock) < 0) { toast.error('Quantité invalide.'); return }
    setSubmitting(true)
    try {
      const payload = { name: form.name.trim(), description: form.description, price: parseFloat(form.price), quantity_in_stock: parseInt(form.quantity_in_stock) }
      if (editMode) { await updateProduct(editId, payload); toast.success('Produit mis à jour.') }
      else { await createProduct(payload); toast.success('Produit créé.') }
      setShowForm(false); await load()
    } catch (err) {
      toast.error(err.response?.data?.detail || err.response?.data?.name?.[0] || 'Erreur.')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteModal.id)
      setProducts(prev => prev.filter(p => p.id !== deleteModal.id))
      toast.success('Produit supprimé.')
    } catch { toast.error('Impossible de supprimer ce produit.') }
    finally { setDeleteModal({ open: false, id: null, name: '' }) }
  }

  const handleSetPrice = async () => {
    if (!newPrice || parseFloat(newPrice) <= 0) { toast.error('Prix invalide.'); return }
    try {
      await setDailyPrice(priceModal.id, parseFloat(newPrice))
      toast.success('Prix du jour mis à jour.')
      setPriceModal({ open: false, id: null, name: '', current: '' })
      setNewPrice('')
      await load()
    } catch (err) { toast.error(err.response?.data?.detail || 'Erreur.') }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <Navbar title="Produits & Prix" lowStockCount={lowStock.length} />
      <main className="main-content">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="page-title mb-1">Produits & Prix</h2>
            <p className="page-subtitle mb-0">{products.length} produit{products.length > 1 ? 's' : ''}</p>
          </div>
          <button className="btn-primary-mokonzi" onClick={openAdd}>
            <i className="bi bi-plus-circle" /> Ajouter un produit
          </button>
        </div>

        {loading ? <Spinner /> : (
          <div className="card-mokonzi">
            <div className="card-body-mokonzi p-0">
              {products.length === 0
                ? <p className="text-secondary text-center py-5">Aucun produit. Ajoutez-en un !</p>
                : (
                  <div className="table-responsive">
                    <table className="table-mokonzi">
                      <thead>
                        <tr><th>Produit</th><th>Prix de base</th><th>Prix du jour</th><th>Stock</th><th>Statut</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.id}>
                            <td>
                              <div style={{ fontWeight: 700 }}>{p.name}</div>
                              <div style={{ fontSize: 12, color: '#64748b' }}>{p.description || '—'}</div>
                            </td>
                            <td>{formatCDF(p.price)}</td>
                            <td>
                              <strong style={{ color: '#2563eb' }}>{formatCDF(p.current_price || p.unit_price)}</strong>
                            </td>
                            <td><strong>{p.quantity_in_stock}</strong></td>
                            <td>
                              {p.quantity_in_stock === 0
                                ? <span className="badge-mokonzi badge-danger">Épuisé</span>
                                : p.quantity_in_stock < 10
                                  ? <span className="badge-mokonzi badge-warning">Stock faible</span>
                                  : <span className="badge-mokonzi badge-success">Disponible</span>
                              }
                            </td>
                            <td>
                              <div className="d-flex gap-2 flex-wrap">
                                <button className="btn-edit-mokonzi" onClick={() => openEdit(p)}>
                                  <i className="bi bi-pencil" /> Modifier
                                </button>
                                <button className="btn-edit-mokonzi" style={{ background: '#f0fdf4', color: '#065f46', borderColor: '#a7f3d0' }}
                                  onClick={() => { setPriceModal({ open: true, id: p.id, name: p.name, current: p.current_price || p.price }); setNewPrice('') }}>
                                  <i className="bi bi-currency-dollar" /> Prix
                                </button>
                                <button className="btn-danger-mokonzi" onClick={() => setDeleteModal({ open: true, id: p.id, name: p.name })}>
                                  <i className="bi bi-trash" /> Suppr.
                                </button>
                              </div>
                            </td>
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

        {/* Modal produit */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h5 style={{ fontWeight: 700, marginBottom: 20 }}>{editMode ? 'Modifier le produit' : 'Ajouter un produit'}</h5>
              <form onSubmit={handleSubmit} className="form-mokonzi">
                <div className="mb-3">
                  <label className="form-label">Nom du produit *</label>
                  <input type="text" name="name" className="form-control" placeholder="Sac de farine 50kg"
                    value={form.name} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea name="description" className="form-control" rows={2} placeholder="Description du produit"
                    value={form.description} onChange={handleChange} />
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <label className="form-label">Prix de base (CDF) *</label>
                    <input type="number" name="price" className="form-control" placeholder="15000"
                      min="0" step="any" value={form.price} onChange={handleChange} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Quantité initiale *</label>
                    <input type="number" name="quantity_in_stock" className="form-control" placeholder="100"
                      min="0" value={form.quantity_in_stock} onChange={handleChange} required />
                  </div>
                </div>
                <div className="d-flex gap-3 justify-content-end">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowForm(false)} style={{ borderRadius: 8 }}>Annuler</button>
                  <button type="submit" className="btn-primary-mokonzi" disabled={submitting}>
                    {submitting ? <><span className="spinner-border spinner-border-sm me-2" />...</> : editMode ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal prix du jour */}
        {priceModal.open && (
          <div className="modal-overlay" onClick={() => setPriceModal({ open: false, id: null, name: '', current: '' })}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h5 style={{ fontWeight: 700, marginBottom: 8 }}>Modifier le prix du jour</h5>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                Produit : <strong>{priceModal.name}</strong><br />
                Prix actuel : <strong style={{ color: '#2563eb' }}>{formatCDF(priceModal.current)}</strong>
              </p>
              <div className="form-mokonzi mb-4">
                <label className="form-label">Nouveau prix (CDF) *</label>
                <input type="number" className="form-control" placeholder="Ex: 18000"
                  min="1" value={newPrice} onChange={e => setNewPrice(e.target.value)} autoFocus />
              </div>
              <div className="d-flex gap-3 justify-content-end">
                <button className="btn btn-light fw-semibold" onClick={() => setPriceModal({ open: false })} style={{ borderRadius: 8 }}>Annuler</button>
                <button className="btn-primary-mokonzi" onClick={handleSetPrice}>
                  <i className="bi bi-check-circle me-1" /> Appliquer
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={deleteModal.open}
          title="Supprimer le produit"
          message={`Supprimer "${deleteModal.name}" ? Toutes les ventes associées seront affectées.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal({ open: false, id: null, name: '' })}
        />
      </main>
    </div>
  )
}
export default ClientProducts
