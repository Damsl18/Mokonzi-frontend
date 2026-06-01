/**
 * Sidebar.jsx — avec menu hamburger responsive pour mobile/Android
 */
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const WorkerLinks = () => (
  <>
    <div className="nav-section-title">Principal</div>
    <NavLink to="/worker/dashboard" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
      <i className="bi bi-speedometer2" /> Tableau de bord
    </NavLink>
    <NavLink to="/worker/sales" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
      <i className="bi bi-cart-plus" /> Nouvelle vente
    </NavLink>
    <NavLink to="/worker/invoices" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
      <i className="bi bi-receipt" /> Mes factures
    </NavLink>
    <div className="nav-section-title" style={{ marginTop: 12 }}>Stock</div>
    <NavLink to="/worker/stock" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
      <i className="bi bi-box-seam" /> Réception stock
    </NavLink>
  </>
)

const ClientLinks = () => (
  <>
    <div className="nav-section-title">Principal</div>
    <NavLink to="/client/dashboard" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
      <i className="bi bi-speedometer2" /> Tableau de bord
    </NavLink>
    <div className="nav-section-title" style={{ marginTop: 12 }}>Gestion</div>
    <NavLink to="/client/workers" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
      <i className="bi bi-people" /> Workers
    </NavLink>
    <NavLink to="/client/products" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
      <i className="bi bi-box" /> Produits & Prix
    </NavLink>
    <NavLink to="/client/discounts" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
      <i className="bi bi-tag" /> Réductions
    </NavLink>
    <div className="nav-section-title" style={{ marginTop: 12 }}>Ventes</div>
    <NavLink to="/client/sales" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
      <i className="bi bi-graph-up" /> Toutes les ventes
    </NavLink>
    <NavLink to="/client/invoices" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
      <i className="bi bi-file-earmark-text" /> Factures
    </NavLink>
    <div className="nav-section-title" style={{ marginTop: 12 }}>Rapports</div>
    <NavLink to="/client/reports" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
      <i className="bi bi-bar-chart-line" /> Rapports & Stats
    </NavLink>
  </>
)

const Sidebar = () => {
  const { role, user } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Bouton hamburger — visible uniquement sur mobile */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', top: 14, left: 14, zIndex: 300,
          background: '#2563eb', border: 'none', borderRadius: 10,
          width: 40, height: 40, display: 'none',
          alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 20, cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
        }}
        className="hamburger-btn"
        aria-label="Menu"
      >
        <i className={`bi ${open ? 'bi-x' : 'bi-list'}`} />
      </button>

      {/* Overlay sombre sur mobile quand sidebar ouverte */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            zIndex: 190, display: 'none'
          }}
          className="sidebar-overlay"
        />
      )}

      <aside className={`app-sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">🏪</div>
          <div>
            <div className="logo-text">ETS Mokonzi</div>
            <div className="logo-sub">Gestion de stock</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {role === 'worker' && <WorkerLinks />}
          {(role === 'client' || role === 'super_admin') && <ClientLinks />}
        </nav>
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.username}</div>
              <div style={{ fontSize: 11, opacity: 0.65, textTransform: 'capitalize' }}>{role}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
export default Sidebar
