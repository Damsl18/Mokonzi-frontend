/**
 * Sidebar.jsx
 * Barre latérale de navigation, adaptée selon le rôle (worker / client / super_admin).
 */
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

  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">🏪</div>
        <div>
          <div className="logo-text">ETS Mokonzi</div>
          <div className="logo-sub">Gestion de stock</div>
        </div>
      </div>

      {/* Liens selon le rôle */}
      <nav className="sidebar-nav">
        {(role === 'worker') && <WorkerLinks />}
        {(role === 'client' || role === 'super_admin') && <ClientLinks />}
      </nav>

      {/* Info utilisateur en bas */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700
          }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.username}</div>
            <div style={{ fontSize: 11, opacity: 0.65, textTransform: 'capitalize' }}>{role}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
export default Sidebar
