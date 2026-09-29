import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import AppPage from './pages/AppPage'
import SettingsPage from './pages/SettingsPage'

const InsightsPage = lazy(() => import('./pages/InsightsPage'))

function LoadingScreen() {
  return (
    <div className="loading-page">
      <div className="spinner" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/signin" replace />
  return <>{children}</>
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/app" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={
        <PublicOnlyRoute>
          <LandingPage />
        </PublicOnlyRoute>
      } />
      <Route path="/signin" element={
        <PublicOnlyRoute>
          <SignInPage />
        </PublicOnlyRoute>
      } />
      <Route path="/signup" element={
        <PublicOnlyRoute>
          <SignUpPage />
        </PublicOnlyRoute>
      } />
      <Route path="/app" element={
        <ProtectedRoute>
          <AppPage />
        </ProtectedRoute>
      } />
      <Route path="/insights" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingScreen />}>
            <InsightsPage />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
