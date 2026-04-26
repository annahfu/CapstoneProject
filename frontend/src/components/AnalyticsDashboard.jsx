import { useState, useEffect } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// AnalyticsDashboard.jsx
//
// Internal-only screen for reviewing app performance and user testing results.
// Access it by navigating to /#analytics or rendering <AnalyticsDashboard />
// conditionally (e.g. only when a secret query param is present).
//
// Shows:
//   - Performance: load time, API response times
//   - Engagement: top chips, searches, most viewed places, navigation
//   - Quality: error rate, feedback scores by screen
//   - Iterations log: before/after comparison of changes
// ─────────────────────────────────────────────────────────────────────────────

const ITERATIONS = [
  {
    date:    '2026-04-01',
    version: 'v1.0 — Initial release',
    changes: ['Basic React + plain CSS', 'Static recommendations', 'No personalization'],
    findings: ['Users confused by lack of personalization', 'No match % shown', 'Load time ~4s'],
  },
  {
    date:    '2026-04-05',
    version: 'v2.0 — Tailwind conversion',
    changes: ['Converted to React + Tailwind', 'Phone frame UI', 'Fixed bottom nav'],
    findings: ['Visual consistency improved', 'Users preferred cleaner card layout'],
  },
  {
    date:    '2026-04-10',
    version: 'v3.0 — Personalization',
    changes: [
      'Profile page with vibes, neighborhoods, budget, music',
      'Food & dining preferences added',
      'Home recs now send user profile to API',
      'Match % personalized per user',
    ],
    findings: [
      'Users engaged more when they saw their name',
      '"Top matches" section still showed same results for different users — fixed in v3.1',
    ],
  },
  {
    date:    '2026-04-15',
    version: 'v3.1 — Semantic profile fix',
    changes: [
      'Removed atmosphere hard filter from top recs',
      'Built rich semantic activities text from profile',
      'Added two-tier fallback when neighborhood returns 0 results',
    ],
    findings: ['Recommendations now differ meaningfully between users'],
  },
  {
    date:    '2026-04-20',
    version: 'v4.0 — Time-aware + chips',
    changes: [
      'Time-of-day recommendation slots (morning, happy hour, night etc.)',
      'Vibe chips now call API with semantic payloads',
      'Share modal with WhatsApp, Messages, Instagram, clipboard',
      'Notification tap-to-search feature',
    ],
    findings: ['Happy hour slot showing food only — fixed by removing atmosphere filter for drink slots'],
  },
  {
    date:    '2026-04-26',
    version: 'v5.0 — Analytics + feedback',
    changes: [
      'Added analytics dashboard with performance tracking',
      'Added feedback widget for user ratings',
      'Removed match % from PlaceCard and DetailScreen',
      'Vibe chips now call API instead of text search',
      'Added Food & Dining preferences to profile',
    ],
    findings: [
      'API response time for recommendations averages ~1200ms',
      'Users preferred not seeing the match % score',
      'Happy hour slot now shows bars and entertainment, not just food',
    ],
  }
  ]

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h2>
      {children}
    </section>
  )
}

