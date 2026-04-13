import { useState, useEffect } from 'react'
import { loadState, saveState } from '../storage'

// ── Notification banner shown at top of screen ──────────────────────────────
export function NotificationBanner({ notifications, onDismiss }) {
  const active = notifications.filter(n=>!n.dismissed)[0]
  if (!active) return null
  return (
    <div className="notif-banner">
      <span className="notif-icon">{active.icon||'🔔'}</span>
      <p className="notif-text">{active.message}</p>
      <button className="notif-dismiss" onClick={()=>onDismiss(active.id)}>✕</button>
    </div>
  )
}

// ── Hook that generates contextual notifications ─────────────────────────────
export function useNotifications(savedList, visitLog) {
  const [notifications, setNotifications] = useState(() => loadState('notifications', []))

  useEffect(() => { saveState('notifications', notifications) }, [notifications])

  useEffect(() => {
    const now     = Date.now()
    const newOnes = []

    // "You saved X 3+ days ago — ready to go?"
    savedList.forEach(item => {
      const daysAgo = (now - item.savedAt) / (1000 * 60 * 60 * 24)
      const id = `saved-nudge-${item.name}`
      const alreadyShown = notifications.find(n=>n.id===id)
      if (daysAgo >= 3 && !alreadyShown) {
        newOnes.push({ id, icon:'📍', message:`You saved ${item.name} ${Math.floor(daysAgo)} days ago — ready to visit?`, dismissed:false, createdAt:now })
      }
    })

    // "You haven't explored in a while"
    const lastVisit = visitLog.length > 0 ? Math.max(...visitLog.map(v=>v.loggedAt)) : null
    const idleId    = 'idle-nudge'
    if (lastVisit) {
      const daysSince = (now - lastVisit) / (1000 * 60 * 60 * 24)
      const alreadyShown = notifications.find(n=>n.id===idleId)
      if (daysSince >= 5 && !alreadyShown) {
        newOnes.push({ id:idleId, icon:'🗽', message:"You haven't explored in a while — check out today's picks!", dismissed:false, createdAt:now })
      }
    }

    // Time-based nudge once per day
    const hour     = new Date().getHours()
    const todayKey = `time-nudge-${new Date().toDateString()}`
    const alreadyShown = notifications.find(n=>n.id===todayKey)
    if (!alreadyShown) {
      let msg = null
      if (hour >= 11 && hour < 13) msg = "🍳 Lunch hour! Check out today's food picks."
      if (hour >= 17 && hour < 19) msg = "🍸 Happy hour alert! Great bars near you tonight."
      if (hour >= 21)              msg = "🌙 Night owl? Late-night spots are waiting."
      if (msg) newOnes.push({ id:todayKey, icon:'🔔', message:msg, dismissed:false, createdAt:now })
    }

    if (newOnes.length > 0) setNotifications(prev => [...newOnes, ...prev].slice(0, 10))
  }, [savedList, visitLog])

  function dismiss(id) {
    setNotifications(prev => prev.map(n=>n.id===id?{...n,dismissed:true}:n))
  }

  function clearAll() { setNotifications([]) }

  return { notifications, dismiss, clearAll }
}
