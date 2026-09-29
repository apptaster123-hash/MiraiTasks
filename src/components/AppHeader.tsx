import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AppHeader() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Account'

  return (
    <header className="app-header">
      <Link to="/app" className="app-header-brand">
        <div className="brand-logo">M</div>
        MiraiTasks
      </Link>
      <nav className="app-header-nav">
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>
          {displayName}
        </span>
        <Link to="/settings" className="btn btn-ghost btn-sm">Settings</Link>
        <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>Sign Out</button>
      </nav>
    </header>
  )
}
