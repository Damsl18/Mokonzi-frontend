/**
 * ClientReports.jsx — corrigé selon les vues réelles
 * weekly    : { week_start, week_end, total_sales, total_quantity, average_daily_sales, daily_breakdown[] }
 * daily     : [{ report_date, total_sales_count, total_sales_amount, total_quantity_sold }]
 * average   : { period, total_sales, total_sales_count, average_sale_price, average_sales_per_day }
 * statistics: { total_sales_count, total_sales_amount, total_quantity_sold, average_sale_price }
 */
import { useState, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import Spinner from '../../components/common/Spinner'
import { getWeeklyReport, getDailyReport, getAverageSales } from '../../api/reportsAPI'
import { getSalesStatistics } from '../../api/salesAPI'
import { formatCDF } from '../../utils/formatCurrency'
import { formatDateShort } from '../../utils/formatDate'
import { exportWeeklyReportPDF } from '../../utils/pdfExport'
import { toast } from 'react-toastify'

const ClientReports = () => {
  const [weekly, setWeekly]   = useState(null)
  const [daily, setDaily]     = useState([])
  const [average, setAverage] = useState(null)
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [activeTab, setActiveTab] = useState('weekly')

  useEffect(() => {
    const load = async () => {
      try {
        const [w, d, avg, st] = await Promise.all([
          getWeeklyReport(), getDailyReport(), getAverageSales(), getSalesStatistics()
        ])
        setWeekly(w)
        setDaily(Array.isArray(d) ? d : d.results || [])
        setAverage(avg)
        setStats(st)
      } catch { toast.error('Erreur de chargement des rapports.') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleExportPDF = async () => {
    if (!weekly) { toast.error('Données non disponibles.'); return }
    setExporting(true)
    try { exportWeeklyReportPDF(weekly); toast.success('PDF généré !') }
    catch { toast.error('Erreur PDF.') }
    finally { setExporting(false) }
  }

  const Tab = ({ id, label, icon }) => (
    <button onClick={() => setActiveTab(id)} style={{
      padding: '10px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
      background: activeTab === id ? '#2563eb' : '#f1f5f9',
      color: activeTab === id ? '#fff' : '#475569', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 7
    }}>
      <i className={`bi ${icon}`} /> {label}
    </button>
  )

  return (
    <div className="app-layout">
      <Sidebar />
      <Navbar title="Rapports & Statistiques" />
      <main className="main-content">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="page-title mb-1">Rapports & Statistiques</h2>
            <p className="page-subtitle mb-0">Analyse des performances</p>
          </div>
          <button className="btn-primary-mokonzi" onClick={handleExportPDF} disabled={exporting || loading}>
            {exporting ? <><span className="spinner-border spinner-border-sm me-2" />Génération...</> : <><i className="bi bi-file-earmark-pdf" /> Exporter PDF</>}
          </button>
        </div>

        <div className="d-flex gap-2 mb-4 flex-wrap">
          <Tab id="weekly" label="Hebdomadaire" icon="bi-calendar-week" />
          <Tab id="daily"  label="Journalier" icon="bi-calendar-day" />
          <Tab id="stats"  label="Statistiques" icon="bi-bar-chart-line" />
        </div>

        {loading ? <Spinner /> : (
          <>
            {/* ── HEBDOMADAIRE ── */}
            {activeTab === 'weekly' && weekly && (
              <>
                <div className="row g-3 mb-4">
                  {[
                    { label: 'Total ventes (semaine)', value: formatCDF(weekly.total_sales ?? 0), icon: 'bi-cash-stack', bg: '#d1fae5', color: '#065f46', small: true },
                    { label: 'Quantité vendue', value: weekly.total_quantity ?? 0, icon: 'bi-boxes', bg: '#eff6ff', color: '#2563eb' },
                    { label: 'Moyenne journalière', value: formatCDF(weekly.average_daily_sales ?? 0), icon: 'bi-activity', bg: '#fef3c7', color: '#92400e', small: true },
                  ].map((s, i) => (
                    <div className="col-md-4" key={i}>
                      <div className="stat-card">
                        <div className="stat-icon" style={{ background: s.bg, color: s.color }}><i className={`bi ${s.icon}`} /></div>
                        <div className="stat-value" style={s.small ? { fontSize: 17 } : {}}>{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card-mokonzi">
                  <div className="card-header-mokonzi">
                    <h5><i className="bi bi-table me-2 text-primary" />Détail journalier</h5>
                    <span style={{ fontSize: 13, color: '#64748b' }}>
                      {weekly.week_start && `${formatDateShort(weekly.week_start)} → ${formatDateShort(weekly.week_end)}`}
                    </span>
                  </div>
                  <div className="card-body-mokonzi p-0">
                    {(!weekly.daily_breakdown || weekly.daily_breakdown.length === 0)
                      ? <p className="text-secondary text-center py-4">Aucune donnée cette semaine.</p>
                      : (
                        <div className="table-responsive">
                          <table className="table-mokonzi">
                            <thead><tr><th>Date</th><th>Nb ventes</th><th>CA</th><th>Quantité</th></tr></thead>
                            <tbody>
                              {weekly.daily_breakdown.map((d, i) => (
                                <tr key={i}>
                                  <td>{formatDateShort(d.report_date)}</td>
                                  <td>{d.total_sales_count}</td>
                                  <td><strong style={{ color: '#2563eb' }}>{formatCDF(d.total_sales_amount)}</strong></td>
                                  <td>{d.total_quantity_sold}</td>
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

            {/* ── JOURNALIER ── */}
            {activeTab === 'daily' && (
              <div className="card-mokonzi">
                <div className="card-header-mokonzi">
                  <h5><i className="bi bi-calendar-day me-2 text-primary" />Rapports journaliers</h5>
                </div>
                <div className="card-body-mokonzi p-0">
                  {daily.length === 0
                    ? <p className="text-secondary text-center py-4">Aucun rapport journalier.</p>
                    : (
                      <div className="table-responsive">
                        <table className="table-mokonzi">
                          <thead><tr><th>Date</th><th>Ventes</th><th>CA</th><th>Quantité</th><th>Prix moyen</th></tr></thead>
                          <tbody>
                            {daily.map((d, i) => (
                              <tr key={i}>
                                <td>{formatDateShort(d.report_date)}</td>
                                <td>{d.total_sales_count}</td>
                                <td><strong style={{ color: '#2563eb' }}>{formatCDF(d.total_sales_amount)}</strong></td>
                                <td>{d.total_quantity_sold}</td>
                                <td>{formatCDF(d.average_sale_price)}</td>
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

            {/* ── STATISTIQUES ── */}
            {activeTab === 'stats' && (
              <div className="row g-4">
                <div className="col-lg-6">
                  <div className="card-mokonzi">
                    <div className="card-header-mokonzi">
                      <h5><i className="bi bi-bar-chart me-2 text-primary" />Statistiques globales</h5>
                    </div>
                    <div className="card-body-mokonzi">
                      {stats && [
                        { label: 'Total des ventes', value: stats.total_sales_count ?? 0 },
                        { label: 'Chiffre d\'affaires total', value: formatCDF(stats.total_sales_amount ?? 0) },
                        { label: 'Quantité totale vendue', value: stats.total_quantity_sold ?? 0 },
                        { label: 'Prix moyen par vente', value: formatCDF(stats.average_sale_price ?? 0) },
                      ].map((row, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: 14, color: '#64748b' }}>{row.label}</span>
                          <strong style={{ fontSize: 15 }}>{row.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="card-mokonzi">
                    <div className="card-header-mokonzi">
                      <h5><i className="bi bi-activity me-2 text-primary" />Moyennes (7 derniers jours)</h5>
                    </div>
                    <div className="card-body-mokonzi">
                      {average && [
                        { label: 'Période', value: average.period },
                        { label: 'Total ventes', value: formatCDF(average.total_sales) },
                        { label: 'Nombre de ventes', value: average.total_sales_count },
                        { label: 'Prix moyen', value: formatCDF(average.average_sale_price) },
                        { label: 'Moyenne/jour', value: formatCDF(average.average_sales_per_day) },
                      ].map((row, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: 14, color: '#64748b' }}>{row.label}</span>
                          <strong style={{ fontSize: 15 }}>{row.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
export default ClientReports
