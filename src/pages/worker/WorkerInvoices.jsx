/**
 * WorkerInvoices.jsx
 * Le worker peut créer des factures à partir de ses ventes et les consulter.
 */
import { useState, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import Spinner from '../../components/common/Spinner'
import { getInvoices, createInvoice, markAsPaid } from '../../api/invoicesAPI'
import { getSales } from '../../api/salesAPI'
import { formatCDF } from '../../utils/formatCurrency'
import { formatDateTime } from '../../utils/formatDate'
import { toast } from 'react-toastify'

const statusLabel = (status) => {
  const map = { draft: ['Brouillon', 'neutral'], issued: ['Émise', 'info'], paid: ['Payée', 'success'] }
  return map[status] || [status, 'neutral']
}

const WorkerInvoices = () => {
  const [invoices, setInvoices]     = useState([])
  const [sales, setSales]           = useState([])
  const [selectedSales, setSelectedSales] = useState([])
  const [notes, setNotes]           = useState('')
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [inv, sal] = await Promise.all([getInvoices(), getSales()])
        const invArr = Array.isArray(inv) ? inv : inv.results || []
        setInvoices(invArr)
        // Ventes sans facture uniquement
        const allSales = Array.isArray(sal) ? sal : sal.results || []
        // FIX F8: exclure les ventes déjà dans une facture
        const invoicedIds = new Set()
        invArr.forEach(inv => {
          if (inv.sales) inv.sales.forEach(s => invoicedIds.add(s.id || s))
        })
        setSales(allSales.filter(s => !invoicedIds.has(s.id)))
      } catch { toast.error('Erreur de chargement.') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const toggleSale = (id) => {
    setSelectedSales(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleCreate = async () => {
    if (selectedSales.length === 0) { toast.error('Sélectionnez au moins une vente.'); return }
    setSubmitting(true)
    try {
      const inv = await createInvoice({ sales: selectedSales, notes })
      setInvoices([inv, ...invoices])
      setSales(prev => prev.filter(s => !selectedSales.includes(s.id)))
      setSelectedSales([])
      setNotes('')
      toast.success('Facture créée avec succès !')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur lors de la création.')
    } finally { setSubmitting(false) }
  }

  const handleMarkPaid = async (id) => {
    try {
      const updated = await markAsPaid(id)
      setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i))
      toast.success('Facture marquée comme payée.')
    } catch { toast.error('Erreur.') }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <Navbar title="Factures" />
      <main className="main-content">
        <h2 className="page-title">Gestion des factures</h2>
        <p className="page-subtitle">Créez des factures à partir de vos ventes</p>

        {loading ? <Spinner /> : (
          <div className="row g-4">
            {/* Créer une facture */}
            <div className="col-lg-5">
              <div className="card-mokonzi">
                <div className="card-header-mokonzi">
                  <h5><i className="bi bi-file-earmark-plus me-2 text-primary" />Nouvelle facture</h5>
                </div>
                <div className="card-body-mokonzi">
                  {sales.length === 0
                    ? <p className="text-secondary text-center py-3">Toutes vos ventes ont déjà une facture.</p>
                    : (
                      <>
                        <div className="mb-3">
                          <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Sélectionnez les ventes</label>
                          <div style={{ maxHeight: 200, overflowY: 'auto', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: 8 }}>
                            {sales.map(s => (
                              <div key={s.id} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '8px 6px', borderRadius: 6, cursor: 'pointer',
                                background: selectedSales.includes(s.id) ? '#eff6ff' : 'transparent'
                              }} onClick={() => toggleSale(s.id)}>
                                <input type="checkbox" readOnly checked={selectedSales.includes(s.id)}
                                  style={{ accentColor: '#2563eb', cursor: 'pointer' }} />
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                                    #{s.id} — {s.product_name || s.product?.name}
                                  </div>
                                  <div style={{ fontSize: 12, color: '#64748b' }}>
                                    {s.quantity} unité(s) — {formatCDF(s.total_price || s.total)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mb-3 form-mokonzi">
                          <label className="form-label">Notes (optionnel)</label>
                          <textarea className="form-control" rows={2} placeholder="Ex: Vente du matin"
                            value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>
                        <button className="btn-primary-mokonzi w-100 justify-content-center" onClick={handleCreate} disabled={submitting}>
                          {submitting
                            ? <><span className="spinner-border spinner-border-sm me-2" />Création...</>
                            : <><i className="bi bi-file-earmark-check me-2" />Créer la facture</>
                          }
                        </button>
                      </>
                    )
                  }
                </div>
              </div>
            </div>

            {/* Liste des factures */}
            <div className="col-lg-7">
              <div className="card-mokonzi">
                <div className="card-header-mokonzi">
                  <h5><i className="bi bi-receipt me-2 text-primary" />Mes factures</h5>
                  <span className="badge-mokonzi badge-info">{invoices.length}</span>
                </div>
                <div className="card-body-mokonzi p-0">
                  {invoices.length === 0
                    ? <p className="text-secondary text-center py-4">Aucune facture.</p>
                    : (
                      <div className="table-responsive">
                        <table className="table-mokonzi">
                          <thead>
                            <tr><th>#</th><th>Montant</th><th>Statut</th><th>Date</th><th>Action</th></tr>
                          </thead>
                          <tbody>
                            {invoices.map(inv => {
                              const [label, variant] = statusLabel(inv.status)
                              return (
                                <tr key={inv.id}>
                                  <td style={{ fontSize: 12, color: '#94a3b8' }}>#{inv.id}</td>
                                  <td><strong style={{ color: '#2563eb' }}>{formatCDF(inv.total_amount || inv.total)}</strong></td>
                                  <td><span className={`badge-mokonzi badge-${variant}`}>{label}</span></td>
                                  <td style={{ fontSize: 12, color: '#64748b' }}>{formatDateTime(inv.created_at)}</td>
                                  <td>
                                    {inv.status !== 'paid' && (
                                      <button className="btn-edit-mokonzi" onClick={() => handleMarkPaid(inv.id)}>
                                        <i className="bi bi-check" /> Payée
                                      </button>
                                    )}
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
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
export default WorkerInvoices
