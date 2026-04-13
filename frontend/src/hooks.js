import { useState, useEffect } from 'react'

export function useLocalTime() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  )
  useEffect(() => {
    const tick = setInterval(() =>
      setTime(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))
    , 1000)
    return () => clearInterval(tick)
  }, [])
  return time
}

export function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function getTimeContext() {
  const h = new Date().getHours()
  if (h >= 6  && h < 11) return { label:'Brunch spots',     payload:{ category:'Cafe',        top_n:3 } }
  if (h >= 11 && h < 15) return { label:'Lunch picks',      payload:{ category:'Food',         top_n:3 } }
  if (h >= 15 && h < 18) return { label:'Happy hour',       payload:{ atmosphere:'Casual',     top_n:3 } }
  if (h >= 18 && h < 22) return { label:'Tonight\'s vibe',  payload:{ activity_type:'Both',    top_n:3 } }
  return                         { label:'Late night spots', payload:{ atmosphere:'Lively & Social', top_n:3 } }
}
