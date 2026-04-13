import { useState } from 'react'
import { useLocalTime } from '../hooks'
import { SORT_OPTIONS } from '../constants'
import { SortModal } from './modals/SortModal'
import PlaceCard from './PlaceCard'

function CollectionDetailScreen({ collection, savedList, onViewDetail, onRemove, onBack }) {
  const time   = useLocalTime()
  const places = savedList.filter(p=>collection.placeNames.includes(p.name))
  return (
    <div className="screen-body">
      <div className="screen-header">
        <div className="status-bar"><span>{time}</span><span>Collection</span></div>
        <div className="detail-hero" style={{minHeight:'110px'}}>
          <div className="detail-hero-controls">
            <button className="icon-btn" onClick={onBack}>←</button>
            <span style={{fontSize:'1.8rem'}}>{collection.icon}</span>
          </div>
          <div className="detail-hero-info">
            <h2 className="detail-title">{collection.name}</h2>
            <p className="detail-sub">{places.length} {places.length===1?'place':'places'}</p>
          </div>
        </div>
      </div>
      <div className="screen-content">
        {places.length===0 ? (
          <div className="empty-state">No places here yet. Use "Add to plan" on any place to add here!</div>
        ) : (
          <div className="card-list">
            {places.map((p,i)=>(
              <div key={i} className="place-card" onClick={()=>onViewDetail(p)}>
                <div className="place-card-top">
                  <div className="place-card-info">
                    <div className="place-name-row">
                      <h4 className="place-name">{p.name}</h4>
                      <span className="place-type-badge">{p.type}</span>
                    </div>
                    <p className="place-neighborhood">{p.neighborhood}</p>
                    <p className="place-vibe" style={{marginTop:'0.35rem'}}>{p.note||'—'}</p>
                  </div>
                  <button className="remove-btn" onClick={e=>{e.stopPropagation();onRemove(collection.id,p.name)}}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SavedScreen({ savedList, toggleSave, onViewDetail, collections, onViewCollection, onRemoveFromCollection }) {
  const time = useLocalTime()
  const [sortBy,   setSortBy]   = useState('recent')
  const [showSort, setShowSort] = useState(false)
  const [activeCol,setActiveCol]= useState(null)

  const sortedSaves = [...savedList].sort((a,b)=>{
    if(sortBy==='name')         return a.name.localeCompare(b.name)
    if(sortBy==='neighborhood') return (a.neighborhood||'').localeCompare(b.neighborhood||'')
    if(sortBy==='type')         return (a.type||'').localeCompare(b.type||'')
    return b.savedAt-a.savedAt
  })
  const currentSortLabel = SORT_OPTIONS.find(o=>o.id===sortBy)?.label||'Recently saved'

  if (activeCol) {
    const col = collections.find(c=>c.id===activeCol)
    return <CollectionDetailScreen collection={col} savedList={savedList} onViewDetail={onViewDetail} onRemove={onRemoveFromCollection} onBack={()=>setActiveCol(null)}/>
  }

  return (
    <div className="screen-body">
      {showSort && <SortModal current={sortBy} onSelect={setSortBy} onClose={()=>setShowSort(false)}/>}
      <div className="screen-header">
        <div className="status-bar"><span>{time}</span><span>Saved</span></div>
        <p className="header-sub">Your lists and favorites</p>
        <h1 className="header-title">Saved places</h1>
      </div>
      <div className="screen-content">
        <section className="neutral-section">
          <div className="section-header">
            <h3 className="section-title">Collections</h3>
            <button className="section-action" onClick={()=>onViewCollection('new')}>+ New list</button>
          </div>
          {collections.length === 0 ? (
            <div className="collection-empty-state">
              <p className="collection-empty-icon">📋</p>
              <p className="collection-empty-title">No lists yet</p>
              <p className="collection-empty-desc">Tap "+ New list" to create your first collection — like Date Night, Brunch Spots, or Hidden Gems.</p>
              <button className="collection-empty-btn" onClick={()=>onViewCollection('new')}>+ Create your first list</button>
            </div>
          ) : (
            <div className="card-list">
              {collections.map(c=>(
                <div key={c.id} className="collection-row" onClick={()=>setActiveCol(c.id)}>
                  <div className="collection-icon">{c.icon}</div>
                  <div className="collection-info">
                    <p className="collection-name">{c.name}</p>
                    <p className="collection-count">{c.placeNames.length} {c.placeNames.length===1?'place':'places'}</p>
                  </div>
                  <span className="arrow">→</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="section-header">
            <h3 className="section-title">Recently saved</h3>
            <button className="section-action sort-action" onClick={()=>setShowSort(true)}>↕ {currentSortLabel}</button>
          </div>
          {savedList.length===0 ? (
            <div className="empty-state">No saved places yet. Go to Home and heart a recommendation!</div>
          ) : (
            <div className="card-list">
              {sortedSaves.map((p,i)=>(
                <PlaceCard key={i} place={p} onClick={()=>onViewDetail(p)} onUnsave={()=>toggleSave(p)} showUnsave/>
              ))}
            </div>
          )}
        </section>

        <div className="dark-banner">
          <div>
            <p className="banner-eyebrow">Organize smarter</p>
            <h3 className="banner-title" style={{fontSize:'1.1rem'}}>Build lists by mood</h3>
            <p className="banner-desc">Group saved places into collections like rooftop nights, birthdays, or cozy date spots.</p>
          </div>
          <span className="banner-icon">📌</span>
        </div>
      </div>
    </div>
  )
}
