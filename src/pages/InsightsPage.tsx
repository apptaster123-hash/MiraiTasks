import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid,
} from 'recharts'
import { supabase } from '../lib/supabase'
import type { Task } from '../lib/types'
import { PRIORITY_LABELS } from '../lib/types'
import AppHeader from '../components/AppHeader'

interface StreakInfo {
  count: number
  label: string
}

function getDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function calculateStreak(tasks: Task[]): StreakInfo {
  const completedDates = new Set(
    tasks
      .filter(t => t.completed)
      .map(t => getDateStr(new Date(t.updated_at)))
  )
  if (completedDates.size === 0) return { count: 0, label: 'days' }

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // If nothing completed today, check if streak continues from yesterday
  const todayStr = getDateStr(today)
  if (!completedDates.has(todayStr)) {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (!completedDates.has(getDateStr(yesterday))) {
      return { count: 0, label: 'days' }
    }
  }

  const cursor = new Date(today)
  while (completedDates.has(getDateStr(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return { count: streak, label: streak === 1 ? 'day' : 'days' }
}

function buildTrendData(tasks: Task[], days: number) {
  const data: { date: string; label: string; completed: number }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = getDateStr(d)
    const count = tasks.filter(t => {
      if (!t.completed) return false
      return getDateStr(new Date(t.updated_at)) === dateStr
    }).length
    data.push({
      date: dateStr,
      label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      completed: count,
    })
  }
  return data
}

export default function InsightsPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<7 | 30>(7)

  useEffect(() => {
    supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setTasks(data ?? [])
        setLoading(false)
      })
  }, [])

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.completed).length
    const active = total - completed
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const overdue = tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date) < today).length
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, active, overdue, rate }
  }, [tasks])

  const streak = useMemo(() => calculateStreak(tasks), [tasks])
  const trendData = useMemo(() => buildTrendData(tasks, range), [tasks, range])

  const priorityData = useMemo(() => {
    const active = tasks.filter(t => !t.completed)
    const counts = { high: 0, medium: 0, low: 0, none: 0 }
    active.forEach(t => { counts[t.priority]++ })
    return [
      { name: PRIORITY_LABELS.high, value: counts.high, color: 'var(--chart-danger)' },
      { name: PRIORITY_LABELS.medium, value: counts.medium, color: 'var(--warning)' },
      { name: PRIORITY_LABELS.low, value: counts.low, color: 'var(--chart-gold)' },
    ].filter(d => d.value > 0)
  }, [tasks])

  const hasData = tasks.length > 0

  // Resolve CSS vars for chart colors
  const chartGold = getComputedStyle(document.documentElement).getPropertyValue('--chart-gold').trim() || '#D4AF37'
  const chartChampagne = getComputedStyle(document.documentElement).getPropertyValue('--chart-champagne').trim() || '#C9A96E'
  const chartDanger = getComputedStyle(document.documentElement).getPropertyValue('--chart-danger').trim() || '#E5484D'
  const chartMuted = getComputedStyle(document.documentElement).getPropertyValue('--chart-muted').trim() || '#6B6B72'
  const chartSurface = getComputedStyle(document.documentElement).getPropertyValue('--chart-surface').trim() || '#17171C'
  const warningColor = getComputedStyle(document.documentElement).getPropertyValue('--warning').trim() || '#F5A623'

  const priorityColors = [chartDanger, warningColor, chartGold]

  if (loading) {
    return (
      <div className="app-shell">
        <AppHeader />
        <div className="loading-page" style={{ flex: 1 }}>
          <div className="spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main app-main-full">
        <div className="insights-page">
          <h1 className="insights-title">Progress Insights</h1>

          {!hasData ? (
            <div className="insights-empty">
              <div className="insights-empty-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="M7 14l4-4 4 4 5-5" />
                </svg>
              </div>
              <h3>No insights yet</h3>
              <p>Start adding and completing tasks to see your progress charts, streaks, and statistics here.</p>
              <Link to="/app" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Go to Tasks</Link>
            </div>
          ) : (
            <>
              {/* Streak banner */}
              <div className="insights-streak-banner">
                <div className="insights-streak-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>
                </div>
                <div>
                  <div className="insights-streak-number">{streak.count}</div>
                  <div className="insights-streak-label">
                    {streak.count > 0 ? `day${streak.count !== 1 ? 's' : ''} streak — keep it going!` : 'Complete a task today to start a streak'}
                  </div>
                </div>
              </div>

              {/* Stat cards */}
              <div className="insights-stat-grid">
                <div className="stat-card">
                  <div className="stat-card-value">{stats.total}</div>
                  <div className="stat-card-label">Total Tasks</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-value success">{stats.completed}</div>
                  <div className="stat-card-label">Completed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-value gold">{stats.active}</div>
                  <div className="stat-card-label">Active</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-value danger">{stats.overdue}</div>
                  <div className="stat-card-label">Overdue</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-value gold">{stats.rate}%</div>
                  <div className="stat-card-label">Completion Rate</div>
                </div>
              </div>

              {/* Completion trend chart */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <h2 className="chart-card-title">Completion Trend</h2>
                  <div className="chart-range-toggle">
                    <button
                      className={`chart-range-btn ${range === 7 ? 'active' : ''}`}
                      onClick={() => setRange(7)}
                    >7 Days</button>
                    <button
                      className={`chart-range-btn ${range === 30 ? 'active' : ''}`}
                      onClick={() => setRange(30)}
                    >30 Days</button>
                  </div>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartGold} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={chartGold} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartMuted} strokeOpacity={0.15} />
                      <XAxis
                        dataKey="label"
                        stroke={chartMuted}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        interval={range === 30 ? 5 : 0}
                      />
                      <YAxis
                        stroke={chartMuted}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: chartSurface,
                          border: `1px solid ${chartMuted}`,
                          borderRadius: '10px',
                          color: '#F5F1E8',
                          fontSize: '13px',
                        }}
                        labelStyle={{ color: chartMuted }}
                        itemStyle={{ color: chartGold }}
                        cursor={{ stroke: chartGold, strokeWidth: 1, strokeDasharray: '4 4' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stroke={chartGold}
                        strokeWidth={2.5}
                        fill="url(#goldGradient)"
                        dot={{ fill: chartGold, r: 3 }}
                        activeDot={{ r: 5, fill: chartGold }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Priority breakdown + overview */}
              <div className="insights-grid-2col">
                <div className="chart-card">
                  <div className="chart-card-header">
                    <h2 className="chart-card-title">Active by Priority</h2>
                  </div>
                  {priorityData.length === 0 ? (
                    <div className="insights-empty" style={{ padding: '2rem 1rem' }}>
                      <p>No active tasks to categorize.</p>
                    </div>
                  ) : (
                    <div className="donut-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={priorityData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {priorityData.map((_entry, i) => (
                              <Cell key={i} fill={priorityColors[i]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: chartSurface,
                              border: `1px solid ${chartMuted}`,
                              borderRadius: '10px',
                              color: '#F5F1E8',
                              fontSize: '13px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {priorityData.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      {priorityData.map((d, i) => (
                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: priorityColors[i] }} />
                          {d.name}: {d.value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="chart-card">
                  <div className="chart-card-header">
                    <h2 className="chart-card-title">Tasks Completed (7d)</h2>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendData.slice(-7)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartMuted} strokeOpacity={0.15} vertical={false} />
                        <XAxis
                          dataKey="label"
                          stroke={chartMuted}
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke={chartMuted}
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: chartSurface,
                            border: `1px solid ${chartMuted}`,
                            borderRadius: '10px',
                            color: '#F5F1E8',
                            fontSize: '13px',
                          }}
                          itemStyle={{ color: chartChampagne }}
                          cursor={{ fill: 'rgba(212,175,55,0.05)' }}
                        />
                        <Bar
                          dataKey="completed"
                          fill={chartChampagne}
                          radius={[6, 6, 0, 0]}
                          maxBarSize={32}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
