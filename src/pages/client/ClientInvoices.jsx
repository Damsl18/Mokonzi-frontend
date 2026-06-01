/**
 * ClientInvoices.jsx — Vue complète des factures pour le client.
 * Le client peut voir toutes les factures, les marquer comme payées ou émises.
 */
import { useState, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import Spinner from '../../components/common/Spinner'
import { getInvoices, markAsPaid, markAsIssued } from '../../api/invoicesAPI'
import { formatCDF } from '../../utils/formatCurrency'
import { formatDateTime } from '../../utils/formatDate'
import { toast } from 'react-toastify'

const statusLabel = (s) => ({ draft: ['Brouillon','neutral'], issued: ['Émise','info'], paid: ['Payée','success'] }[s] || [s,'neutral'])

const ClientInvoices = () => {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getInvoices()
        setInvoices(Array.isArray(data) ? data : data.results || [])
      } catch { toast.error('Erreur de chargement.') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = invoices.filter(inv => {
    const matchFilter = filter === 'all' || inv.status === filter
    const matchSearch = search === '' || String(inv.id).includes(search) ||
      (inv.worker_name || inv.created_by?.username || '').toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + parseFloat(i.total_amount || i.total || 0), 0)

  const handlePaid = async (id) => {
    try {
      const updated = await markAsPaid(id)
      setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i))
      toast.success('Facture marquée comme payée.')
    } catch { toast.error('Erreur.') }
  }

  const handleIssued = async (id) => {
    try {
      const updated = await markAsIssued(id)
      setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i))
      toast.success('Facture marquée comme émise.')
    } catch { toast.error('Erreur.') }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <Navbar title="Factures" />
      <main className="main-content">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="page-title mb-1">Toutes les factures</h2>
            <p className="page-subtitle mb-0">Total encaissé : <strong style={{color:'#10b981'}}>{formatCDF(totalPaid)}</strong></p>
          </div>
        </div>

        {/* Filtres */}
        <div className="d-flex gap-3 mb-3 flex-wrap">
          <div style={{ maxWidth: 300 }}>
            <input type="text" className="form-control" placeholder="Rechercher par #ID ou worker..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
          </div>
          {['all','draft','issued','paid'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                background: filter === f ? '#2563eb' : '#f1f5f9',
                color: filter === f ? '#fff' : '#475569', border: 'none'
              }}>
              {f === 'all' ? 'Toutes' : f === 'draft' ? 'Brouillons' : f === 'issued' ? 'Émises' : 'Payées'}
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : (
          <div className="card-mokonzi">
            <div className="card-body-mokonzi p-0">
              {filtered.length === 0
                ? <p className="text-secondary text-center py-4">Aucune facture trouvée.</p>
                : (
                  <div className="table-responsive">
                    <table className="table-mokonzi">
                      <thead>
                        <tr><th>#</th><th>Montant</th><th>Notes</th><th>Statut</th><th>Créée par</th><th>Date</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {filtered.map(inv => {
                          const [label, variant] = statusLabel(inv.status)
                          return (
                            <tr key={inv.id}>
                              <td style={{fontSize:12,color:'#94a3b8'}}>#{inv.id}</td>
                              <td><strong style={{color:'#2563eb'}}>{formatCDF(inv.total_amount || inv.total)}</strong></td>
                              <td style={{fontSize:13,color:'#64748b'}}>{inv.notes || '—'}</td>
                              <td><span className={`badge-mokonzi badge-${variant}`}>{label}</span></td>
                              <td style={{fontSize:13}}>{inv.worker_name || '—'}</td>
                              <td style={{fontSize:12,color:'#64748b'}}>{formatDateTime(inv.created_at)}</td>
                              <td>
                                <div className="d-flex gap-2">
                                  {inv.status === 'draft' && (
                                    <button className="btn-edit-mokonzi" onClick={() => handleIssued(inv.id)}>
                                      <i className="bi bi-send" /> Émettre
                                    </button>
                                  )}
                                  {inv.status !== 'paid' && (
                                    <button className="btn-edit-mokonzi" style={{background:'#f0fdf4',color:'#065f46',borderColor:'#a7f3d0'}}
                                      onClick={() => handlePaid(inv.id)}>
                                      <i className="bi bi-check-circle" /> Payée
                                    </button>
                                  )}
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
      </main>
    </div>
  )
}
export default ClientInvoices
