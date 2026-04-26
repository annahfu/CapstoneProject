import { useState, useEffect } from 'react'
import { useLocalTime } from '../hooks'
import ShareModal     from './modals/ShareModal'
import AddToPlanModal from './modals/AddToPlanModal'
import PlaceCard      from './PlaceCard'

export default function DetailScreen({
  place, onBack, onSave, saved,
  collections, onAddToCollections,
  onLogVisit, visitLog, onViewDetail,
}) {
  const time = useLocalTime()
  const [showShare, setShowShare] = useState(false)
  const [showPlan,  setShowPlan]  = useState(false)
  const [similar,   setSimilar]   = useState([])
  const [visitDone, setVisitDone] = useState(false)

  if (!place) return null

  const name       = place.Name_of_place || place.name
  const visitCount = (visitLog || []).filter(v => v.name === name).length

  // similarity_score still exists on the place object and is used
  // by the backend for ranking — we just don't show it to users

  useEffect(() => { fetchSimilar() }, [name])

  async function fetchSimilar() {
    try {
      const res  = await fetch('/api/recommendations', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferred_neighborhood: place.Neighborhood || place.neighborhood,
          atmosphere:             place.Vibe_Type    || undefined,
          top_n:                  4,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSimilar(
          data.recommendations
            .filter(p => (p.Name_of_place || p.name) !== name)
            .slice(0, 3)
        )
      }
    } catch (e) { console.error(e) }
  }

  function handleLogVisit() {
    onLogVisit({
      name,
      type:         place.Type  || place.type,
      neighborhood: place.Neighborhood || place.neighborhood,
      loggedAt:     Date.now(),
    })
    setVisitDone(true)
    setTimeout(() => setVisitDone(false), 2500)
  }

  function openDirections() {
    const addr = place.Address || `${name}, ${place.Neighborhood || ''}, New York City`
    window.open(`https://maps.google.com/?q=${encodeURIComponent(addr)}`, '_blank')
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {showShare && <ShareModal    place={place} onClose={() => setShowShare(false)} />}
      {showPlan  && (
        <AddToPlanModal
          place={place}
          collections={collections}
          onAddToCollections={onAddToCollections}
          onClose={() => setShowPlan(false)}
        />
      )}
      {/* ── Header ── */}
      <div className="bg-black text-white px-5 pt-4 pb-5 shrink-0">
        <div className="flex justify-between text-xs text-gray-400 mb-3">
          <span>{time}</span><span>Details</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <button
            className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-full text-white"
            onClick={onBack}
          >←</button>
          <button className="text-xl" onClick={() => onSave(place)}>
            {saved ? '❤️' : '♡'}
          </button>
        </div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Recommendation</p>
        <h2 className="text-xl font-bold">{name}</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          {place.Neighborhood || place.neighborhood} • {place.Type || place.type}
        </p>
      </div>
      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
        {/* Visit-logged toast */}
        {visitDone && (
          <div className="bg-green-50 text-green-700 text-sm rounded-xl px-4 py-2">
            Visit logged! ✓
          </div>
        )}
        {/* ── Match % and "Why it matches you" section removed ── */}
        {/* Vibe & tags */}
        <section className="bg-white rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Vibe and tags</h3>
            <button className="text-xs text-gray-500" onClick={() => setShowShare(true)}>
              Share 📤
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            {place.Vibe_Type || place.note || 'A great spot with a unique atmosphere.'}
          </p>
          <div className="flex gap-2 flex-wrap">
            {[place.Type || place.type, place.Category, place.price_tier]
              .filter(Boolean)
              .map(t => (
                <span key={t} className="text-xs bg-black text-white px-3 py-1 rounded-full">
                  {t}
                </span>
              ))}
          </div>
        </section>
        {/* Place details */}
        <section className="bg-white rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Place details</h3>
            <button className="text-xs text-gray-500" onClick={openDirections}>
              🗺 Directions
            </button>
          </div>
          <div className="space-y-2">
            {[
              ['Neighborhood', place.Neighborhood || place.neighborhood],
              ['Price',        place.price_tier   || place.Price_Level || 'N/A'],
              ['Category',     place.Category     || place.type],
              ['Address',      place.Address      || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-400">{k}</span>
                <span className="text-gray-800 font-medium text-right max-w-[60%]">{v}</span>
              </div>
            ))}
          </div>
        </section>
        {/* Visit log */}
        <section className="bg-white rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Visit log</h3>
            {visitCount > 0 && (
              <span className="text-xs text-gray-500">
                {visitCount} visit{visitCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={handleLogVisit}
            className="w-full border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {visitDone ? '✓ Logged!' : '📍 I went here'}
          </button>
          {visitCount > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              You've visited this place {visitCount} time{visitCount !== 1 ? 's' : ''}
            </p>
          )}
        </section>
        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowPlan(true)}
            className="bg-black text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-900 transition-colors"
          >Add to plan</button>
          <button
            onClick={() => onSave(place)}
            className="border border-gray-200 text-sm font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {saved ? 'Saved ❤️' : 'Save place'}
          </button>
        </div>
        {/* You might also like */}
        {similar.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">You might also like</h3>
            <div className="space-y-2">
              {similar.map((p, i) => (
                <PlaceCard key={i} place={p} onClick={() => onViewDetail(p)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}