import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Task, TaskInput, FilterType, SortType } from '../lib/types'
import { PRIORITY_ORDER, PRIORITY_LABELS } from '../lib/types'
import { usePreferences } from '../context/PreferencesContext'
import AppHeader from '../components/AppHeader'
import TaskModal from '../components/TaskModal'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function isOverdue(iso: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(iso) < today
}

export default function AppPage() {
  const { prefs } = usePreferences()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>(prefs.defaultFilter)
  const [sort, setSort] = useState<SortType>(prefs.defaultSort)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      showToast('Failed to load tasks')
      return
    }
    setTasks(data ?? [])
  }, [showToast])

  useEffect(() => {
    fetchTasks().finally(() => setLoading(false))
  }, [fetchTasks])

  function handleAddClick() {
    setEditingTask(null)
    setModalOpen(true)
  }

  function handleEditClick(task: Task) {
    setEditingTask(task)
    setModalOpen(true)
  }

  async function handleSaveTask(data: TaskInput) {
    if (editingTask) {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: data.title,
          note: data.note,
          priority: data.priority,
          due_date: data.due_date,
        })
        .eq('id', editingTask.id)
      if (error) {
        showToast('Failed to update task')
        return
      }
      showToast('Task updated')
    } else {
      const { error } = await supabase
        .from('tasks')
        .insert({
          title: data.title,
          note: data.note,
          priority: data.priority ?? 'none',
          due_date: data.due_date,
        })
      if (error) {
        showToast('Failed to add task')
        return
      }
      showToast('Task added')
    }
    setModalOpen(false)
    setEditingTask(null)
    await fetchTasks()
  }

  async function handleToggle(task: Task) {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', task.id)
    if (error) {
      showToast('Failed to update task')
      return
    }
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))
  }

  async function handleDelete(task: Task) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', task.id)
    if (error) {
      showToast('Failed to delete task')
      return
    }
    setTasks(prev => prev.filter(t => t.id !== task.id))
    showToast('Task deleted')
  }

  function sortTasks(items: Task[], sortBy: SortType): Task[] {
    const sorted = [...items]
    switch (sortBy) {
      case 'due':
        sorted.sort((a, b) => {
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        })
        break
      case 'priority':
        sorted.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
        break
      case 'alpha':
        sorted.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'created':
      default:
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
    }
    // Always show incomplete tasks before completed ones within the same sort
    sorted.sort((a, b) => Number(a.completed) - Number(b.completed))
    return sorted
  }

  const filtered = sortTasks(
    tasks.filter(t => {
      if (filter === 'active') return !t.completed
      if (filter === 'completed') return t.completed
      return true
    }),
    sort
  )

  const activeCount = tasks.filter(t => !t.completed).length
  const completedCount = tasks.filter(t => t.completed).length

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">
        <div className="task-page">
          <h1 className="task-page-title">My Tasks</h1>
          <div className="task-add-bar">
            <input
              type="text"
              className="form-input"
              placeholder="Add a new task..."
              onFocus={handleAddClick}
              readOnly
            />
            <button className="btn btn-primary" onClick={handleAddClick}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Task
            </button>
          </div>

          <div className="task-toolbar">
            <div className="task-filters">
              {(['all', 'active', 'completed'] as FilterType[]).map(f => (
                <button
                  key={f}
                  className={`filter-tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <select className="task-sort" value={sort} onChange={e => setSort(e.target.value as SortType)}>
              <option value="created">Newest first</option>
              <option value="due">By due date</option>
              <option value="priority">By priority</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>

          <div className="task-count-bar">
            {activeCount} active · {completedCount} completed · {tasks.length} total
          </div>

          {loading ? (
            <div className="task-empty"><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : filtered.length === 0 ? (
            <div className="task-empty">
              {tasks.length === 0 ? (
                <>
                  <p style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>No tasks yet</p>
                  <p>Click "Add Task" to create your first to-do.</p>
                </>
              ) : (
                <p>No {filter} tasks to show.</p>
              )}
            </div>
          ) : (
            <div className="task-list">
              {filtered.map(task => (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <div
                    className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                    onClick={() => handleToggle(task)}
                    role="checkbox"
                    aria-checked={task.completed}
                    tabIndex={0}
                  />
                  <div className="task-body">
                    <div className="task-title">{task.title}</div>
                    {task.note && <div className="task-note">{task.note}</div>}
                    {(task.priority !== 'none' || task.due_date) && (
                      <div className="task-meta">
                        {task.priority !== 'none' && (
                          <span className={`task-badge task-badge-priority-${task.priority}`}>
                            {PRIORITY_LABELS[task.priority]}
                          </span>
                        )}
                        {task.due_date && (
                          <span className={`task-badge task-badge-due ${isOverdue(task.due_date) && !task.completed ? 'overdue' : ''}`}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <rect x="3" y="4" width="18" height="18" rx="2" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {isOverdue(task.due_date) && !task.completed ? 'Overdue · ' : ''}
                            {formatDate(task.due_date)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="task-actions">
                    <button className="task-action-btn" onClick={() => handleEditClick(task)} aria-label="Edit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className="task-action-btn" onClick={() => handleDelete(task)} aria-label="Delete">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => { setModalOpen(false); setEditingTask(null) }}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
