import { useState, useEffect, useRef } from 'react'
import { useLocalTime, getGreeting, getTimeContext } from '../hooks'
import { VIBE_CHIPS } from '../constants'
import { addRecentlyViewed, saveState } from '../storage'
import PlaceCard from './PlaceCard'

export default function HomeScreen({ profile, onViewDetail, onNavigate, savedList, toggleSave, recentlyViewed, setRecentlyViewed }) {
  const time = useLocalTime()
  const ctx = getTimeContext()

  const [allPlaces, setAllPlaces] = useState([])
  const [topRecs, setTopRecs] = useState([])
  const [timedRecs, setTimedRecs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults,setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const searchRef = useRef(null)

  // Load all places once for instant search
  useEffect(() => {
    fetchTopRecs()
    fetchTimedRecs()
    fetchAllPlaces()
  }, [])

  async function fetchTopRecs() {
    setLoading(true)
    try {
      // try cache first
      const cached = localStorage.getItem('nyc_cached_recs')
      if (cached) { setTopRecs(JSON.parse(cached)); setLoading(false) }

      const res = await fetch('/api/recommendations', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ activity_type:'Both', top_n:3 })
      })
      const data = await res.json()
      if (data.success) {
        setTopRecs(data.recommendations)
        saveState('cachedRecs', data.recommendations)
      }
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function fetchTimedRecs() {
    try {
      const res = await fetch('/api/recommendations', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(ctx.payload)
      })
      const data = await res.json()
      if (data.success) setTimedRecs(data.recommendations)
    } catch(e) { console.error(e) }
  }

  async function fetchAllPlaces() {
    try {
      const res = await fetch('/api/places')
      const data = await res.json()
      if (data.success) setAllPlaces(data.places)
    } catch(e) { console.error(e) }
  }

  // Instant search across name, neighborhood, type, vibe
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) { setSearchResults([]); setSearching(false); return }
    setSearching(true)
    const results = allPlaces.filter(p =>
      (p.Name_of_place||'').toLowerCase().includes(q) ||
      (p.Neighborhood ||'').toLowerCase().includes(q) ||
      (p.Type ||'').toLowerCase().includes(q) ||
      (p.Category ||'').toLowerCase().includes(q) ||
      (p.Vibe_Type ||'').toLowerCase().includes(q)
    ).slice(0, 20)
    setSearchResults(results)
  }, [searchQuery, allPlaces])

  function handleViewDetail(place) {
    const updated = addRecentlyViewed(place, recentlyViewed)
    setRecentlyViewed(updated)
    onViewDetail(place)
  }

  function handleChipClick(chip) {
    setSearchQuery(chip)
    searchRef.current?.focus()
  }

  const showSearch = searchQuery.trim().length > 0

  return (
    <div className="screen-body">
      <div className="screen-header">
        <div className="status-bar"><span>{time}</span><span>Places</span></div>
        <p className="header-sub">{getGreeting()}, {profile?.name || 'there'}</p>
        <h1 className="header-title">Find your next spot</h1>

        {/* Live search bar */}
        <div className="search-bar-live">
          <span className="search-icon-inline">🔍</span>
          <input
            ref={searchRef}
            className="search-input"
            placeholder="Search by vibe, area, or place type"
            value={searchQuery}
            onChange={e=>setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={()=>setSearchQuery('')}>✕</button>
          )}
        </div>

        <div className="chip-row">
          {VIBE_CHIPS.map(c=>(
            <button key={c} className={`chip ${searchQuery===c?'chip-active':''}`} onClick={()=>handleChipClick(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div className="screen-content">

        {/* ── Search results ── */}
        {showSearch && (
          <section>
            <div className="section-header">
              <h3 className="section-title">
                {searchResults.length > 0 ? `${searchResults.length} results` : 'No results'}
              </h3>
              <button className="section-action" onClick={()=>setSearchQuery('')}>Clear</button>
            </div>
            {searchResults.length === 0 && searching && (
              <div className="empty-state">No places match "{searchQuery}". Try a different search.</div>
            )}
            <div className="card-list">
              {searchResults.map((p,i)=>(
                <PlaceCard key={i} place={p} onClick={()=>handleViewDetail(p)}/>
              ))}
            </div>
          </section>
        )}

        {/* ── Normal home content (hidden when searching) ── */}
        {!showSearch && <>
          {/* Time-aware banner */}
          <div className="dark-banner">
            <div>
              <p className="banner-eyebrow">{ctx.label}</p>
              <h2 className="banner-title">Curated for right now</h2>
              <p className="banner-desc">Recommendations picked based on the time of day and your preferences.</p>
            </div>
            <span className="banner-icon">✨</span>
          </div>

          {/* Time-aware recs */}
          {timedRecs.length > 0 && (
            <section>
              <div className="section-header">
                <h3 className="section-title">{ctx.label}</h3>
                <button className="section-action" onClick={()=>onNavigate('search')}>See all</button>
              </div>
              <div className="card-list">
                {timedRecs.map((p,i)=>(
                  <PlaceCard key={i} place={p} onClick={()=>handleViewDetail(p)}/>
                ))}
              </div>
            </section>
          )}

          {/* Top matches */}
          <section>
            <div className="section-header">
              <h3 className="section-title">Top matches</h3>
              <button className="section-action" onClick={()=>onNavigate('search')}>See all</button>
            </div>
            {loading && <div className="loading-msg">Finding your spots…</div>}
            <div className="card-list">
              {topRecs.map((p,i)=>(
                <PlaceCard key={i} place={p} onClick={()=>handleViewDetail(p)}/>
              ))}
            </div>
          </section>

          {/* Recently viewed */}
          {recentlyViewed.length > 0 && (
            <section className="neutral-section">
              <div className="section-header">
                <h3 className="section-title">Recently viewed</h3>
                <button className="section-action" onClick={()=>{ saveState('recentlyViewed',[]); setRecentlyViewed([]) }}>Clear</button>
              </div>
              <div className="card-list">
                {recentlyViewed.slice(0,3).map((p,i)=>(
                  <div key={i} className="saved-row" onClick={()=>handleViewDetail(p)}>
                    <span className="saved-name">{p.Name_of_place||p.name}</span>
                    <span className="place-neighborhood" style={{fontSize:'0.75rem'}}>{p.Neighborhood||p.neighborhood}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Saved for later */}
          <section className="neutral-section">
            <div className="section-header">
              <h3 className="section-title">Saved for later</h3>
              <button className="section-action" onClick={()=>onNavigate('saved')}>View list</button>
            </div>
            {savedList.length === 0 && (
              <p style={{fontSize:'0.82rem',color:'#aaa',textAlign:'center',padding:'0.75rem 0'}}>
                No saved places yet. Heart a place to save it!
              </p>
            )}
            <div className="card-list">
              {savedList.map(item=>(
                <div key={item.name} className="saved-row" onClick={()=>handleViewDetail(item)}>
                  <span className="saved-name">{item.name}</span>
                  <button className="heart-btn" onClick={e=>{e.stopPropagation();toggleSave(item)}}>❤️</button>
                </div>
              ))}
            </div>
          </section>
        </>}
      </div>
    </div>
  )
}
