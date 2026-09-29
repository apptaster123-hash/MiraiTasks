import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="app-header-brand">
          <div className="brand-logo">M</div>
          MiraiTasks
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/signin" className="btn btn-ghost">Sign In</Link>
          <Link to="/signup" className="btn btn-primary">Sign Up</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <h1>Plan your future,<br /><span>one task at a time</span></h1>
        <p>MiraiTasks is a clean, focused to-do list that helps you stay organized with priorities, notes, and due dates — all in one simple place.</p>
        <div className="landing-cta-group">
          <Link to="/signup" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
            Get Started Free
          </Link>
          <Link to="/signin" className="btn btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
            I Already Have an Account
          </Link>
        </div>
      </section>

      <section className="landing-features">
        <div className="feature-card">
          <div className="feature-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3>Tasks</h3>
          <p>Create, complete, and manage your to-dos with a clean, intuitive interface. Filter by status and sort your way.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="13" x2="15" y2="13" />
            </svg>
          </div>
          <h3>Notes</h3>
          <p>Add detailed notes to any task so you never lose context. Keep instructions, ideas, or reminders right where you need them.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3>Due Dates & Priorities</h3>
          <p>Set due dates and priority levels to focus on what matters most. Overdue tasks are highlighted so nothing slips through.</p>
        </div>
      </section>

      <footer className="landing-footer">
        MiraiTasks — Plan your future, one task at a time
      </footer>
    </div>
  )
}
