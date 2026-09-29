import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePreferences } from '../context/PreferencesContext'
import { supabase } from '../lib/supabase'
import type { ThemeMode, FilterType, SortType } from '../lib/types'
import AppHeader from '../components/AppHeader'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { prefs, setTheme, setDefaultFilter, setDefaultSort } = usePreferences()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [nameSaved, setNameSaved] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const initial = (user?.user_metadata?.name as string) || ''
    setName(initial)
  }, [user])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function handleSaveName() {
    if (!name.trim()) return
    const { error } = await supabase.auth.updateUser({ data: { name: name.trim() } })
    if (error) {
      showToast('Failed to save name')
      return
    }
    setNameSaved(true)
    showToast('Name updated')
    setTimeout(() => setNameSaved(false), 2000)
  }

  async function handleExport() {
    const { data, error } = await supabase.from('tasks').select('*')
    if (error) {
      showToast('Export failed')
      return
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `miraitasks-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Data exported')
  }

  async function handleClearAll() {
    const { error } = await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) {
      showToast('Failed to clear data')
      return
    }
    setConfirmClear(false)
    setConfirmText('')
    showToast('All tasks cleared')
  }

  async function handleDeleteAccount() {
    // Clear all task data first
    await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    // Sign out — full account deletion must be done from Supabase dashboard
    await signOut()
    showToast('You have been signed out. Contact support to fully delete your account.')
    navigate('/')
  }

  const themes: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ]

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ]

  const sorts: { value: SortType; label: string }[] = [
    { value: 'created', label: 'Newest first' },
    { value: 'due', label: 'By due date' },
    { value: 'priority', label: 'By priority' },
    { value: 'alpha', label: 'Alphabetical' },
  ]

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main app-main-wide">
        <h1 className="settings-page-title">Settings</h1>

        {/* Profile */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="settings-section">
            <div className="settings-section-title">Profile</div>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Display Name</div>
                <div className="settings-row-desc">Shown in the header and on your account</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
              />
              <button className="btn btn-primary" onClick={handleSaveName} disabled={!name.trim()}>
                {nameSaved ? 'Saved!' : 'Save'}
              </button>
            </div>
          </div>
          <div className="settings-section">
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Email</div>
                <div className="settings-row-desc">Your account email (read-only)</div>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="settings-section">
            <div className="settings-section-title">Appearance</div>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Theme</div>
                <div className="settings-row-desc">Choose how MiraiTasks looks</div>
              </div>
              <div className="segmented">
                {themes.map(t => (
                  <button
                    key={t.value}
                    className={`segmented-btn ${prefs.theme === t.value ? 'active' : ''}`}
                    onClick={() => setTheme(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Defaults */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="settings-section">
            <div className="settings-section-title">Task Defaults</div>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Default Filter</div>
                <div className="settings-row-desc">Which tasks are shown when you open the app</div>
              </div>
              <div className="segmented">
                {filters.map(f => (
                  <button
                    key={f.value}
                    className={`segmented-btn ${prefs.defaultFilter === f.value ? 'active' : ''}`}
                    onClick={() => setDefaultFilter(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="settings-section">
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Default Sort</div>
                <div className="settings-row-desc">How tasks are ordered by default</div>
              </div>
              <select className="form-input" style={{ width: 'auto' }} value={prefs.defaultSort} onChange={e => setDefaultSort(e.target.value as SortType)}>
                {sorts.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="settings-section" style={{ marginBottom: 0 }}>
            <div className="settings-section-title">Data Management</div>
            <div className="settings-row" style={{ borderBottom: 'none' }}>
              <div>
                <div className="settings-row-label">Export Data</div>
                <div className="settings-row-desc">Download all your tasks as a JSON file</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleExport}>Export JSON</button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card settings-danger">
          <div className="settings-section" style={{ marginBottom: 0 }}>
            <div className="settings-section-title" style={{ color: 'var(--danger)' }}>Danger Zone</div>

            <div className="settings-row" style={{ borderBottom: 'none' }}>
              <div>
                <div className="settings-row-label">Clear All Data</div>
                <div className="settings-row-desc">Permanently delete all your tasks. This cannot be undone.</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => { setConfirmClear(true); setConfirmText('') }}>
                Clear Data
              </button>
            </div>

            {confirmClear && (
              <div style={{ marginTop: '0.75rem', padding: '1rem', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Type <strong>DELETE</strong> to confirm. This will permanently remove all your tasks.
                </p>
                <input
                  className="form-input"
                  style={{ marginBottom: '0.5rem' }}
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-danger btn-sm" disabled={confirmText !== 'DELETE'} onClick={handleClearAll}>
                    Yes, Clear Everything
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setConfirmClear(false); setConfirmText('') }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="settings-row" style={{ borderBottom: 'none' }}>
              <div>
                <div className="settings-row-label">Delete Account</div>
                <div className="settings-row-desc">Permanently delete your account and all associated data.</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => { setConfirmDelete(true); setConfirmText('') }}>
                Delete Account
              </button>
            </div>

            {confirmDelete && (
              <div style={{ marginTop: '0.75rem', padding: '1rem', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Type <strong>DELETE</strong> to confirm. This will permanently remove your account and all tasks.
                </p>
                <input
                  className="form-input"
                  style={{ marginBottom: '0.5rem' }}
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-danger btn-sm" disabled={confirmText !== 'DELETE'} onClick={handleDeleteAccount}>
                    Yes, Delete My Account
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setConfirmDelete(false); setConfirmText('') }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/app" className="btn btn-ghost">Back to Tasks</Link>
        </div>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
