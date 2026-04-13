import { useState } from 'react'
import { useLocalTime } from '../hooks'
import { VibeEditModal, NeighborhoodModal, PreferencesModal } from './modals/ProfileModals'
import { clearAllState } from '../storage'

export default function ProfileScreen({ profile, onUpdateProfile, visitLog, savedList }) {
  const time = useLocalTime()
  const [showVibeEdit,  setShowVibeEdit]  = useState(false)
  const [showNeighEdit, setShowNeighEdit] = useState(false)
  const [showPrefsEdit, setShowPrefsEdit] = useState(false)
  const [savedMsg,      setSavedMsg]      = useState('')
  const [confirmReset,  setConfirmReset]  = useState(false)

  function saveWithFeedback(key, value, label) {
    onUpdateProfile({ ...profile, [key]: value })
    setSavedMsg(`${label} updated!`)
    setTimeout(() => setSavedMsg(''), 2500)
  }

  function handleReset() {
    if (!confirmReset) { setConfirmReset(true); return }
    clearAllState()
    window.location.reload()
  }

  const stats = [
    { label:'Places saved',  value: String(savedList.length)      },
    { label:'Lists created', value: '6'                            },
    { label:'Visits logged', value: String(visitLog.length)        },
  ]

  // Group visits by place for the visit log section
  const visitCounts = visitLog.reduce((acc, v) => {
    acc[v.name] = (acc[v.name] || 0) + 1
    return acc
  }, {})
  const visitedPlaces = Object.entries(visitCounts)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="screen-body">
      {showVibeEdit  && <VibeEditModal      current={profile.vibes}         onSave={v=>saveWithFeedback('vibes',v,'Vibe profile')}   onClose={()=>setShowVibeEdit(false)} />}
      {showNeighEdit && <NeighborhoodModal  current={profile.neighborhoods} onSave={v=>saveWithFeedback('neighborhoods',v,'Neighborhoods')} onClose={()=>setShowNeighEdit(false)}/>}
      {showPrefsEdit && <PreferencesModal   current={profile.prefs}         onSave={v=>saveWithFeedback('prefs',v,'Preferences')}    onClose={()=>setShowPrefsEdit(false)}/>}

      <div className="screen-header">
        <div className="status-bar"><span>{time}</span><span>Profile</span></div>
        <div className="profile-hero">
          <div className="avatar">👤</div>
          <div>
            <h2 className="header-title" style={{marginBottom:'0.1rem'}}>{profile.name}</h2>
            <p className="header-sub" style={{marginTop:0}}>Nightlife explorer • NYC based</p>
          </div>
        </div>
      </div>

      <div className="screen-content">
        {savedMsg && (
          <div className="success-msg" style={{padding:'0.6rem 1rem',fontSize:'0.85rem'}}>{savedMsg} ✓</div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          {stats.map(s=>(
            <div key={s.label} className="stat-card">
              <p className="stat-value">{s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Vibe profile */}
        <section className="white-section">
          <div className="section-header">
            <h3 className="section-title">Your vibe profile</h3>
            <button className="section-action edit-action" onClick={()=>setShowVibeEdit(true)}>Edit</button>
          </div>
          {profile.vibes.length === 0
            ? <p style={{fontSize:'0.82rem',color:'#aaa'}}>No vibes yet. Tap Edit to add some!</p>
            : <div className="tag-row">{profile.vibes.map(t=><span key={t} className="dark-tag">{t}</span>)}</div>
          }
        </section>

        {/* Neighborhoods */}
        <section className="neutral-section">
          <div className="section-header">
            <h3 className="section-title">Preferred neighborhoods</h3>
            <button className="section-action edit-action" onClick={()=>setShowNeighEdit(true)}>Update</button>
          </div>
          {profile.neighborhoods.length === 0
            ? <p style={{fontSize:'0.82rem',color:'#aaa'}}>No neighborhoods yet. Tap Update to add some!</p>
            : <div className="card-list">
                {profile.neighborhoods.map(n=>(
                  <div key={n} className="neighborhood-row"><span>{n}</span><span>📍</span></div>
                ))}
              </div>
          }
        </section>

        {/* Preferences */}
        <section className="white-section">
          <div className="section-header">
            <h3 className="section-title">Preferences</h3>
            <button className="section-action edit-action" onClick={()=>setShowPrefsEdit(true)}>Manage</button>
          </div>
          <div className="pref-list">
            {[
              ['Budget',          profile.prefs.budget],
              ['Going out style', profile.prefs.style ],
              ['Music preference',profile.prefs.music ],
            ].map(([k,v])=>(
              <div key={k} className="pref-row">
                <span className="pref-key">{k}</span>
                <span className="pref-val">{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Visit log */}
        {visitedPlaces.length > 0 && (
          <section className="neutral-section">
            <div className="section-header">
              <h3 className="section-title">Visit log</h3>
              <span className="section-action">{visitLog.length} total</span>
            </div>
            <div className="card-list">
              {visitedPlaces.map(([name, count])=>(
                <div key={name} className="saved-row">
                  <span className="saved-name">{name}</span>
                  <span className="visit-count-badge">{count}x</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Personalization score */}
        <div className="dark-banner">
          <div>
            <p className="banner-eyebrow">Personalization score</p>
            <h3 className="banner-title" style={{fontSize:'1.4rem'}}>
              {Math.min(100, 40 + profile.vibes.length * 4 + profile.neighborhoods.length * 5 + visitLog.length * 2)}% complete
            </h3>
            <p className="banner-desc">Add more vibes, neighborhoods and visit logs to improve recommendations.</p>
          </div>
          <span className="banner-icon">✨</span>
        </div>

        {/* Reset / start over */}
        <div className="reset-section">
          {confirmReset ? (
            <div className="reset-confirm">
              <p className="reset-confirm-text">This will erase all your saved places, collections, and profile data. Are you sure?</p>
              <div style={{display:'flex',gap:'0.6rem'}}>
                <button className="reset-confirm-yes" onClick={handleReset}>Yes, reset everything</button>
                <button className="reset-confirm-no"  onClick={()=>setConfirmReset(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="reset-btn" onClick={handleReset}>Reset app & start over</button>
          )}
        </div>

      </div>
    </div>
  )
}
