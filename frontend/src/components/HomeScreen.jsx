import { useState, useEffect, useRef } from 'react'
import { useLocalTime, getGreeting, getTimeContext } from '../hooks'
import { VIBE_CHIPS } from '../constants'
import { addRecentlyViewed, saveState } from '../storage'
import { measureApiCall, trackDetailView, trackChipTap, trackSearch } from '../analytics'
import PlaceCard from './PlaceCard'

// Dining style → semantic text
const DINING_STYLE_LABELS = {
  'casual':      'Casual dining, relaxed atmosphere',
  'sit-down':    'Sit-down restaurant, full service',
  'fine-dining': 'Fine dining, upscale, special occasion',
  'quick-bites': 'Quick bites, fast casual',
  'brunch':      'Brunch spots, weekend morning',
  'late-night':  'Late night eating, open late',
}

// Vibe tags → rich semantic activities text
const VIBE_TO_ACTIVITIES = {
  'Hidden Gems':   'hidden gem bars and restaurants, off the beaten path, unique spots',
  'Rooftops':      'rooftop bars, rooftop restaurants, outdoor views, rooftop terrace',
  'Cocktail Bars': 'craft cocktails, cocktail bars, mixology, creative drinks',
  'Live Music':    'live music venues, jazz bars, live entertainment, music events',
  'Girls Night':   'girls night out, fun group spots, social bars, lively atmosphere',
  'Speakeasies':   'speakeasy bars, hidden bars, intimate cocktail lounges',
  'Date Night':    'date night restaurants, romantic dining, intimate atmosphere',
  'Brunch':        'brunch spots, weekend brunch, bottomless brunch, morning cocktails',
  'Fine Dining':   'fine dining, upscale restaurants, tasting menus, gourmet',
  'Casual':        'casual bars and restaurants, laid back vibe, neighbourhood spots',
  'Dancing':       'dancing, nightclubs, DJ bars, dance floors, nightlife',
  'Outdoor':       'outdoor seating, patios, rooftop, beer gardens, al fresco',
  'Wine Bars':     'wine bars, natural wine, wine tasting, sommelier',
  'Sports Bars':   'sports bars, watching games, pub, lively crowd',
  'Craft Beer':    'craft beer bars, taprooms, brewery, local beer',
  'Art & Culture': 'art galleries, cultural venues, creative spaces, exhibitions',
}

// Chip → API payload mapping
const CHIP_TO_PAYLOAD = {
  'Rooftop': {
    activities:         'rooftop bars, rooftop restaurants, outdoor rooftop terrace, skyline views',
    dining_preferences: 'Rooftop dining, outdoor',
  },
  'Chill': {
    activities:         'chill bars, relaxed lounges, low-key spots, laid back vibe, quiet drinks',
    dining_preferences: 'Casual dining, relaxed atmosphere, cozy spots',
  },
  'Hidden Gem': {
    activities:         'hidden gem bars, secret spots, off the beaten path, speakeasy, unique local bars',
    dining_preferences: 'Intimate dining, local favourite, neighbourhood gem',
  },
  'Girls Night': {
    activities:         'girls night out, fun social bars, cocktail bars, dancing, lively group spots',
    dining_preferences: 'Social dining, cocktails, fun atmosphere',
    drinks:             true,
  },
  'Date Night': {
    activities:         'romantic restaurants, date night bars, intimate atmosphere, candlelit dining',
    dining_preferences: 'Fine dining, romantic, intimate, date night',
  },
  'Brunch': {
    activities:         'brunch spots, weekend brunch, eggs benedict, bottomless mimosas, brunch cocktails',
    dining_preferences: 'Brunch, morning dining, casual weekend',
  },
  'Cocktails': {
    activities:         'craft cocktails, cocktail bars, mixology, creative drinks, bar hopping',
    dining_preferences: 'Cocktail bars, upscale drinks, mixology',
    drinks:             true,
  },
  'Live Music': {
    activities:         'live music venues, jazz bars, live bands, open mic, music events',
    dining_preferences: 'Music venue, entertainment, live performance',
  },
  'Late Night': {
    activities:         'late night bars, open late, nightlife, after midnight, clubs',
    dining_preferences: 'Late night dining, bars, nightlife',
    drinks:             true,
  },
  'Speakeasy': {
    activities:         'speakeasy bars, hidden bars, secret entrance, prohibition style, intimate cocktail lounge',
    dining_preferences: 'Speakeasy, intimate bar, craft cocktails',
    drinks:             true,
  },
  'Wine Bar': {
    activities:         'wine bars, natural wine, wine tasting, sommelier, wine list',
    dining_preferences: 'Wine bar, fine wine, European dining',
    drinks:             true,
  },
  'Outdoor': {
    activities:         'outdoor seating, patio dining, beer garden, al fresco, rooftop, park',
    dining_preferences: 'Outdoor dining, garden, terrace',
  },
  'Dancing': {
    activities:         'dancing, nightclubs, DJ nights, dance floor, nightlife, clubs',
    dining_preferences: 'Nightclub, bar with dancing, entertainment',
    drinks:             true,
  },
}

