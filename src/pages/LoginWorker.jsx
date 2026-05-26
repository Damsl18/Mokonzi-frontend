/**
 * LoginWorker.jsx — Page de connexion pour les Workers.
 * Redirige vers /worker/dashboard après connexion réussie.
 */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import useAuth from '../hooks/useAuth'

const LoginWorker = () => {
  const [form, setForm]       = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate   = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Validation basique côté client
    if (!form.username.trim() || !form.password.trim()) {
      toast.error('Veuillez remplir tous les champs.')
      return
    }
    setLoading(true)
    try {
      const user = await login(form.username.trim(), form.password)
      if (user.role === 'worker') {
        toast.success(`Bienvenue, ${user.username} !`)
        navigate('/worker/dashboard')
      } else if (user.role === 'client' || user.role === 'super_admin') {
        toast.info('Compte client détecté. Redirection...')
        navigate('/client/dashboard')
      } else {
        toast.error('Rôle non reconnu. Contactez l\'administrateur.')
      }
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0]
        || err.response?.data?.detail
        || 'Identifiants incorrects.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-circle">🏪</div>
          <h2>ETS Mokonzi</h2>
          <p>Espace Worker — Gestion des ventes</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="form-mokonzi" noValidate>
          <div className="mb-3">
            <label className="form-label">Nom d'utilisateur</label>
            <div className="input-group">
              <span className="input-group-text" style={{ background: '#f0f4ff', border: '1.5px solid #e2e8f0', borderRight: 'none' }}>
                <i className="bi bi-person" style={{ color: '#2563eb' }} />
              </span>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="worker1"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                disabled={loading}
                style={{ borderLeft: 'none', borderRadius: '0 8px 8px 0' }}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Mot de passe</label>
            <div className="input-group">
              <span className="input-group-text" style={{ background: '#f0f4ff', border: '1.5px solid #e2e8f0', borderRight: 'none' }}>
                <i className="bi bi-lock" style={{ color: '#2563eb' }} />
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading}
                style={{ borderLeft: 'none', borderRight: 'none', borderRadius: 0 }}
              />
              <button
                type="button"
                className="input-group-text"
                onClick={() => setShowPass(!showPass)}
                style={{ background: '#f0f4ff', border: '1.5px solid #e2e8f0', borderLeft: 'none', cursor: 'pointer' }}
              >
                <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} style={{ color: '#64748b' }} />
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary-mokonzi w-100 justify-content-center" disabled={loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />Connexion...</>
              : <><i className="bi bi-box-arrow-in-right" /> Se connecter</>
            }
          </button>
        </form>

        {/* Lien vers login client */}
        <p className="text-center mt-4" style={{ fontSize: 13, color: '#64748b' }}>
          Vous êtes un client ?{' '}
          <Link to="/login-client" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
            Accès client
          </Link>
        </p>
      </div>
    </div>
  )
}
export default LoginWorker
