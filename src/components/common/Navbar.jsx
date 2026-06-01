/**
 * Navbar.jsx
 * Barre de navigation supérieure avec titre de page, alertes et bouton de déconnexion.
 */
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import useAuth from '../../hooks/useAuth'

const Navbar = ({ title = 'ETS Mokonzi', lowStockCount = 0 }) => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const currentRole = user?.role
    await logout()
    toast.info('Vous avez été déconnecté.')
    // FIX F14: rediriger vers la bonne page login selon le rôle
    if (currentRole === 'client' || currentRole === 'super_admin') {
      navigate('/login-client')
    } else {
      navigate('/login-worker')
    }
  }

  return (
    <header className="app-navbar">
      <div className="d-flex align-items-center gap-3">
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1e293b' }}>{title}</h1>
      </div>
      <div className="d-flex align-items-center gap-3">
        {/* Alerte stock faible */}
        {lowStockCount > 0 && (
          <div className="badge-mokonzi badge-warning" style={{ cursor: 'pointer' }}>
            <i className="bi bi-exclamation-triangle" />
            {lowStockCount} alerte{lowStockCount > 1 ? 's' : ''}
          </div>
        )}
        {/* Nom de l'utilisateur */}
        <div style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>
          <i className="bi bi-person-circle me-1" />{user?.username}
        </div>
        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          style={{
            background: '#fee2e2', color: '#ef4444', border: '1.5px solid #fecaca',
            borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          <i className="bi bi-box-arrow-right" /> Déconnexion
        </button>
      </div>
    </header>
  )
}
export default Navbar
