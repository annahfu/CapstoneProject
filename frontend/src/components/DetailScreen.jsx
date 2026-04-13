import { useState, useEffect } from 'react'
import { useLocalTime } from '../hooks'
import ShareModal from './modals/ShareModal'
import AddToPlanModal from './modals/AddToPlanModal'
import PlaceCard from './PlaceCard'

export default function DetailScreen({ place, onBack, onSave, saved, collections, onAddToCollections, onLogVisit, visitLog }) {
  const time = useLocalTime()
  const [showShare, setShowShare] = useState(false)
  const [showPlan,  setShowPlan]  = useState(false)
  const [similar,   setSimilar]   = useState([])
  const [visitDone, setVisitDone] = useState(false)

  if (!place) return null

  const name  = place.Name_of_place || place.name
  const score = place.similarity_score != null ? (place.similarity_score * 100).toFixed(0) : '—'
  const visitCount = (visitLog||[]).filter(v=>v.name===name).length

  useEffect(() => { fetchSimilar() }, [name])

  async function fetchSimilar() {
    try {
      const res  = await fetch('/api/recommendations', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          preferred_neighborhood: place.Neighborhood || place.neighborhood,
          atmosphere: place.Vibe_Type || undefined,
          top_n: 4
        })
      })
      const data = await res.json()
      if (data.success) {
        setSimilar(data.recommendations.filter(p => (p.Name_of_place||p.name) !== name).slice(0,3))
      }
    } catch(e) { console.error(e) }
  }

  function handleLogVisit() {
    onLogVisit({ name, type: place.Type||place.type, neighborhood: place.Neighborhood||place.neighborhood, loggedAt: Date.now() })
    setVisitDone(true)
    setTimeout(()=>setVisitDone(false), 2500)
  }

  function openDirections() {
    const addr = place.Address || `${name}, ${place.Neighborhood||''}, New York City`
    window.open(`https://maps.google.com/?q=${encodeURIComponent(addr)}`, '_blank')
  }

  const highlights = [
    `${score}% match based on your preference for hidden gems and stylish places`,
    `Best for intimate nights out, small groups, or date plans`,
    `Popular for late evening visits and curated experiences`
  ]

  return (
    <div className="screen-body">
      {showShare && <ShareModal place={place} onClose={()=>setShowShare(false)}/>}
      {showPlan  && <AddToPlanModal place={place} collections={collections} onAddToCollections={onAddToCollections} onClose={()=>setShowPlan(false)}/>}

      <div className="screen-header">
        <div className="status-bar"><span>{time}</span><span>Details</span></div>
        <div className="detail-hero">
          <div className="detail-hero-controls">
            <button className="icon-btn" onClick={onBack}>←</button>
            <button className="icon-btn" onClick={()=>onSave(place)}>{saved?'❤️':'♡'}</button>
          </div>
          <div className="detail-hero-info">
            <p className="detail-eyebrow">Top recommendation</p>
            <h2 className="detail-title">{name}</h2>
            <p className="detail-sub">{place.Neighborhood||place.neighborhood} • {place.Type||place.type}</p>
          </div>
        </div>
      </div>

      <div className="screen-content">
        {/* Visit logged toast */}
        {visitDone && <div className="success-msg" style={{padding:'0.6rem 1rem',fontSize:'0.85rem'}}>Visit logged! ✓</div>}

        {/* Match section */}
        <section className="neutral-section">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div>
              <p className="place-neighborhood">Why it matches you</p>
              <h3 style={{fontSize:'1.5rem',fontWeight:700,color:'#111',marginTop:'0.2rem'}}>{score}% match</h3>
            </div>
            <span style={{fontSize:'1.5rem'}}>✨</span>
          </div>
          <div className="card-list" style={{marginTop:'0.75rem'}}>
            {highlights.map(h=>(
              <div key={h} className="highlight-row">{h}</div>
            ))}
          </div>
        </section>

        {/* Vibe & tags */}
        <section className="white-section">
          <div className="section-header">
            <h3 className="section-title">Vibe and tags</h3>
            <button className="section-action" onClick={()=>setShowShare(true)}>Share 📤</button>
          </div>
          <p className="place-vibe" style={{marginBottom:'0.75rem'}}>
            {place.Vibe_Type||place.note||'A great spot with a unique atmosphere.'}
          </p>
          <div className="tag-row">
            {[place.Type||place.type, place.Category, place.price_tier].filter(Boolean).map(t=>(
              <span key={t} className="dark-tag">{t}</span>
            ))}
          </div>
        </section>

        {/* Place details */}
        <section className="neutral-section">
          <div className="section-header">
            <h3 className="section-title">Place details</h3>
            <button className="section-action" onClick={openDirections}>🗺 Directions</button>
          </div>
          <div className="card-list">
            {[
              ['Neighborhood', place.Neighborhood||place.neighborhood],
              ['Price',        place.price_tier||place.Price_Level||'N/A'],
              ['Category',     place.Category||place.type],
              ['Address',      place.Address||'—'],
            ].map(([k,v])=>(
              <div key={k} className="detail-info-row">
                <span className="pref-key">{k}</span>
                <span className="pref-val">{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Visit log */}
        <section className="white-section">
          <div className="section-header">
            <h3 className="section-title">Visit log</h3>
            {visitCount > 0 && <span className="section-action">{visitCount} visit{visitCount!==1?'s':''}</span>}
          </div>
          <button className="visit-log-btn" onClick={handleLogVisit}>
            {visitDone ? '✓ Logged!' : '📍 I went here'}
          </button>
          {visitCount > 0 && (
            <p style={{fontSize:'0.78rem',color:'#888',marginTop:'0.5rem'}}>
              You've visited this place {visitCount} time{visitCount!==1?'s':''}
            </p>
          )}
        </section>

        {/* Action buttons */}
        <div className="action-grid">
          <button className="btn-dark" onClick={()=>setShowPlan(true)}>Add to plan</button>
          <button className="btn-light" onClick={()=>onSave(place)}>
            {saved?'Saved ❤️':'Save place'}
          </button>
        </div>

        {/* You might also like */}
        {similar.length > 0 && (
          <section className="similar-section">
            <div className="section-header">
              <h3 className="section-title">You might also like</h3>
            </div>
            <div className="card-list">
              {similar.map((p,i)=>(
                <PlaceCard key={i} place={p} onClick={()=>onViewDetail(p)}/>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
