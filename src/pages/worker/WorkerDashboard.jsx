import { useState, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import AlertBadge from '../../components/common/AlertBadge'
import Spinner from '../../components/common/Spinner'
import { getTodaySales } from '../../api/salesAPI'
import { getProducts, getLowStockProducts } from '../../api/productsAPI'
import { formatCDF } from '../../utils/formatCurrency'
import { formatDateTime } from '../../utils/formatDate'
import { toast } from 'react-toastify'
import useAuth from '../../hooks/useAuth'

const WorkerDashboard = () => {
  const { user } = useAuth()
  const [todaySales, setTodaySales] = useState([])
  const [products, setProducts]     = useState([])
  const [lowStock, setLowStock]     = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [sales, prods, low] = await Promise.all([
          getTodaySales(), getProducts(), getLowStockProducts()
        ])
        setTodaySales(Array.isArray(sales) ? sales : sales.results || [])
        setProducts(Array.isArray(prods) ? prods : prods.results || [])
        setLowStock(Array.isArray(low) ? low : low.results || [])
      } catch { toast.error('Erreur de chargement.') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const totalToday = todaySales.reduce((s, x) => s + parseFloat(x.total_price || 0), 0)

  return (
    <div className="app-layout">
      <Sidebar />
      <Navbar title="Tableau de bord" lowStockCount={lowStock.length} />
      <main className="main-content">
        <AlertBadge products={lowStock} />
        <div className="mb-4">
          <h2 className="page-title">Bonjour, {user?.username} 👋</h2>
          <p className="page-subtitle">Résumé de votre journée</p>
        </div>
        {loading ? <Spinner /> : (
          <>
            <div className="row g-3 mb-4">
              {[
                { label: 'Ventes aujourd\'hui', value: todaySales.length, icon: 'bi-cart-check', bg: '#eff6ff', color: '#2563eb' },
                { label: 'Recette du jour', value: formatCDF(totalToday), icon: 'bi-cash-stack', bg: '#d1fae5', color: '#065f46', small: true },
                { label: 'Alertes stock', value: lowStock.length, icon: 'bi-box-seam', bg: lowStock.length ? '#fef3c7' : '#d1fae5', color: lowStock.length ? '#92400e' : '#065f46' },
              ].map((s, i) => (
                <div className="col-md-4" key={i}>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: s.bg, color: s.color }}><i className={`bi ${s.icon}`} /></div>
                    <div className="stat-value" style={s.small ? { fontSize: 18 } : {}}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Prix du jour */}
            <div className="card-mokonzi mb-4">
              <div className="card-header-mokonzi">
                <h5><i className="bi bi-tag me-2 text-primary" />Prix du jour</h5>
              </div>
              <div className="card-body-mokonzi">
                <div className="row g-3">
                  {products.map(p => (
                    <div className="col-md-4" key={p.id}>
                      <div style={{ background: '#f8faff', borderRadius: 10, padding: 16, border: '1.5px solid #e9f0ff' }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>{p.description || '—'}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#2563eb', marginTop: 6 }}>
                          {formatCDF(p.current_price || p.price)}
                        </div>
                        <div style={{ fontSize: 12, color: p.quantity_in_stock < 10 ? '#ef4444' : '#065f46' }}>
                          Stock : <strong>{p.quantity_in_stock}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ventes du jour */}
            <div className="card-mokonzi">
              <div className="card-header-mokonzi">
                <h5><i className="bi bi-list-check me-2 text-primary" />Mes ventes d'aujourd'hui</h5>
                <span className="badge-mokonzi badge-info">{todaySales.length}</span>
              </div>
              <div className="card-body-mokonzi p-0">
                {todaySales.length === 0
                  ? <p className="text-secondary text-center py-4">Aucune vente aujourd'hui.</p>
                  : (
                    <div className="table-responsive">
                      <table className="table-mokonzi">
                        <thead><tr><th>Produit</th><th>Qté</th><th>Prix unit.</th><th>Total</th><th>Date</th></tr></thead>
                        <tbody>
                          {todaySales.map(s => (
                            <tr key={s.id}>
                              <td><strong>{s.product_name}</strong></td>
                              <td>{s.quantity}</td>
                              <td>{formatCDF(s.unit_price)}</td>
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
          </>
        )}
      </main>
    </div>
  )
}
export default WorkerDashboard