export default function AnalyticsDashboard() {
  const [data,      setData]      = useState(null)
  const [errors,    setErrors]    = useState([])
  const [feedback,  setFeedback]  = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [days,      setDays]      = useState(7)
  const [tab,       setTab]       = useState('performance')

  useEffect(() => { loadData() }, [days])

  async function loadData() {
    setLoading(true)
    try {
      const [dashRes, errRes, fbRes] = await Promise.all([
        fetch(`/api/analytics/dashboard?days=${days}`),
        fetch('/api/analytics/errors?limit=20'),
        fetch('/api/analytics/feedback?limit=50'),
      ])
      const [dash, err, fb] = await Promise.all([
        dashRes.json(), errRes.json(), fbRes.json(),
      ])
      setData(dash)
      setErrors(err.errors || [])
      setFeedback(fb)
    } catch (e) {
      console.error('Dashboard load error', e)
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'performance', label: '⚡ Performance' },
    { id: 'engagement',  label: '📊 Engagement' },
    { id: 'quality',     label: '🐛 Quality' },
    { id: 'feedback',    label: '💬 Feedback' },
    { id: 'iterations',  label: '📋 Iterations' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-black text-white px-5 pt-6 pb-5">
        <p className="text-xs text-gray-400 mb-1">Internal</p>
        <h1 className="text-2xl font-bold mb-3">Analytics Dashboard</h1>

        {/* Period selector */}
        <div className="flex gap-2">
          {[1, 7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors
                ${days === d
                  ? 'bg-white text-black border-white'
                  : 'border-white/30 text-white/70 hover:bg-white/10'}`}
            >{d === 1 ? 'Today' : `${d}d`}</button>
          ))}
          <button
            onClick={loadData}
            className="text-xs px-3 py-1.5 rounded-full border border-white/30 text-white/70 hover:bg-white/10 ml-auto"
          >↺ Refresh</button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex overflow-x-auto bg-white border-b border-gray-200 px-4 gap-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 text-xs font-medium py-3 px-3 border-b-2 transition-colors
              ${tab === t.id
                ? 'border-black text-black'
                : 'border-transparent text-gray-400 hover:text-gray-700'}`}
          >{t.label}</button>
        ))}
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">

        {loading && (
          <div className="text-center py-12 text-gray-400 text-sm">Loading analytics…</div>
        )}

        {!loading && !data && (
          <div className="bg-white rounded-2xl p-6 text-center">
            <p className="text-sm font-medium text-gray-700 mb-1">No data yet</p>
            <p className="text-xs text-gray-400">
              Analytics data will appear here once the backend endpoints are added
              and users start using the app.
            </p>
          </div>
        )}

        {/* ── Performance tab ── */}
        {!loading && data && tab === 'performance' && (
          <>
            <Section title="Page load">
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Avg load time"
                  value={data.performance.avg_page_load_ms ? `${data.performance.avg_page_load_ms}ms` : '—'}
                  sub={data.performance.avg_page_load_ms < 3000 ? '✅ Good' : '⚠️ Slow'}
                />
                <StatCard
                  label="Sessions"
                  value={data.sessions}
                  sub={`Last ${days} day${days !== 1 ? 's' : ''}`}
                />
              </div>
            </Section>

            <Section title="API response times">
              {Object.keys(data.performance.api_calls).length === 0 ? (
                <p className="text-sm text-gray-400">No API calls recorded yet</p>
              ) : (
                <div className="bg-white rounded-2xl divide-y divide-gray-100">
                  {Object.entries(data.performance.api_calls).map(([name, stats]) => (
                    <div key={name} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{name}</p>
                        <p className="text-xs text-gray-400">{stats.calls} calls</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${stats.avg_ms > 2000 ? 'text-red-500' : stats.avg_ms > 1000 ? 'text-yellow-500' : 'text-green-600'}`}>
                          {stats.avg_ms}ms avg
                        </p>
                        {stats.p95_ms && (
                          <p className="text-xs text-gray-400">p95: {stats.p95_ms}ms</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        )}

        {/* ── Engagement tab ── */}
        {!loading && data && tab === 'engagement' && (
          <>
            <Section title="Navigation">
              <div className="bg-white rounded-2xl divide-y divide-gray-100">
                {Object.entries(data.engagement.navigation_tabs)
                  .sort((a, b) => b[1] - a[1])
                  .map(([tab, count]) => {
                    const total = Object.values(data.engagement.navigation_tabs)
                      .reduce((a, b) => a + b, 0)
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0
                    return (
                      <div key={tab} className="flex items-center gap-3 px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 w-20 capitalize">{tab}</p>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full">
                          <div className="h-full bg-black rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-gray-500 w-12 text-right">{pct}%</p>
                      </div>
                    )
                  })}
              </div>
            </Section>

            <Section title="Top vibe chips tapped">
              <div className="bg-white rounded-2xl divide-y divide-gray-100">
                {data.engagement.top_chip_taps.length === 0
                  ? <p className="text-sm text-gray-400 p-4">No chip taps recorded yet</p>
                  : data.engagement.top_chip_taps.map(([chip, count]) => (
                    <div key={chip} className="flex justify-between items-center px-4 py-3">
                      <p className="text-sm text-gray-900">{chip}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                        {count} taps
                      </span>
                    </div>
                  ))}
              </div>
            </Section>

            <Section title="Top searches">
              <div className="bg-white rounded-2xl divide-y divide-gray-100">
                {data.engagement.top_searches.length === 0
                  ? <p className="text-sm text-gray-400 p-4">No searches recorded yet</p>
                  : data.engagement.top_searches.map(([q, count]) => (
                    <div key={q} className="flex justify-between items-center px-4 py-3">
                      <p className="text-sm text-gray-900">"{q}"</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{count}×</span>
                    </div>
                  ))}
              </div>
            </Section>

            <Section title="Most viewed places">
              <div className="bg-white rounded-2xl divide-y divide-gray-100">
                {data.engagement.top_places.length === 0
                  ? <p className="text-sm text-gray-400 p-4">No detail views recorded yet</p>
                  : data.engagement.top_places.map(([place, count]) => (
                    <div key={place} className="flex justify-between items-center px-4 py-3">
                      <p className="text-sm text-gray-900">{place}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{count} views</span>
                    </div>
                  ))}
              </div>
            </Section>

            <Section title="Save behaviour">
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Places saved" value={data.engagement.saves} />
                <StatCard label="Places unsaved" value={data.engagement.unsaves} />
              </div>
            </Section>
          </>
        )}

        {/* ── Quality / errors tab ── */}
        {!loading && data && tab === 'quality' && (
          <>
            <Section title="Error summary">
              <StatCard
                label="Total errors"
                value={data.quality.error_count}
                sub={data.quality.error_count === 0 ? '✅ No errors' : '⚠️ Check error log'}
              />
            </Section>

            <Section title="Recent errors">
              {errors.length === 0 ? (
                <div className="bg-white rounded-2xl p-4 text-center">
                  <p className="text-sm text-green-600 font-medium">✅ No errors in this period</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {errors.map((e, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                          {e.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(e.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 mt-1">{e.message || e.reason || '—'}</p>
                      {e.context && <p className="text-xs text-gray-400 mt-0.5">Context: {e.context}</p>}
                      {e.stack && (
                        <pre className="text-xs text-gray-400 mt-2 overflow-x-auto bg-gray-50 rounded-lg p-2">
                          {e.stack.slice(0, 300)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        )}

        {/* ── Feedback tab ── */}
        {!loading && feedback && tab === 'feedback' && (
          <>
            <Section title="Overall rating">
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Avg rating"
                  value={data?.quality.feedback_avg ? `${data.quality.feedback_avg} / 5` : '—'}
                />
                <StatCard
                  label="Responses"
                  value={data?.quality.feedback_count ?? '—'}
                />
              </div>
            </Section>

            <Section title="Rating by screen">
              <div className="bg-white rounded-2xl divide-y divide-gray-100">
                {feedback.by_screen.length === 0
                  ? <p className="text-sm text-gray-400 p-4">No feedback yet</p>
                  : feedback.by_screen
                      .sort((a, b) => b.avg_rating - a.avg_rating)
                      .map(s => (
                      <div key={s.screen} className="flex items-center justify-between px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{s.screen}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(r => (
                              <span key={r} className={`text-sm ${r <= Math.round(s.avg_rating) ? 'text-black' : 'text-gray-200'}`}>★</span>
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">{s.count} responses</span>
                        </div>
                      </div>
                    ))}
              </div>
            </Section>

            <Section title="Recent comments">
              <div className="space-y-2">
                {feedback.submissions
                  .filter(f => f.comment?.trim())
                  .slice(0, 10)
                  .map((f, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(r => (
                          <span key={r} className={`text-sm ${r <= f.rating ? 'text-black' : 'text-gray-200'}`}>★</span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{f.screen}</span>
                    </div>
                    <p className="text-sm text-gray-700">{f.comment}</p>
                  </div>
                ))}
                {feedback.submissions.filter(f => f.comment?.trim()).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No written comments yet</p>
                )}
              </div>
            </Section>
          </>
        )}

        {/* ── Iterations tab ── */}
        {tab === 'iterations' && (
          <Section title="Development iterations">
            <div className="space-y-3">
              {[...ITERATIONS].reverse().map((iter, i) => (
                <div key={i} className="bg-white rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-gray-900">{iter.version}</h3>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">{iter.date}</span>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Changes
                    </p>
                    <ul className="space-y-1">
                      {iter.changes.map((c, j) => (
                        <li key={j} className="text-xs text-gray-700 flex gap-2">
                          <span className="text-green-500 shrink-0">+</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Findings
                    </p>
                    <ul className="space-y-1">
                      {iter.findings.map((f, j) => (
                        <li key={j} className="text-xs text-gray-600 flex gap-2">
                          <span className="text-blue-400 shrink-0">→</span>{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}
