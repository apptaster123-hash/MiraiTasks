export type Priority = 'none' | 'low' | 'medium' | 'high'

export interface Task {
  id: string
  user_id: string
  title: string
  note: string | null
  completed: boolean
  priority: Priority
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface TaskInput {
  title: string
  note?: string | null
  priority?: Priority
  due_date?: string | null
}

export type FilterType = 'all' | 'active' | 'completed'
export type SortType = 'created' | 'due' | 'priority' | 'alpha'
export type ThemeMode = 'light' | 'dark' | 'system'

export interface UserPreferences {
  theme: ThemeMode
  defaultFilter: FilterType
  defaultSort: SortType
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  defaultFilter: 'all',
  defaultSort: 'created',
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
  none: 3,
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'None',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#3b82f6',
  none: '#9ca3af',
}
