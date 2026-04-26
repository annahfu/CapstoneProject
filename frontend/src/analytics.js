// ─────────────────────────────────────────────────────────────────────────────
// analytics.js  — Drop into src/
//
// Three responsibilities:
//   1. Performance — measures load time, API response time, memory usage
//   2. Error tracking — catches and logs JS errors + unhandled promise rejections
//   3. User events — tracks navigation, searches, saves, chip taps, detail views
//
// All events are batched and flushed to POST /api/analytics/event every 10s
// or when the batch hits 20 events, whichever comes first.
// Falls back to console.log if the endpoint isn't available yet.
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_ID = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
const BATCH_SIZE = 20
const FLUSH_INTERVAL_MS = 10_000

let queue = []
let flushTimer = null
let isInitialised = false

// ── Helpers ───────────────────────────────────────────────────────────────────

function now() { return Date.now() }

function getMemoryMB() {
  try {
    // Only available in Chrome
    const mem = performance?.memory
    if (!mem) return null
    return {
      used:  Math.round(mem.usedJSHeapSize  / 1_048_576),
      total: Math.round(mem.totalJSHeapSize / 1_048_576),
      limit: Math.round(mem.jsHeapSizeLimit / 1_048_576),
    }
  } catch { return null }
}

function getConnectionInfo() {
  try {
    const conn = navigator?.connection
    if (!conn) return null
    return { effectiveType: conn.effectiveType, downlink: conn.downlink }
  } catch { return null }
}

// ── Core event queue ──────────────────────────────────────────────────────────

export function trackEvent(type, payload = {}) {
  const event = {
    session_id:  SESSION_ID,
    timestamp:   new Date().toISOString(),
    type,
    payload: {
      ...payload,
      url:    window.location.href,
      memory: getMemoryMB(),
    },
  }

  queue.push(event)
  console.debug(`[Analytics] ${type}`, payload)

  if (queue.length >= BATCH_SIZE) flush()
}

async function flush() {
  if (queue.length === 0) return
  const batch = [...queue]
  queue = []

  try {
    await fetch('/api/analytics/event', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ events: batch }),
    })
  } catch {
    // Endpoint not yet available — log to console only
    console.debug('[Analytics] Flush failed (endpoint not ready) — events logged locally', batch)
  }
}

function startFlushTimer() {
  if (flushTimer) return
  flushTimer = setInterval(flush, FLUSH_INTERVAL_MS)
}

// ── 1. Performance monitoring ─────────────────────────────────────────────────

export function measurePageLoad() {
  // Wait for the browser to finish painting
  window.addEventListener('load', () => {
    setTimeout(() => {
      try {
        const nav = performance.getEntriesByType('navigation')[0]
        if (!nav) return

        trackEvent('performance.page_load', {
          dns_ms:            Math.round(nav.domainLookupEnd  - nav.domainLookupStart),
          connect_ms:        Math.round(nav.connectEnd       - nav.connectStart),
          ttfb_ms:           Math.round(nav.responseStart    - nav.requestStart),
          dom_content_ms:    Math.round(nav.domContentLoadedEventEnd - nav.startTime),
          load_complete_ms:  Math.round(nav.loadEventEnd    - nav.startTime),
          connection:        getConnectionInfo(),
        })
      } catch (e) {
        console.debug('[Analytics] measurePageLoad error', e)
      }
    }, 0)
  })
}

// Wrap a fetch call and record how long it took
// Usage: const data = await measureApiCall('recommendations', fetch(...))
export async function measureApiCall(name, fetchPromise) {
  const start = now()
  try {
    const response = await fetchPromise
    const duration = now() - start

    trackEvent('performance.api_call', {
      name,
      duration_ms: duration,
      status:      response.status,
      ok:          response.ok,
    })

    return response
  } catch (e) {
    trackEvent('performance.api_call', {
      name,
      duration_ms: now() - start,
      error:       e.message,
    })
    throw e
  }
}

// ── 2. Error tracking ─────────────────────────────────────────────────────────

export function initErrorTracking() {
  // Uncaught JS errors
  window.addEventListener('error', event => {
    trackEvent('error.uncaught', {
      message:  event.message,
      filename: event.filename,
      line:     event.lineno,
      col:      event.colno,
      stack:    event.error?.stack?.slice(0, 500),
    })
  })

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', event => {
    trackEvent('error.promise', {
      reason: String(event.reason)?.slice(0, 500),
      stack:  event.reason?.stack?.slice(0, 500),
    })
  })
}

// Manual error logging — call this in catch blocks
export function logError(context, error, extra = {}) {
  trackEvent('error.caught', {
    context,
    message: error?.message || String(error),
    stack:   error?.stack?.slice(0, 500),
    ...extra,
  })
}

// ── 3. User event tracking ────────────────────────────────────────────────────

export function trackNavigation(tab) {
  trackEvent('user.navigation', { tab })
}

export function trackSearch(query, resultCount) {
  trackEvent('user.search', { query: query.slice(0, 100), result_count: resultCount })
}

export function trackChipTap(chip, resultCount) {
  trackEvent('user.chip_tap', { chip, result_count: resultCount })
}

export function trackDetailView(placeName, neighborhood, matchScore) {
  trackEvent('user.detail_view', {
    place:        placeName?.slice(0, 80),
    neighborhood: neighborhood?.slice(0, 50),
    match_score:  matchScore ? Math.round(matchScore * 100) : null,
  })
}

export function trackSave(placeName, action) {
  // action: 'save' | 'unsave'
  trackEvent('user.save', { place: placeName?.slice(0, 80), action })
}

export function trackShare(placeName, method) {
  // method: 'native' | 'whatsapp' | 'messages' | 'copy' | etc.
  trackEvent('user.share', { place: placeName?.slice(0, 80), method })
}

export function trackFeedback(rating, comment, screen) {
  trackEvent('user.feedback', {
    rating,
    comment: comment?.slice(0, 500),
    screen,
  })
}

export function trackRecommendationLoad(screen, count, durationMs, payloadSummary) {
  trackEvent('user.recommendations_loaded', {
    screen,
    count,
    duration_ms:     durationMs,
    payload_summary: payloadSummary,
  })
}

// ── Initialise everything ─────────────────────────────────────────────────────

export function initAnalytics() {
  if (isInitialised) return
  isInitialised = true

  measurePageLoad()
  initErrorTracking()
  startFlushTimer()

  // Flush on page close
  window.addEventListener('beforeunload', flush)

  trackEvent('session.start', {
    user_agent:  navigator.userAgent.slice(0, 200),
    screen:      `${window.screen.width}x${window.screen.height}`,
    language:    navigator.language,
    timezone:    Intl.DateTimeFormat().resolvedOptions().timeZone,
    connection:  getConnectionInfo(),
  })

  console.debug('[Analytics] Initialised — session:', SESSION_ID)
}
