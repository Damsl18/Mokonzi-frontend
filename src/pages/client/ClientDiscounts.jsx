/**
 * ClientDiscounts.jsx — corrigé selon DiscountSerializer
 * Champs : id, product, discount_percentage, start_date, end_date, description, is_active, created_at
 */
import { useState, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import Spinner from '../../components/common/Spinner'
import ConfirmModal from '../../components/common/ConfirmModal'
import { getDiscounts, createDiscount, updateDiscount, deleteDiscount } from '../../api/discountsAPI'
import { getProducts } from '../../api/productsAPI'
import { formatDateShort } from '../../utils/formatDate'
import { toast } from 'react-toastify'

const emptyForm = { description: '', discount_percentage: '', product: '', start_date: '', end_date: '' }

const ClientDiscounts = () => {
  const [discounts, setDiscounts] = useState([])
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editMode, setEditMode]   = useState(false)
  const [editId, setEditId]       = useState(null)
  const [form, setForm]           = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' })

  const load = async () => {
    try {
      const [d, p] = await Promise.all([getDiscounts(), getProducts()])
      setDiscounts(Array.isArray(d) ? d : d.results || [])
      setProducts(Array.isArray(p) ? p : p.results || [])
    } catch { toast.error('Erreur.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(emptyForm); setEditMode(false); setShowForm(true) }
  const openEdit = (d) => {
    setForm({
      description: d.description || '',
      discount_percentage: d.discount_percentage,
      product: d.product || '',
      start_date: d.start_date?.slice(0, 10) || '',
      end_date: d.end_date?.slice(0, 10) || '',
    })
    setEditMode(true); setEditId(d.id); setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.discount_percentage || parseFloat(form.discount_percentage) <= 0) { toast.error('Pourcentage invalide.'); return }
    if (parseFloat(form.discount_percentage) > 100) { toast.error('Max 100%.'); return }
    if (!form.start_date || !form.end_date) { toast.error('Les dates sont requises.'); return }
    setSubmitting(true)
    try {
      const payload = {
        description: form.description || `Réduction ${form.discount_percentage}%`,
        discount_percentage: parseFloat(form.discount_percentage),
        start_date: form.start_date,
        end_date: form.end_date,
        ...(form.product && { product: parseInt(form.product) }),
      }
      if (editMode) { await updateDiscount(editId, payload); toast.success('Réduction mise à jour.') }
      else { await createDiscount(payload); toast.success('Réduction créée.') }
      setShowForm(false); await load()
    } catch (err) { toast.error(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Erreur.') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    try { await deleteDiscount(deleteModal.id); setDiscounts(prev => prev.filter(d => d.id !== deleteModal.id)); toast.success('Supprimée.') }
    catch { toast.error('Erreur.') }
    finally { setDeleteModal({ open: false, id: null, name: '' }) }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <Navbar title="Réductions" />
      <main className="main-content">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div><h2 className="page-title mb-1">Réductions</h2><p className="page-subtitle mb-0">{discounts.length} réduction(s)</p></div>
          <button className="btn-primary-mokonzi" onClick={openAdd}><i className="bi bi-plus-circle" /> Nouvelle</button>
        </div>
        {loading ? <Spinner /> : (
          <div className="card-mokonzi">
            <div className="card-body-mokonzi p-0">
              {discounts.length === 0
                ? <p className="text-secondary text-center py-5">Aucune réduction.</p>
                : (
                  <div className="table-responsive">
                    <table className="table-mokonzi">
                      <thead><tr><th>Description</th><th>Réduction</th><th>Produit</th><th>Période</th><th>Statut</th><th>Actions</th></tr></thead>
                      <tbody>
                        {discounts.map(d => {
                          const prod = products.find(p => p.id === d.product)
                          return (
                            <tr key={d.id}>
                              <td><strong>{d.description || '—'}</strong></td>
                              <td><strong style={{ color: '#2563eb' }}>{d.discount_percentage}%</strong></td>
                              <td style={{ fontSize: 13, color: '#64748b' }}>{prod?.name || 'Tous'}</td>
                              <td style={{ fontSize: 12, color: '#64748b' }}>{formatDateShort(d.start_date)} → {formatDateShort(d.end_date)}</td>
                              <td><span className={`badge-mokonzi ${d.is_active ? 'badge-success' : 'badge-neutral'}`}>{d.is_active ? 'Active' : 'Expirée'}</span></td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button className="btn-edit-mokonzi" onClick={() => openEdit(d)}><i className="bi bi-pencil" /></button>
                                  <button className="btn-danger-mokonzi" onClick={() => setDeleteModal({ open: true, id: d.id, name: d.description || `#${d.id}` })}><i className="bi bi-trash" /></button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
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
              <h5 style={{ fontWeight: 700, marginBottom: 20 }}>{editMode ? 'Modifier' : 'Nouvelle réduction'}</h5>
              <form onSubmit={handleSubmit} className="form-mokonzi">
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <input type="text" className="form-control" placeholder="Ex: Promo fin de semaine"
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Pourcentage de réduction (%) *</label>
                  <input type="number" className="form-control" placeholder="Ex: 10" min="0.1" max="100" step="0.1"
                    value={form.discount_percentage} onChange={e => setForm({ ...form, discount_percentage: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Produit concerné (optionnel)</label>
                  <select className="form-select" value={form.product} onChange={e => setForm({ ...form, product: e.target.value })}>
                    <option value="">Tous les produits</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <label className="form-label">Date début *</label>
                    <input type="date" className="form-control" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Date fin *</label>
                    <input type="date" className="form-control" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} required />
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
        <ConfirmModal isOpen={deleteModal.open} title="Supprimer la réduction"
          message={`Supprimer "${deleteModal.name}" ?`}
          onConfirm={handleDelete} onCancel={() => setDeleteModal({ open: false, id: null, name: '' })} />
      </main>
    </div>
  )
}
export default ClientDiscounts
