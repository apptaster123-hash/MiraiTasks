import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignUpPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address'
    if (password.length < 8) e.password = 'Password must be at least 8 characters'
    else if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) e.password = 'Password must contain at least one letter and one number'
    if (confirm !== password) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!validate()) return
    setLoading(true)
    const { error } = await signUp(email.trim(), password, name.trim())
    setLoading(false)
    if (error) {
      setFormError(error)
    } else {
      navigate('/app')
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-card-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <div className="app-header-brand">
              <div className="brand-logo">M</div>
              MiraiTasks
            </div>
          </div>
          <h1>Create your account</h1>
          <p>Start organizing your tasks today</p>
        </div>

        {formError && <div className="auth-alert">{formError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              className={`form-input ${errors.name ? 'form-input-error' : ''}`}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              required
              autoComplete="name"
              autoFocus
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={`form-input ${errors.password ? 'form-input-error' : ''}`}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
            />
            {errors.password ? (
              <div className="form-error">{errors.password}</div>
            ) : (
              <div className="form-hint">At least 8 characters with one letter and one number</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              type="password"
              className={`form-input ${errors.confirm ? 'form-input-error' : ''}`}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
            />
            {errors.confirm && <div className="form-error">{errors.confirm}</div>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/signin">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
