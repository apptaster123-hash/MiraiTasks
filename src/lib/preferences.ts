import type { UserPreferences, ThemeMode } from './types'
import { DEFAULT_PREFERENCES } from './types'

const STORAGE_KEY = 'miraitasks:preferences'

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PREFERENCES
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_PREFERENCES, ...parsed }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function savePreferences(prefs: UserPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

export function applyTheme(theme: 'light' | 'dark'): void {
  document.documentElement.setAttribute('data-theme', theme)
}
