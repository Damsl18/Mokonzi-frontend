/**
 * LoginClient.jsx — Page de connexion pour les Clients (acheteurs de l'application).
 * Redirige vers /client/dashboard après connexion réussie.
 */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import useAuth from '../hooks/useAuth'

const LoginClient = () => {
  const [form, setForm]       = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate   = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username.trim() || !form.password.trim()) {
      toast.error('Veuillez remplir tous les champs.')
      return
    }
    setLoading(true)
    try {
      const user = await login(form.username.trim(), form.password)
      if (user.role === 'client' || user.role === 'super_admin') {
        toast.success(`Bienvenue, ${user.username} !`)
        navigate('/client/dashboard')
      } else if (user.role === 'worker') {
        toast.info('Compte worker détecté. Redirection...')
        navigate('/worker/dashboard')
      } else {
        toast.error('Rôle non reconnu.')
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
    <div className="login-page" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0f766e 100%)' }}>
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-circle" style={{ background: 'linear-gradient(135deg,#0f766e,#1e3a8a)' }}>📊</div>
          <h2>ETS Mokonzi</h2>
          <p>Espace Client — Administration & Rapports</p>
        </div>

        <form onSubmit={handleSubmit} className="form-mokonzi" noValidate>
          <div className="mb-3">
            <label className="form-label">Nom d'utilisateur</label>
            <div className="input-group">
              <span className="input-group-text" style={{ background: '#f0fdf4', border: '1.5px solid #e2e8f0', borderRight: 'none' }}>
                <i className="bi bi-person-badge" style={{ color: '#0f766e' }} />
              </span>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="Nom d'utilisateur"
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
              <span className="input-group-text" style={{ background: '#f0fdf4', border: '1.5px solid #e2e8f0', borderRight: 'none' }}>
                <i className="bi bi-shield-lock" style={{ color: '#0f766e' }} />
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
                style={{ background: '#f0fdf4', border: '1.5px solid #e2e8f0', borderLeft: 'none', cursor: 'pointer' }}
              >
                <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn w-100 fw-bold py-2"
            disabled={loading}
            style={{ background: 'linear-gradient(90deg,#0f766e,#1e3a8a)', color: '#fff', borderRadius: 9, fontSize: 15 }}
          >
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />Connexion...</>
              : <><i className="bi bi-box-arrow-in-right me-2" />Se connecter</>
            }
          </button>
        </form>

        <p className="text-center mt-4" style={{ fontSize: 13, color: '#64748b' }}>
          Vous êtes un worker ?{' '}
          <Link to="/login-worker" style={{ color: '#0f766e', fontWeight: 600, textDecoration: 'none' }}>
            Accès worker
          </Link>
        </p>
      </div>
    </div>
  )
}
export default LoginClient
