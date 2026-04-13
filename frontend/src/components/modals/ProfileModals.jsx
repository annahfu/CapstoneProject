import { useState } from 'react'
import { ALL_VIBE_TAGS, ALL_EDIT_NEIGHBORHOODS, BUDGET_OPTIONS, STYLE_OPTIONS, MUSIC_OPTIONS } from '../../constants'

export function VibeEditModal({ current, onSave, onClose }) {
  const [selected, setSelected] = useState(current)
  function toggle(tag) { setSelected(prev=>prev.includes(tag)?prev.filter(t=>t!==tag):[...prev,tag]) }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <h3 className="modal-title">Your vibe profile</h3>
        <p className="modal-sub">Pick the tags that best describe your scene</p>
        <div className="tag-row" style={{maxHeight:'260px',overflowY:'auto',padding:'0.25rem 0'}}>
          {ALL_VIBE_TAGS.map(tag=>(
            <button key={tag} className={`vibe-tag-btn ${selected.includes(tag)?'vibe-tag-active':''}`} onClick={()=>toggle(tag)}>{tag}</button>
          ))}
        </div>
        <button className="modal-confirm" onClick={()=>{onSave(selected);onClose()}}>Save {selected.length} tag{selected.length!==1?'s':''}</button>
        <button className="modal-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

export function NeighborhoodModal({ current, onSave, onClose }) {
  const [selected, setSelected] = useState(current)
  function toggle(n) { setSelected(prev=>prev.includes(n)?prev.filter(x=>x!==n):[...prev,n]) }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <h3 className="modal-title">Preferred neighborhoods</h3>
        <p className="modal-sub">Select all the areas you like to explore</p>
        <div className="collection-pick-list" style={{maxHeight:'280px',overflowY:'auto'}}>
          {ALL_EDIT_NEIGHBORHOODS.map(n=>(
            <button key={n} className={`collection-pick-row ${selected.includes(n)?'collection-pick-active':''}`} onClick={()=>toggle(n)}>
              <span className="collection-pick-icon">📍</span>
              <span className="collection-pick-name">{n}</span>
              {selected.includes(n)&&<span className="collection-pick-check">✓</span>}
            </button>
          ))}
        </div>
        <button className="modal-confirm" onClick={()=>{onSave(selected);onClose()}}>Save {selected.length} neighborhood{selected.length!==1?'s':''}</button>
        <button className="modal-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

export function PreferencesModal({ current, onSave, onClose }) {
  const [prefs, setPrefs] = useState(current)
  function set(key,val) { setPrefs(p=>({...p,[key]:val})) }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <h3 className="modal-title">Preferences</h3>
        <p className="modal-sub">Customize how we find places for you</p>
        <div className="filter-field">
          <label className="filter-label">Budget</label>
          <div className="pill-row">{BUDGET_OPTIONS.map(b=><button key={b} className={`pill ${prefs.budget===b?'pill-active':''}`} onClick={()=>set('budget',b)}>{b}</button>)}</div>
        </div>
        <div className="filter-field">
          <label className="filter-label">Going out style</label>
          <div className="collection-pick-list">
            {STYLE_OPTIONS.map(s=>(
              <button key={s} className={`collection-pick-row ${prefs.style===s?'collection-pick-active':''}`} onClick={()=>set('style',s)}>
                <span className="collection-pick-name">{s}</span>
                {prefs.style===s&&<span className="collection-pick-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-field">
          <label className="filter-label">Music preference</label>
          <div className="collection-pick-list">
            {MUSIC_OPTIONS.map(m=>(
              <button key={m} className={`collection-pick-row ${prefs.music===m?'collection-pick-active':''}`} onClick={()=>set('music',m)}>
                <span className="collection-pick-name">{m}</span>
                {prefs.music===m&&<span className="collection-pick-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
        <button className="modal-confirm" onClick={()=>{onSave(prefs);onClose()}}>Save preferences</button>
        <button className="modal-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
