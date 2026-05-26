import { useState, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import AlertBadge from '../../components/common/AlertBadge'
import Spinner from '../../components/common/Spinner'
import { getSalesStatistics, getSales } from '../../api/salesAPI'
import { getLowStockProducts, getProducts } from '../../api/productsAPI'
import { getUsers } from '../../api/usersAPI'
import { formatCDF } from '../../utils/formatCurrency'
import { formatDateTime } from '../../utils/formatDate'
import { toast } from 'react-toastify'

const ClientDashboard = () => {
  const [stats, setStats]       = useState(null)
  const [sales, setSales]       = useState([])
  const [lowStock, setLowStock] = useState([])
  const [products, setProducts] = useState([])
  const [workers, setWorkers]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [st, sal, low, prods, users] = await Promise.all([
          getSalesStatistics(), getSales(), getLowStockProducts(), getProducts(), getUsers()
        ])
        setStats(st)
        setSales((Array.isArray(sal) ? sal : sal.results || []).slice(0, 8))
        setLowStock(Array.isArray(low) ? low : low.results || [])
        setProducts(Array.isArray(prods) ? prods : prods.results || [])
        const all = Array.isArray(users) ? users : users.results || []
        setWorkers(all.filter(u => u.role === 'worker'))
      } catch { toast.error('Erreur de chargement.') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <div className="app-layout">
      <Sidebar />
      <Navbar title="Tableau de bord" lowStockCount={lowStock.length} />
      <main className="main-content">
        <AlertBadge products={lowStock} />
        <h2 className="page-title">Vue d'ensemble — ETS Mokonzi</h2>
        <p className="page-subtitle mb-4">Statistiques et activité globale</p>
        {loading ? <Spinner /> : (
          <>
            {/* KPIs — basés sur sales_statistics : total_sales_count, total_sales_amount */}
            <div className="row g-3 mb-4">
              {[
                { label: 'Total ventes', value: stats?.total_sales_count ?? 0, icon: 'bi-graph-up-arrow', bg: '#eff6ff', color: '#2563eb' },
                { label: 'Chiffre d\'affaires', value: formatCDF(stats?.total_sales_amount ?? 0), icon: 'bi-cash-stack', bg: '#d1fae5', color: '#065f46', small: true },
                { label: 'Quantité vendue', value: stats?.total_quantity_sold ?? 0, icon: 'bi-boxes', bg: '#fef3c7', color: '#92400e' },
                { label: 'Prix moyen/vente', value: formatCDF(stats?.average_sale_price ?? 0), icon: 'bi-calculator', bg: '#fce7f3', color: '#9d174d', small: true },
                { label: 'Produits', value: products.length, icon: 'bi-box', bg: '#ede9fe', color: '#5b21b6' },
                { label: 'Workers actifs', value: workers.length, icon: 'bi-people', bg: '#cffafe', color: '#0e7490' },
              ].map((s, i) => (
                <div className="col-md-4 col-lg-2" key={i}>
                  <div className="stat-card h-100">
                    <div className="stat-icon" style={{ background: s.bg, color: s.color }}><i className={`bi ${s.icon}`} /></div>
                    <div className="stat-value" style={s.small ? { fontSize: 15 } : {}}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row g-4">
              <div className="col-lg-8">
                <div className="card-mokonzi">
                  <div className="card-header-mokonzi">
                    <h5><i className="bi bi-clock-history me-2 text-primary" />Ventes récentes</h5>
                  </div>
                  <div className="card-body-mokonzi p-0">
                    {sales.length === 0
                      ? <p className="text-secondary text-center py-4">Aucune vente.</p>
                      : (
                        <div className="table-responsive">
                          <table className="table-mokonzi">
                            <thead><tr><th>#</th><th>Produit</th><th>Qté</th><th>Total</th><th>Worker</th><th>Date</th></tr></thead>
                            <tbody>
                              {sales.map(s => (
                                <tr key={s.id}>
                                  <td style={{ fontSize: 12, color: '#94a3b8' }}>#{s.id}</td>
                                  <td><strong>{s.product_name}</strong></td>
                                  <td>{s.quantity}</td>
                                  <td><strong style={{ color: '#2563eb' }}>{formatCDF(s.total_price)}</strong></td>
                                  <td style={{ fontSize: 13 }}>{s.worker_username || '—'}</td>
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
              <div className="col-lg-4">
                <div className="card-mokonzi">
                  <div className="card-header-mokonzi">
                    <h5><i className="bi bi-boxes me-2 text-primary" />Stock actuel</h5>
                  </div>
                  <div className="card-body-mokonzi">
                    {products.map(p => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{formatCDF(p.current_price || p.price)}</div>
                        </div>
                        <span className={`badge-mokonzi ${p.quantity_in_stock === 0 ? 'badge-danger' : p.quantity_in_stock < 10 ? 'badge-warning' : 'badge-success'}`}>
                          {p.quantity_in_stock} u.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
export default ClientDashboard
