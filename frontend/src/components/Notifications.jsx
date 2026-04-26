import { useState, useEffect } from 'react'
import { loadState, saveState } from '../storage'

// ── Notification banner ────────────────────────────────────────────────────
export function NotificationBanner({ notifications, onDismiss, onTap }) {
  const active = notifications.filter(n => !n.dismissed)[0]
  if (!active) return null

  function handleTap() {
    // Navigate first, then dismiss so the banner doesn't flicker before nav
    if (onTap && active.action) onTap(active.action)
    onDismiss(active.id)
  }

  return (
    <div
      className="flex items-center gap-3 bg-gray-900 text-white px-4 py-3 text-xs shrink-0 cursor-pointer hover:bg-gray-800 transition-colors"
      onClick={handleTap}
    >
      <span className="text-base shrink-0">{active.icon || '🔔'}</span>
      <p className="flex-1 leading-snug">{active.message}</p>
      <div className="flex items-center gap-2 shrink-0">
        {active.action && (
          <span className="text-gray-400 text-xs">Tap to explore →</span>
        )}
        <button
          className="text-gray-400 hover:text-white transition-colors text-base"
          onClick={e => { e.stopPropagation(); onDismiss(active.id) }}
        >✕</button>
      </div>
    </div>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useNotifications(savedList, visitLog) {
  const [notifications, setNotifications] = useState(() => loadState('notifications', []))

  useEffect(() => { saveState('notifications', notifications) }, [notifications])

  useEffect(() => {
    const now = Date.now()
    const newOnes = []

    // "You saved X 3+ days ago — ready to go?"
    // → tapping navigates to Saved tab
    savedList.forEach(item => {
      const daysAgo = (now - item.savedAt) / (1000 * 60 * 60 * 24)
      const id = `saved-nudge-${item.name}`
      const alreadyShown = notifications.find(n => n.id === id)
      if (daysAgo >= 3 && !alreadyShown) {
        newOnes.push({
          id,
          icon:      '📍',
          message:   `You saved ${item.name} ${Math.floor(daysAgo)} days ago — ready to visit?`,
          dismissed: false,
          createdAt: now,
          action: {
            type: 'navigate',
            tab:  'saved',
          },
        })
      }
    })

    // "You haven't explored in a while"
    // → tapping fires a general recommendations search
    const lastVisit = visitLog.length > 0 ? Math.max(...visitLog.map(v => v.loggedAt)) : null
    const idleId = 'idle-nudge'
    if (lastVisit) {
      const daysSince = (now - lastVisit) / (1000 * 60 * 60 * 24)
      const alreadyShown = notifications.find(n => n.id === idleId)
      if (daysSince >= 5 && !alreadyShown) {
        newOnes.push({
          id:        idleId,
          icon:      '🗽',
          message:   "You haven't explored in a while — check out today's picks!",
          dismissed: false,
          createdAt: now,
          action: {
            type:         'search',
            tab:          'search',
            searchParams: { activity_type: 'Both', top_n: 10 },
          },
        })
      }
    }

    // Time-based nudges — once per time slot per day
    const hour = new Date().getHours()
    const todayKey = `time-nudge-${new Date().toDateString()}-${hour}`
    const alreadyShown = notifications.find(n => n.id === todayKey)
    if (!alreadyShown) {
      let nudge = null

      if (hour >= 11 && hour < 13) {
        nudge = {
          icon:    '🍳',
          message: 'Lunch hour! Check out the best food spots near you.',
          action: {
            type:         'search',
            tab:          'search',
            searchParams: { activity_type: 'Food', atmosphere: 'Casual', top_n: 10 },
          },
        }
      }

      if (hour >= 17 && hour < 19) {
        nudge = {
          icon:    '🍸',
          message: 'Happy hour alert! Great bars and cocktail spots waiting.',
          action: {
            type:         'search',
            tab:          'search',
            searchParams: { activity_type: 'Nightlife', atmosphere: 'Lively', drinks: true, top_n: 10 },
          },
        }
      }

      if (hour >= 21) {
        nudge = {
          icon:    '🌙',
          message: 'Night owl? Late-night spots are waiting for you.',
          action: {
            type:         'search',
            tab:          'search',
            searchParams: { activity_type: 'Nightlife', top_n: 10 },
          },
        }
      }

      if (nudge) {
        newOnes.push({
          id:        todayKey,
          icon:      nudge.icon,
          message:   nudge.message,
          dismissed: false,
          createdAt: now,
          action:    nudge.action,
        })
      }
    }

    if (newOnes.length > 0) {
      setNotifications(prev => [...newOnes, ...prev].slice(0, 10))
    }
  }, [savedList, visitLog])

  function dismiss(id) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, dismissed: true } : n))
  }

  function clearAll() { setNotifications([]) }

  return { notifications, dismiss, clearAll }
}
