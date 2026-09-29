import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoMark from '../assets/brand/logo-mark.svg'

export default function AppHeader() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Account'

  const tabs = [
    { to: '/app', label: 'Tasks' },
    { to: '/insights', label: 'Insights' },
    { to: '/settings', label: 'Settings' },
  ]

  return (
    <header className="app-header">
      <Link to="/app" className="app-header-brand">
        <img src={logoMark} alt="MiraiTasks" className="brand-mark" />
        <span className="brand-wordmark">
          <span>Mirai</span><span className="gold-text">Tasks</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <nav className="app-header-tabs">
          {tabs.map(tab => (
            <Link
              key={tab.to}
              to={tab.to}
              className={`header-tab ${location.pathname === tab.to ? 'active' : ''}`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <span className="header-username">{displayName}</span>
        <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>Sign Out</button>
      </div>
    </header>
  )
}
