import { useState, useEffect } from 'react'
import { useLocalTime } from '../hooks'
import { CITIES, NEIGHBORHOODS_BY_CITY, VIBES, PRICE_TIERS, ACTIVITY_TYPES } from '../constants'
import PlaceCard from './PlaceCard'

export default function SearchScreen({ onViewDetail, pendingSearch, onPendingSearchConsumed }) {
  const time = useLocalTime()
  const [city, setCity] = useState('Any')
  const [form, setForm] = useState({
    preferred_neighborhood: 'Any',
    atmosphere:             'Any',
    max_price_tier:         'Any',
    activity_type:          'Any',
    drinks:                 false,
    activities:             '',
    music_genres:           '',
    top_n:                  10,
  })
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [searched, setSearched] = useState(false)

  // ── Auto-run search when a notification fires one ─────────────────────────
  useEffect(() => {
    if (!pendingSearch) return

    // Merge the notification's params into the form so filters reflect the search
    setForm(prev => ({
      ...prev,
      activity_type:  pendingSearch.activity_type  || 'Any',
      atmosphere:     pendingSearch.atmosphere      || 'Any',
      drinks:         pendingSearch.drinks          || false,
      top_n:          pendingSearch.top_n           || 10,
    }))

    // Run the search immediately with the pending params
    runSearch(pendingSearch)

    // Tell App we've consumed the pending search so it doesn't re-fire
    if (onPendingSearchConsumed) onPendingSearchConsumed()
  }, [pendingSearch])

  const availableNeighborhoods = NEIGHBORHOODS_BY_CITY[city] || NEIGHBORHOODS_BY_CITY['Any']

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  function handleCityChange(newCity) {
    setCity(newCity)
    setForm(p => ({ ...p, preferred_neighborhood: 'Any' }))
  }

  // Accepts an optional override payload (used by notification auto-run)
  async function runSearch(overrideParams) {
    setLoading(true)
    setSearched(true)
    try {
      const base    = overrideParams || form
      const payload = { ...base }

      // Clean up 'Any' sentinel values
      if (payload.preferred_neighborhood === 'Any') delete payload.preferred_neighborhood
      if (payload.atmosphere             === 'Any') delete payload.atmosphere
      if (payload.max_price_tier         === 'Any') delete payload.max_price_tier
      if (payload.activity_type          === 'Any') delete payload.activity_type
      payload.top_n = parseInt(payload.top_n) || 10

      if (!payload.preferred_neighborhood && city !== 'Any') {
        const hoods = NEIGHBORHOODS_BY_CITY[city].filter(n => n !== 'Any')
        if (hoods.length > 0) payload.preferred_neighborhood = hoods[0]
      }

      const res  = await fetch('/api/recommendations', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) setResults(data.recommendations)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  // Manual search uses current form state
  function search() { runSearch(null) }

  const pillCls = active =>
    `text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer
     ${active
       ? 'bg-black text-white border-black'
       : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* ── Header ── */}
      <div className="bg-black text-white px-5 pt-4 pb-5 shrink-0">
        <div className="flex justify-between text-xs text-gray-400 mb-3">
          <span>{time}</span><span>Search</span>
        </div>
        <h1 className="text-2xl font-bold">Find places</h1>
      </div>
      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
        {/* Loading state when notification auto-triggers a search */}
        {loading && searched && results.length === 0 && (
          <div className="bg-black text-white rounded-2xl p-4 flex items-center gap-3">
            <span className="text-xl animate-pulse">✨</span>
            <p className="text-sm font-medium">Finding the best spots for you…</p>
          </div>
        )}
        {/* Filter card */}
        <div className="bg-white rounded-2xl p-4 space-y-4">
          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              City
            </label>
            <select
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
              value={city}
              onChange={e => handleCityChange(e.target.value)}
            >
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          {/* Neighborhood */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Neighborhood
            </label>
            <select
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
              value={form.preferred_neighborhood}
              onChange={e => set('preferred_neighborhood', e.target.value)}
            >
              {availableNeighborhoods.map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          {/* Atmosphere */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Atmosphere
            </label>
            <select
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
              value={form.atmosphere}
              onChange={e => set('atmosphere', e.target.value)}
            >
              {VIBES.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          {/* Max Price */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Max Price
            </label>
            <div className="flex gap-2 flex-wrap">
              {PRICE_TIERS.map(t => (
                <button
                  key={t}
                  className={pillCls(form.max_price_tier === t)}
                  onClick={() => set('max_price_tier', t)}
                >{t}</button>
              ))}
            </div>
          </div>
          {/* Activity Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Activity Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {ACTIVITY_TYPES.map(t => (
                <button
                  key={t}
                  className={pillCls(form.activity_type === t)}
                  onClick={() => set('activity_type', t)}
                >{t}</button>
              ))}
            </div>
          </div>
          {/* Activities */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Activities
            </label>
            <input
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
              placeholder="e.g. Eating, Museums, Dancing"
              value={form.activities}
              onChange={e => set('activities', e.target.value)}
            />
          </div>
          {/* Music */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Music
            </label>
            <input
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
              placeholder="e.g. Hip-Hop, Jazz, R&B"
              value={form.music_genres}
              onChange={e => set('music_genres', e.target.value)}
            />
          </div>
          {/* Drinks */}
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              className="rounded"
              checked={form.drinks}
              onChange={e => set('drinks', e.target.checked)}
            />
            Must serve alcohol
          </label>
          <button
            onClick={search}
            disabled={loading}
            className="w-full bg-black text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-900 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Searching…' : '🔍 Get Recommendations'}
          </button>
        </div>
        {/* Empty state */}
        {searched && !loading && results.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            No places found. Try relaxing some filters.
          </p>
        )}
        {/* Results */}
        {results.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Results ({results.length})
            </h3>
            <div className="space-y-2">
              {results.map((p, i) => (
                <PlaceCard key={i} place={p} onClick={() => onViewDetail(p)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}