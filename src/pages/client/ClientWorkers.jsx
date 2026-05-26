/**
 * ClientWorkers.jsx
 * CRUD complet des workers : ajouter, modifier, supprimer, voir les activités.
 */
import { useState, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import Spinner from '../../components/common/Spinner'
import ConfirmModal from '../../components/common/ConfirmModal'
import { getUsers, updateUser, deleteUser } from '../../api/usersAPI'
import { register } from '../../api/authAPI'
import { formatDateTime } from '../../utils/formatDate'
import { toast } from 'react-toastify'

const emptyForm = { username: '', password: '', email: '', first_name: '', last_name: '' }

const ClientWorkers = () => {
  const [workers, setWorkers]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editMode, setEditMode]   = useState(false)
  const [editId, setEditId]       = useState(null)
  const [form, setForm]           = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' })

  const load = async () => {
    try {
      const users = await getUsers()
      const all = Array.isArray(users) ? users : users.results || []
      setWorkers(all.filter(u => u.role === 'worker'))
    } catch { toast.error('Erreur de chargement.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const openAdd = () => { setForm(emptyForm); setEditMode(false); setEditId(null); setShowForm(true) }
  const openEdit = (w) => {
    setForm({ username: w.username, password: '', email: w.email || '', first_name: w.first_name || '', last_name: w.last_name || '' })
    setEditMode(true); setEditId(w.id); setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setForm(emptyForm) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username.trim()) { toast.error('Le nom d\'utilisateur est requis.'); return }
    if (!editMode && !form.password.trim()) { toast.error('Le mot de passe est requis.'); return }
    if (!editMode && form.password.length < 6) { toast.error('Mot de passe minimum 6 caractères.'); return }
    setSubmitting(true)
    try {
      if (editMode) {
        const payload = { username: form.username, email: form.email, first_name: form.first_name, last_name: form.last_name }
        if (form.password.trim()) payload.password = form.password
        await updateUser(editId, payload)
        toast.success('Worker mis à jour.')
      } else {
        await register({ ...form, role: 'worker' })
        toast.success('Worker créé avec succès.')
      }
      closeForm(); await load()
    } catch (err) {
      const data = err.response?.data
      const msg = data?.username?.[0] || data?.password?.[0] || data?.detail || 'Erreur.'
      toast.error(msg)
    } finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    try {
      await deleteUser(deleteModal.id)
      setWorkers(prev => prev.filter(w => w.id !== deleteModal.id))
      toast.success('Worker supprimé.')
    } catch { toast.error('Erreur lors de la suppression.') }
    finally { setDeleteModal({ open: false, id: null, name: '' }) }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <Navbar title="Gestion des Workers" />
      <main className="main-content">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="page-title mb-1">Workers</h2>
            <p className="page-subtitle mb-0">{workers.length} worker{workers.length > 1 ? 's' : ''} enregistré{workers.length > 1 ? 's' : ''}</p>
          </div>
          <button className="btn-primary-mokonzi" onClick={openAdd}>
            <i className="bi bi-person-plus" /> Ajouter un worker
          </button>
        </div>

        {loading ? <Spinner /> : (
          <div className="card-mokonzi">
            <div className="card-body-mokonzi p-0">
              {workers.length === 0
                ? (
                  <div className="text-center py-5">
                    <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
                    <p className="text-secondary">Aucun worker enregistré. Cliquez sur "Ajouter un worker".</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table-mokonzi">
                      <thead>
                        <tr><th>Nom d'utilisateur</th><th>Nom complet</th><th>Email</th><th>Inscrit le</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {workers.map(w => (
                          <tr key={w.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 34, height: 34, borderRadius: 8,
                                  background: '#eff6ff', color: '#2563eb',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontWeight: 700, fontSize: 15
                                }}>{w.username[0].toUpperCase()}</div>
                                <strong>{w.username}</strong>
                              </div>
                            </td>
                            <td>{`${w.first_name || ''} ${w.last_name || ''}`.trim() || '—'}</td>
                            <td style={{ color: '#64748b', fontSize: 13 }}>{w.email || '—'}</td>
                            <td style={{ color: '#64748b', fontSize: 13 }}>{formatDateTime(w.date_joined)}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <button className="btn-edit-mokonzi" onClick={() => openEdit(w)}>
                                  <i className="bi bi-pencil" /> Modifier
                                </button>
                                <button className="btn-danger-mokonzi" onClick={() => setDeleteModal({ open: true, id: w.id, name: w.username })}>
                                  <i className="bi bi-trash" /> Supprimer
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

        {/* Modal formulaire */}
        {showForm && (
          <div className="modal-overlay" onClick={closeForm}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h5 style={{ fontWeight: 700, marginBottom: 20 }}>
                {editMode ? 'Modifier le worker' : 'Ajouter un worker'}
              </h5>
              <form onSubmit={handleSubmit} className="form-mokonzi">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Nom d'utilisateur *</label>
                    <input type="text" name="username" className="form-control" placeholder="worker3"
                      value={form.username} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Prénom</label>
                    <input type="text" name="first_name" className="form-control" placeholder="Jean"
                      value={form.first_name} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Nom de famille</label>
                    <input type="text" name="last_name" className="form-control" placeholder="Mokonzi"
                      value={form.last_name} onChange={handleChange} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" className="form-control" placeholder="worker@mokonzi.com"
                      value={form.email} onChange={handleChange} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">{editMode ? 'Nouveau mot de passe (laisser vide = inchangé)' : 'Mot de passe *'}</label>
                    <input type="password" name="password" className="form-control" placeholder="••••••••"
                      value={form.password} onChange={handleChange} required={!editMode} minLength={6} />
                  </div>
                </div>
                <div className="d-flex gap-3 mt-4 justify-content-end">
                  <button type="button" className="btn btn-light fw-semibold" onClick={closeForm} style={{ borderRadius: 8 }}>Annuler</button>
                  <button type="submit" className="btn-primary-mokonzi" disabled={submitting}>
                    {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Enregistrement...</> : editMode ? 'Mettre à jour' : 'Créer le worker'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={deleteModal.open}
          title="Supprimer le worker"
          message={`Êtes-vous sûr de vouloir supprimer "${deleteModal.name}" ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal({ open: false, id: null, name: '' })}
        />
      </main>
    </div>
  )
}
export default ClientWorkers
