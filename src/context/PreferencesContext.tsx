import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { UserPreferences, ThemeMode } from '../lib/types'
import { DEFAULT_PREFERENCES } from '../lib/types'
import { loadPreferences, savePreferences, resolveTheme, applyTheme } from '../lib/preferences'

interface PrefsContextValue {
  prefs: UserPreferences
  setTheme: (t: ThemeMode) => void
  setDefaultFilter: (f: UserPreferences['defaultFilter']) => void
  setDefaultSort: (s: UserPreferences['defaultSort']) => void
}

const PrefsContext = createContext<PrefsContextValue | undefined>(undefined)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES)

  useEffect(() => {
    const loaded = loadPreferences()
    setPrefs(loaded)
  }, [])

  useEffect(() => {
    applyTheme(resolveTheme(prefs.theme))
    if (prefs.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme(resolveTheme('system'))
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [prefs.theme])

  function update(next: Partial<UserPreferences>) {
    setPrefs(prev => {
      const merged = { ...prev, ...next }
      savePreferences(merged)
      return merged
    })
  }

  const value: PrefsContextValue = {
    prefs,
    setTheme: t => update({ theme: t }),
    setDefaultFilter: f => update({ defaultFilter: f }),
    setDefaultSort: s => update({ defaultSort: s }),
  }

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}

export function usePreferences(): PrefsContextValue {
  const ctx = useContext(PrefsContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