function getChipPayload(chip) {
  return CHIP_TO_PAYLOAD[chip] || {
    activities: `${chip.toLowerCase()} bars, restaurants, and spots in New York City`,
  }
}

export default function HomeScreen({
  onViewDetail,
  onNavigate,
  savedList,
  toggleSave,
  recentlyViewed,
  setRecentlyViewed,
  profile,
}) {
  const time = useLocalTime()
  const ctx  = getTimeContext()

  const [allPlaces,     setAllPlaces]     = useState([])
  const [topRecs,       setTopRecs]       = useState([])
  const [timedRecs,     setTimedRecs]     = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)

  const [activeChip,    setActiveChip]    = useState(null)
  const [chipResults,   setChipResults]   = useState([])
  const [chipLoading,   setChipLoading]   = useState(false)

  const [searchQuery,   setSearchQuery]   = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching,     setSearching]     = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    fetchTopRecs()
    fetchTimedRecs()
    fetchAllPlaces()
  }, [])

  // ── Semantic profile builder ───────────────────────────────────────────────
  function buildSemanticProfile() {
    const activitiesParts        = []
    const diningPreferencesParts = []

    if (profile?.vibes?.length > 0) {
      profile.vibes.forEach(vibe => {
        const mapped = VIBE_TO_ACTIVITIES[vibe]
        activitiesParts.push(mapped || vibe.toLowerCase())
      })
    }
    if (profile?.foodPrefs?.cuisines?.length > 0) {
      activitiesParts.push(
        profile.foodPrefs.cuisines.map(c => `${c} food and restaurants`).join(', ')
      )
    }
    if (profile?.foodPrefs?.dietary?.length > 0
        && !profile.foodPrefs.dietary.includes('No restrictions')) {
      activitiesParts.push(profile.foodPrefs.dietary.join(', ') + ' friendly options')
    }
    if (profile?.neighborhoods?.length > 1) {
      activitiesParts.push(
        `also loves ${profile.neighborhoods.slice(1).join(' and ')} neighbourhood spots`
      )
    }
    if (profile?.foodPrefs?.diningStyle) {
      const label = DINING_STYLE_LABELS[profile.foodPrefs.diningStyle]
      if (label) diningPreferencesParts.push(label)
    }
    if (profile?.prefs?.budget) {
      const budgetMap = {
        '$':         'budget friendly, cheap eats, affordable spots',
        '$$':        'mid-range, reasonably priced restaurants',
        '$$ to $$$': 'mid to upscale range dining',
        '$$$':       'upscale dining, worth the splurge',
        '$$$$':      'luxury dining, fine dining, high end restaurants',
      }
      const budgetText = budgetMap[profile.prefs.budget]
      if (budgetText) diningPreferencesParts.push(budgetText)
    }

    return {
      activities:         activitiesParts.join(', ')        || null,
      dining_preferences: diningPreferencesParts.join(', ') || null,
    }
  }

  function buildTopRecsPayload() {
    const semantic = buildSemanticProfile()
    const payload  = { top_n: 6 }
    if (profile?.neighborhoods?.length > 0) {
      payload.preferred_neighborhood = profile.neighborhoods[0]
    }
    if (semantic.activities)         payload.activities         = semantic.activities
    if (semantic.dining_preferences) payload.dining_preferences = semantic.dining_preferences
    if (profile?.prefs?.music)       payload.music_genres       = profile.prefs.music
    const drinkVibes = ['Cocktail Bars', 'Speakeasies', 'Wine Bars', 'Craft Beer']
    if (profile?.vibes?.some(v => drinkVibes.includes(v))) payload.drinks = true
    return payload
  }

  // ── Top recs ───────────────────────────────────────────────────────────────
  async function fetchTopRecs() {
    setLoading(true)
    setError(null)
    try {
      const payload = buildTopRecsPayload()
      const res  = await measureApiCall(
        'recommendations/top',
        fetch('/api/recommendations', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      )
      const data = await res.json()
      if (data.success && data.recommendations?.length > 0) {
        setTopRecs(data.recommendations)
      } else if (data.success && data.recommendations?.length === 0) {
        await fetchTopRecsNoNeighborhood()
      } else {
        setError(data.detail || 'Could not load recommendations.')
      }
    } catch (e) {
      console.error('[HomeScreen] Top recs error:', e)
      setError('Could not reach the recommendations API.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchTopRecsNoNeighborhood() {
    try {
      const semantic = buildSemanticProfile()
      const payload  = { top_n: 6 }
      if (semantic.activities)         payload.activities         = semantic.activities
      if (semantic.dining_preferences) payload.dining_preferences = semantic.dining_preferences
      if (profile?.prefs?.music)       payload.music_genres       = profile.prefs.music
      const res  = await measureApiCall(
        'recommendations/top-fallback',
        fetch('/api/recommendations', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      )
      const data = await res.json()
      if (data.success) setTopRecs(data.recommendations || [])
      else setError(data.detail || 'Could not load recommendations.')
    } catch (e) {
      setError('Could not reach the recommendations API.')
    }
  }

  // ── Timed recs ─────────────────────────────────────────────────────────────
  async function fetchTimedRecs() {
    try {
      const semantic    = buildSemanticProfile()
      const timePayload = ctx.payload
      const combinedActivities = [semantic.activities, timePayload.activities]
        .filter(Boolean).join(', ') || undefined
      const combinedDining = [semantic.dining_preferences, timePayload.dining_preferences]
        .filter(Boolean).join(', ') || undefined

      const payload = {
        top_n: 4,
        ...(profile?.neighborhoods?.length > 0
          ? { preferred_neighborhood: profile.neighborhoods[0] } : {}),
        ...(profile?.prefs?.music ? { music_genres: profile.prefs.music } : {}),
        ...(timePayload.atmosphere ? { atmosphere: timePayload.atmosphere } : {}),
        ...(timePayload.drinks     ? { drinks: true }                       : {}),
        ...(combinedActivities ? { activities: combinedActivities }         : {}),
        ...(combinedDining     ? { dining_preferences: combinedDining }     : {}),
      }

      const res  = await measureApiCall(
        'recommendations/timed',
        fetch('/api/recommendations', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      )
      const data = await res.json()
      if (data.success && data.recommendations?.length > 0) {
        setTimedRecs(data.recommendations)
      } else if (data.success && data.recommendations?.length === 0) {
        const fallback = { ...payload }
        delete fallback.preferred_neighborhood
        const res2  = await measureApiCall(
          'recommendations/timed-fallback',
          fetch('/api/recommendations', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fallback),
          })
        )
        const data2 = await res2.json()
        if (data2.success) setTimedRecs(data2.recommendations || [])
      }
    } catch (e) {
      console.error('[HomeScreen] Timed recs error:', e)
    }
  }

  // ── All places for text search ─────────────────────────────────────────────
  async function fetchAllPlaces() {
    try {
      const res  = await measureApiCall('places/all', fetch('/api/places'))
      const data = await res.json()
      if (data.success) setAllPlaces(data.places || [])
    } catch (e) { console.error('[HomeScreen] All places error:', e) }
  }

  // ── Chip tap ──────────────────────────────────────────────────────────────
  async function handleChipTap(chip) {
    if (activeChip === chip) {
      setActiveChip(null); setChipResults([]); setSearchQuery('')
      return
    }
    setActiveChip(chip); setSearchQuery(''); setChipResults([]); setChipLoading(true)

    try {
      const chipPayload = getChipPayload(chip)
      const payload = {
        ...chipPayload,
        top_n: 10,
        ...(profile?.neighborhoods?.length > 0
          ? { preferred_neighborhood: profile.neighborhoods[0] } : {}),
        ...(profile?.prefs?.music ? { music_genres: profile.prefs.music } : {}),
      }

      const res  = await measureApiCall(
        `recommendations/chip-${chip.toLowerCase().replace(/\s+/g, '-')}`,
        fetch('/api/recommendations', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      )
      const data = await res.json()

      if (data.success && data.recommendations?.length > 0) {
        setChipResults(data.recommendations)
        trackChipTap(chip, data.recommendations.length)   // ← track chip tap
      } else {
        const fallbackPayload = { ...chipPayload, top_n: 10 }
        if (profile?.prefs?.music) fallbackPayload.music_genres = profile.prefs.music
        const res2  = await measureApiCall(
          `recommendations/chip-${chip.toLowerCase().replace(/\s+/g, '-')}-fallback`,
          fetch('/api/recommendations', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fallbackPayload),
          })
        )
        const data2 = await res2.json()
        setChipResults(data2.recommendations || [])
        trackChipTap(chip, data2.recommendations?.length || 0)  // ← track chip tap
      }
    } catch (e) {
      console.error(`[HomeScreen] Chip "${chip}" error:`, e)
      setChipResults([])
    } finally {
      setChipLoading(false)
    }
  }

  // ── Text search ────────────────────────────────────────────────────────────
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) { setSearchResults([]); setSearching(false); return }
    setActiveChip(null); setChipResults([]); setSearching(true)
    const results = allPlaces.filter(p =>
      (p.Name_of_place || '').toLowerCase().includes(q) ||
      (p.Neighborhood  || '').toLowerCase().includes(q) ||
      (p.Type          || '').toLowerCase().includes(q) ||
      (p.Category      || '').toLowerCase().includes(q) ||
      (p.Vibe_Type     || '').toLowerCase().includes(q)
    ).slice(0, 20)
    setSearchResults(results)
    trackSearch(q, results.length)        // ← track search query + result count
  }, [searchQuery, allPlaces])

  function handleViewDetail(place) {
    setRecentlyViewed(addRecentlyViewed(place, recentlyViewed))
    // ← track which place was viewed, from which neighborhood
    trackDetailView(
      place.Name_of_place || place.name,
      place.Neighborhood  || place.neighborhood,
      place.similarity_score
    )
    onViewDetail(place)
  }

  function clearAll() {
    setActiveChip(null); setChipResults([]); setSearchQuery('')
  }

  const showChipResults = !!activeChip
  const showTextSearch  = !activeChip && searchQuery.trim().length > 0
  const showDefault     = !activeChip && !showTextSearch
  const displayName     = profile?.name || 'there'

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* ── Header ── */}
      <div className="bg-black text-white px-5 pt-4 pb-5 shrink-0">
        <div className="flex justify-between text-xs text-gray-400 mb-3">
          <span>{time}</span><span>Places</span>
        </div>
        <p className="text-sm text-gray-400 mb-0.5">{getGreeting()}, {displayName}</p>
        <h1 className="text-2xl font-bold mb-4">Find your next spot</h1>
        <div className="flex items-center bg-white/10 rounded-xl px-3 py-2 gap-2 mb-3">
          <span className="text-sm">🔍</span>
          <input
            ref={searchRef}
            className="flex-1 bg-transparent text-white text-sm placeholder-gray-400 outline-none"
            placeholder="Search by vibe, area, or place name"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value)
              if (e.target.value) { setActiveChip(null); setChipResults([]) }
            }}
          />
          {(searchQuery || activeChip) && (
            <button className="text-gray-400 text-sm" onClick={clearAll}>✕</button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {VIBE_CHIPS.map(c => (
            <button
              key={c}
              onClick={() => handleChipTap(c)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors
                ${activeChip === c
                  ? 'bg-white text-black border-white'
                  : 'border-white/30 text-white/80 hover:bg-white/10'}`}
            >{c}</button>
          ))}
        </div>
      </div>
      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
        {/* Chip results */}
        {showChipResults && (
          <section>
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{activeChip} spots</h3>
                {!chipLoading && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {chipResults.length} recommendations ranked by match
                  </p>
                )}
              </div>
              <button className="text-xs text-gray-500" onClick={clearAll}>Clear</button>
            </div>
            {chipLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                    <div className="h-2 bg-gray-100 rounded w-1/3 mb-2" />
                    <div className="h-2 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}
            {!chipLoading && chipResults.length === 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
                <p className="text-sm text-gray-500">No places found for "{activeChip}"</p>
                <p className="text-xs text-gray-400 mt-1">Try a different vibe or use the Search tab</p>
              </div>
            )}
            {!chipLoading && chipResults.length > 0 && (
              <div className="space-y-2">
                {chipResults.map((p, i) => (
                  <PlaceCard key={i} place={p} onClick={() => handleViewDetail(p)} />
                ))}
              </div>
            )}
          </section>
        )}
        {/* Text search results */}
        {showTextSearch && (
          <section>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-900">
                {searchResults.length > 0 ? `${searchResults.length} results` : 'No results'}
              </h3>
              <button className="text-xs text-gray-500" onClick={clearAll}>Clear</button>
            </div>
            {searchResults.length === 0 && searching && (
              <p className="text-sm text-gray-400 text-center py-4">
                No places match "{searchQuery}". Try a vibe chip above or use the Search tab.
              </p>
            )}
            <div className="space-y-2">
              {searchResults.map((p, i) => (
                <PlaceCard key={i} place={p} onClick={() => handleViewDetail(p)} />
              ))}
            </div>
          </section>
        )}
        {/* Default home content */}
        {showDefault && (
          <>
            <div className="bg-black text-white rounded-2xl p-4 flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{ctx.label}</p>
                <h2 className="font-bold text-base">Curated for right now</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Picked for {displayName} based on the time of day and your preferences.
                </p>
              </div>
              <span className="text-2xl shrink-0">✨</span>
            </div>
            {timedRecs.length > 0 && (
              <section>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">{ctx.label}</h3>
                  <button className="text-xs text-gray-500" onClick={() => onNavigate('search')}>See all</button>
                </div>
                <div className="space-y-2">
                  {timedRecs.map((p, i) => (
                    <PlaceCard key={i} place={p} onClick={() => handleViewDetail(p)} />
                  ))}
                </div>
              </section>
            )}
            <section>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-900">Top matches for {displayName}</h3>
                <button className="text-xs text-gray-500" onClick={() => onNavigate('search')}>See all</button>
              </div>
              {loading && (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                      <div className="h-2 bg-gray-100 rounded w-1/3 mb-2" />
                      <div className="h-2 bg-gray-100 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              )}
              {!loading && error && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Couldn't load recommendations</p>
                  <p className="text-xs text-gray-400 mb-3">{error}</p>
                  <button className="text-xs font-medium text-black underline" onClick={fetchTopRecs}>
                    Try again
                  </button>
                </div>
              )}
              {!loading && !error && topRecs.length === 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">No recommendations yet</p>
                  <p className="text-xs text-gray-400 mb-3">
                    Try tapping a vibe chip above or use the Search tab.
                  </p>
                  <button className="text-xs font-medium text-black underline" onClick={fetchTopRecs}>
                    Refresh
                  </button>
                </div>
              )}
              {!loading && !error && topRecs.length > 0 && (
                <div className="space-y-2">
                  {topRecs.map((p, i) => (
                    <PlaceCard key={i} place={p} onClick={() => handleViewDetail(p)} />
                  ))}
                </div>
              )}
            </section>
            {recentlyViewed.length > 0 && (
              <section className="bg-white rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">Recently viewed</h3>
                  <button
                    className="text-xs text-gray-500"
                    onClick={() => { saveState('recentlyViewed', []); setRecentlyViewed([]) }}
                  >Clear</button>
                </div>
                <div className="space-y-2">
                  {recentlyViewed.slice(0, 3).map((p, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center cursor-pointer py-1"
                      onClick={() => handleViewDetail(p)}
                    >
                      <span className="text-sm font-medium text-gray-800">
                        {p.Name_of_place || p.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {p.Neighborhood || p.neighborhood}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <section className="bg-white rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-900">Saved for later</h3>
                <button className="text-xs text-gray-500" onClick={() => onNavigate('saved')}>View list</button>
              </div>
              {savedList.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">
                  No saved places yet. Heart a place to save it!
                </p>
              ) : (
                <div className="space-y-2">
                  {savedList.map(item => (
                    <div
                      key={item.name}
                      className="flex justify-between items-center cursor-pointer py-1"
                      onClick={() => handleViewDetail(item)}
                    >
                      <span className="text-sm font-medium text-gray-800">{item.name}</span>
                      <button
                        className="text-base"
                        onClick={e => { e.stopPropagation(); toggleSave(item) }}
                      >❤️</button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}