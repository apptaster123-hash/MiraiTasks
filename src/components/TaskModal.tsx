import { useState, type FormEvent } from 'react'
import type { Task, TaskInput, Priority } from '../lib/types'
import { PRIORITY_LABELS } from '../lib/types'

interface TaskModalProps {
  task?: Task | null
  onSave: (data: TaskInput) => Promise<void>
  onClose: () => void
}

export default function TaskModal({ task, onSave, onClose }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [note, setNote] = useState(task?.note ?? '')
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'none')
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.slice(0, 10) : '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    await onSave({
      title: title.trim(),
      note: note.trim() || null,
      priority,
      due_date: dueDate ? new Date(dueDate + 'T12:00:00').toISOString() : null,
    })
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">Title</label>
            <input
              id="task-title"
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-note">Note</label>
            <textarea
              id="task-note"
              className="form-input"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add details (optional)"
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '1 1 180px', marginBottom: 0 }}>
              <label className="form-label" htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="form-input"
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
              >
                {(Object.keys(PRIORITY_LABELS) as Priority[]).map(p => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: '1 1 160px', marginBottom: 0 }}>
              <label className="form-label" htmlFor="task-due">Due Date</label>
              <input
                id="task-due"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving || !title.trim()}>
              {saving ? 'Saving...' : task ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
