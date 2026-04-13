import { useState } from 'react'
import { useLocalTime } from '../hooks'
import { CITIES, NEIGHBORHOODS_BY_CITY, VIBES, PRICE_TIERS, ACTIVITY_TYPES } from '../constants'
import PlaceCard from './PlaceCard'

export default function SearchScreen({ onViewDetail }) {
  const time = useLocalTime()
  const [city, setCity] = useState('Any')
  const [form, setForm] = useState({
    preferred_neighborhood:'Any', atmosphere:'Any',
    max_price_tier:'Any', activity_type:'Any',
    drinks:false, activities:'', music_genres:'', top_n:10
  })
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [searched, setSearched] = useState(false)

  // Neighborhoods shown depend on selected city
  const availableNeighborhoods = NEIGHBORHOODS_BY_CITY[city] || NEIGHBORHOODS_BY_CITY['Any']

  function set(k,v){ setForm(p=>({...p,[k]:v})) }

  function handleCityChange(newCity) {
    setCity(newCity)
    // Reset neighborhood when city changes
    setForm(p=>({...p, preferred_neighborhood:'Any'}))
  }

  async function search() {
    setLoading(true); setSearched(true)
    try {
      const payload = {...form}
      if(payload.preferred_neighborhood==='Any') delete payload.preferred_neighborhood
      if(payload.atmosphere==='Any')             delete payload.atmosphere
      if(payload.max_price_tier==='Any')         delete payload.max_price_tier
      if(payload.activity_type==='Any')          delete payload.activity_type
      payload.top_n = parseInt(payload.top_n)

      // If a city is selected but no specific neighborhood, pass the city
      // neighborhoods to the API to filter by borough
      if (!payload.preferred_neighborhood && city !== 'Any') {
        const hoods = NEIGHBORHOODS_BY_CITY[city].filter(n => n !== 'Any')
        if (hoods.length > 0) payload.preferred_neighborhood = hoods[0]
      }

      const res  = await fetch('/api/recommendations',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      const data = await res.json()
      if(data.success) setResults(data.recommendations)
    } catch(e){ console.error(e) }
    finally{ setLoading(false) }
  }

  return (
    <div className="screen-body">
      <div className="screen-header">
        <div className="status-bar"><span>{time}</span><span>Search</span></div>
        <h1 className="header-title">Find places</h1>
      </div>
      <div className="screen-content">
        <div className="filter-card">

          {/* City */}
          <div className="filter-field">
            <label className="filter-label">City</label>
            <select className="filter-select" value={city} onChange={e=>handleCityChange(e.target.value)}>
              {CITIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Neighborhood — filters based on selected city */}
          <div className="filter-field">
            <label className="filter-label">Neighborhood</label>
            <select className="filter-select" value={form.preferred_neighborhood} onChange={e=>set('preferred_neighborhood',e.target.value)}>
              {availableNeighborhoods.map(n=><option key={n}>{n}</option>)}
            </select>
          </div>

          <div className="filter-field">
            <label className="filter-label">Atmosphere</label>
            <select className="filter-select" value={form.atmosphere} onChange={e=>set('atmosphere',e.target.value)}>
              {VIBES.map(v=><option key={v}>{v}</option>)}
            </select>
          </div>
          <div className="filter-field">
            <label className="filter-label">Max Price</label>
            <div className="pill-row">
              {PRICE_TIERS.map(t=><button key={t} className={`pill ${form.max_price_tier===t?'pill-active':''}`} onClick={()=>set('max_price_tier',t)}>{t}</button>)}
            </div>
          </div>
          <div className="filter-field">
            <label className="filter-label">Activity Type</label>
            <div className="pill-row">
              {ACTIVITY_TYPES.map(t=><button key={t} className={`pill ${form.activity_type===t?'pill-active':''}`} onClick={()=>set('activity_type',t)}>{t}</button>)}
            </div>
          </div>
          <div className="filter-field">
            <label className="filter-label">Activities</label>
            <input className="filter-input" placeholder="e.g. Eating, Museums, Dancing" value={form.activities} onChange={e=>set('activities',e.target.value)}/>
          </div>
          <div className="filter-field">
            <label className="filter-label">Music</label>
            <input className="filter-input" placeholder="e.g. Hip-Hop, Jazz, R&B" value={form.music_genres} onChange={e=>set('music_genres',e.target.value)}/>
          </div>
          <label className="checkbox-label">
            <input type="checkbox" checked={form.drinks} onChange={e=>set('drinks',e.target.checked)}/>
            Must serve alcohol
          </label>
          <button className="search-btn" onClick={search} disabled={loading}>
            {loading?'Searching…':'🔍 Get Recommendations'}
          </button>
        </div>

        {searched && !loading && results.length===0 && (
          <div className="empty-state">No places found. Try relaxing some filters.</div>
        )}
        {results.length>0 && (
          <section>
            <div className="section-header">
              <h3 className="section-title">Results ({results.length})</h3>
            </div>
            <div className="card-list">
              {results.map((p,i)=><PlaceCard key={i} place={p} onClick={()=>onViewDetail(p)}/>)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
