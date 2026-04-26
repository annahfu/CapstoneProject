// All keys used for localStorage persistence
const KEYS = {
  savedList:      'nyc_saved_list',
  collections:    'nyc_collections',
  recentlyViewed: 'nyc_recently_viewed',
  cachedRecs:     'nyc_cached_recs',
  profile:        'nyc_profile',
  onboarded:      'nyc_onboarded',
  notifications:  'nyc_notifications',
  visitLog:       'nyc_visit_log',
}

/**
 * Load a value from localStorage.
 * Returns `fallback` if the key doesn't exist or JSON parsing fails.
 */
export function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(KEYS[key])
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

/**
 * Save a value to localStorage.
 * Silently ignores errors (e.g. private browsing quota exceeded).
 */
export function saveState(key, value) {
  try {
    localStorage.setItem(KEYS[key], JSON.stringify(value))
  } catch {}
}

/**
 * Add a place to the recently viewed list.
 * Deduplicates by name and keeps the 8 most recent.
 */
export function addRecentlyViewed(place, current) {
  const name     = place.Name_of_place || place.name
  const filtered = current.filter(p => (p.Name_of_place || p.name) !== name)
  const updated  = [place, ...filtered].slice(0, 8)
  saveState('recentlyViewed', updated)
  return updated
}

/**
 * Wipe all app data from localStorage.
 * Used if a user wants to reset / log out.
 */
export function clearAllState() {
  Object.values(KEYS).forEach(k => {
    try { localStorage.removeItem(k) } catch {}
  })
}