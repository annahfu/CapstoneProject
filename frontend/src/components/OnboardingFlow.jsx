import { useState } from 'react'
import { ALL_VIBE_TAGS, ALL_EDIT_NEIGHBORHOODS, BUDGET_OPTIONS, MUSIC_OPTIONS } from '../constants'

const STEPS = ['welcome','name','vibes','neighborhoods','budget','music','done']

export default function OnboardingFlow({ onComplete }) {
  const [step,   setStep]   = useState(0)
  const [name,   setName]   = useState('')
  const [vibes,  setVibes]  = useState([])
  const [hoods,  setHoods]  = useState([])
  const [budget, setBudget] = useState('$$ to $$$')
  const [music,  setMusic]  = useState('R&B, House, Jazz')

  const current = STEPS[step]
  const isLast  = step === STEPS.length - 1

  function next() { if (step < STEPS.length - 1) setStep(s=>s+1) }
  function back() { if (step > 0) setStep(s=>s-1) }

  function toggleVibes(t)  { setVibes(p=>p.includes(t)?p.filter(x=>x!==t):[...p,t]) }
  function toggleHoods(n)  { setHoods(p=>p.includes(n)?p.filter(x=>x!==n):[...p,n]) }

  function finish() {
    onComplete({ name: name.trim()||'Explorer', vibes, neighborhoods:hoods, budget, music })
  }

  const progress = ((step) / (STEPS.length-1)) * 100

  return (
    <div className="onboard-shell">
      <div className="onboard-card">
        {/* Progress bar */}
        {step > 0 && step < STEPS.length-1 && (
          <div className="onboard-progress-bar">
            <div className="onboard-progress-fill" style={{width:`${progress}%`}}/>
          </div>
        )}

        {current === 'welcome' && (
          <div className="onboard-step">
            <div className="onboard-emoji">🗽</div>
            <h1 className="onboard-title">Welcome to DROP'IN</h1>
            <p className="onboard-desc">Your personal guide to the best spots in New York City. Let's set up your profile!</p>
            <button className="btn-dark onboard-btn" onClick={next}>Get started</button>
          </div>
        )}

        {current === 'name' && (
          <div className="onboard-step">
            <div className="onboard-emoji">👋</div>
            <h2 className="onboard-title">What's your name?</h2>
            <p className="onboard-desc">We'll use this to personalize your experience.</p>
            <input
              className="filter-input onboard-input"
              placeholder="Your first name"
              value={name}
              onChange={e=>setName(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&next()}
              autoFocus
            />
            <div className="onboard-nav">
              <button className="btn-light" onClick={back}>Back</button>
              <button className="btn-dark" onClick={next} disabled={!name.trim()}>Continue</button>
            </div>
          </div>
        )}

        {current === 'vibes' && (
          <div className="onboard-step">
            <div className="onboard-emoji">✨</div>
            <h2 className="onboard-title">What's your vibe?</h2>
            <p className="onboard-desc">Pick everything that sounds like you.</p>
            <div className="tag-row onboard-tags">
              {ALL_VIBE_TAGS.map(t=>(
                <button key={t} className={`vibe-tag-btn ${vibes.includes(t)?'vibe-tag-active':''}`} onClick={()=>toggleVibes(t)}>{t}</button>
              ))}
            </div>
            <div className="onboard-nav">
              <button className="btn-light" onClick={back}>Back</button>
              <button className="btn-dark" onClick={next}>Continue {vibes.length>0&&`(${vibes.length})`}</button>
            </div>
          </div>
        )}

        {current === 'neighborhoods' && (
          <div className="onboard-step">
            <div className="onboard-emoji">📍</div>
            <h2 className="onboard-title">Favorite neighborhoods?</h2>
            <p className="onboard-desc">Select the areas you love to explore.</p>
            <div className="collection-pick-list onboard-scroll">
              {ALL_EDIT_NEIGHBORHOODS.map(n=>(
                <button key={n} className={`collection-pick-row ${hoods.includes(n)?'collection-pick-active':''}`} onClick={()=>toggleHoods(n)}>
                  <span className="collection-pick-icon">📍</span>
                  <span className="collection-pick-name">{n}</span>
                  {hoods.includes(n)&&<span className="collection-pick-check">✓</span>}
                </button>
              ))}
            </div>
            <div className="onboard-nav">
              <button className="btn-light" onClick={back}>Back</button>
              <button className="btn-dark" onClick={next}>Continue {hoods.length>0&&`(${hoods.length})`}</button>
            </div>
          </div>
        )}

        {current === 'budget' && (
          <div className="onboard-step">
            <div className="onboard-emoji">💰</div>
            <h2 className="onboard-title">What's your budget?</h2>
            <p className="onboard-desc">We'll filter recommendations to match.</p>
            <div className="collection-pick-list">
              {BUDGET_OPTIONS.map(b=>(
                <button key={b} className={`collection-pick-row ${budget===b?'collection-pick-active':''}`} onClick={()=>setBudget(b)}>
                  <span className="collection-pick-name">{b}</span>
                  {budget===b&&<span className="collection-pick-check">✓</span>}
                </button>
              ))}
            </div>
            <div className="onboard-nav">
              <button className="btn-light" onClick={back}>Back</button>
              <button className="btn-dark" onClick={next}>Continue</button>
            </div>
          </div>
        )}

        {current === 'music' && (
          <div className="onboard-step">
            <div className="onboard-emoji">🎵</div>
            <h2 className="onboard-title">Music preference?</h2>
            <p className="onboard-desc">We'll match you with places that play what you love.</p>
            <div className="collection-pick-list">
              {MUSIC_OPTIONS.map(m=>(
                <button key={m} className={`collection-pick-row ${music===m?'collection-pick-active':''}`} onClick={()=>setMusic(m)}>
                  <span className="collection-pick-name">{m}</span>
                  {music===m&&<span className="collection-pick-check">✓</span>}
                </button>
              ))}
            </div>
            <div className="onboard-nav">
              <button className="btn-light" onClick={back}>Back</button>
              <button className="btn-dark" onClick={next}>Continue</button>
            </div>
          </div>
        )}

        {current === 'done' && (
          <div className="onboard-step">
            <div className="onboard-emoji">🎉</div>
            <h2 className="onboard-title">You're all set, {name||'Explorer'}!</h2>
            <p className="onboard-desc">Your personalized NYC guide is ready. Start exploring!</p>
            <div className="onboard-summary">
              {vibes.length>0 && <p><strong>Vibes:</strong> {vibes.slice(0,3).join(', ')}{vibes.length>3?'…':''}</p>}
              {hoods.length>0 && <p><strong>Neighborhoods:</strong> {hoods.slice(0,2).join(', ')}{hoods.length>2?'…':''}</p>}
              <p><strong>Budget:</strong> {budget}</p>
              <p><strong>Music:</strong> {music}</p>
            </div>
            <button className="btn-dark onboard-btn" onClick={finish}>Start exploring 🗽</button>
          </div>
        )}
      </div>
    </div>
  )
}
