import { useState } from 'react'
import { ALL_VIBE_TAGS, ALL_EDIT_NEIGHBORHOODS, BUDGET_OPTIONS, MUSIC_OPTIONS } from '../constants'

const STEPS = ['welcome', 'name', 'vibes', 'neighborhoods', 'budget', 'music', 'done']

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [vibes, setVibes] = useState([])
  const [hoods, setHoods] = useState([])
  const [budget, setBudget] = useState('$$ to $$$')
  const [music, setMusic] = useState('R&B, House, Jazz')

  const current = STEPS[step]
  const progress = (step / (STEPS.length - 1)) * 100

  function next() { if (step < STEPS.length - 1) setStep(s => s + 1) }
  function back() { if (step > 0) setStep(s => s - 1) }
  function toggleVibes(t) { setVibes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]) }
  function toggleHoods(n) { setHoods(p => p.includes(n) ? p.filter(x => x !== n) : [...p, n]) }
  function finish() {
    onComplete({ name: name.trim() || 'Explorer', vibes, neighborhoods: hoods, budget, music })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-[390px] min-h-screen bg-white flex flex-col shadow-2xl rounded-3xl overflow-hidden">
        {/* Progress bar */}
        {step > 0 && step < STEPS.length - 1 && (
          <div className="h-1 bg-gray-100 shrink-0">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <div className="flex-1 flex flex-col justify-center px-6 py-8 overflow-y-auto">
          {/* Welcome */}
          {current === 'welcome' && (
            <div className="flex flex-col items-center text-center gap-4">
              <div className="text-6xl">🗽</div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome to DROP'IN</h1>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                Your personal guide to the best spots in New York City. Let's set up your profile!
              </p>
              <button
                className="w-full bg-black text-white font-semibold py-3.5 rounded-2xl hover:bg-gray-900 transition-colors mt-2"
                onClick={next}
              >Get started</button>
            </div>
          )}
          {/* Name */}
          {current === 'name' && (
            <div className="flex flex-col gap-4">
              <div className="text-5xl">👋</div>
              <h2 className="text-2xl font-bold text-gray-900">What's your name?</h2>
              <p className="text-sm text-gray-500">We'll use this to personalize your experience.</p>
              <input
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-black transition-colors"
                placeholder="Your first name"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && next()}
                autoFocus
              />
              <div className="flex gap-3 mt-2">
                <button
                  className="flex-1 border border-gray-200 text-sm font-medium py-3 rounded-2xl hover:bg-gray-50 transition-colors"
                  onClick={back}
                >Back</button>
                <button
                  className="flex-1 bg-black text-white text-sm font-semibold py-3 rounded-2xl hover:bg-gray-900 disabled:opacity-40 transition-colors"
                  onClick={next}
                  disabled={!name.trim()}
                >Continue</button>
              </div>
            </div>
          )}
          {/* Vibes */}
          {current === 'vibes' && (
            <div className="flex flex-col gap-4">
              <div className="text-5xl">✨</div>
              <h2 className="text-2xl font-bold text-gray-900">What's your vibe?</h2>
              <p className="text-sm text-gray-500">Pick everything that sounds like you.</p>
              <div className="flex gap-2 flex-wrap">
                {ALL_VIBE_TAGS.map(t => (
                  <button
                    key={t}
                    onClick={() => toggleVibes(t)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors
                      ${vibes.includes(t)
                        ? 'bg-black text-white border-black'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >{t}</button>
                ))}
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  className="flex-1 border border-gray-200 text-sm font-medium py-3 rounded-2xl hover:bg-gray-50 transition-colors"
                  onClick={back}
                >Back</button>
                <button
                  className="flex-1 bg-black text-white text-sm font-semibold py-3 rounded-2xl hover:bg-gray-900 transition-colors"
                  onClick={next}
                >Continue {vibes.length > 0 && `(${vibes.length})`}</button>
              </div>
            </div>
          )}
          {/* Neighborhoods */}
          {current === 'neighborhoods' && (
            <div className="flex flex-col gap-4">
              <div className="text-5xl">📍</div>
              <h2 className="text-2xl font-bold text-gray-900">Favorite neighborhoods?</h2>
              <p className="text-sm text-gray-500">Select the areas you love to explore.</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {ALL_EDIT_NEIGHBORHOODS.map(n => (
                  <button
                    key={n}
                    onClick={() => toggleHoods(n)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm transition-colors text-left
                      ${hoods.includes(n)
                        ? 'bg-black text-white border-black'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{n}</span>
                    </div>
                    {hoods.includes(n) && <span className="text-white text-xs">✓</span>}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  className="flex-1 border border-gray-200 text-sm font-medium py-3 rounded-2xl hover:bg-gray-50 transition-colors"
                  onClick={back}
                >Back</button>
                <button
                  className="flex-1 bg-black text-white text-sm font-semibold py-3 rounded-2xl hover:bg-gray-900 transition-colors"
                  onClick={next}
                >Continue {hoods.length > 0 && `(${hoods.length})`}</button>
              </div>
            </div>
          )}
          {/* Budget */}
          {current === 'budget' && (
            <div className="flex flex-col gap-4">
              <div className="text-5xl">💰</div>
              <h2 className="text-2xl font-bold text-gray-900">What's your budget?</h2>
              <p className="text-sm text-gray-500">We'll filter recommendations to match.</p>
              <div className="space-y-2">
                {BUDGET_OPTIONS.map(b => (
                  <button
                    key={b}
                    onClick={() => setBudget(b)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm transition-colors
                      ${budget === b
                        ? 'bg-black text-white border-black'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span>{b}</span>
                    {budget === b && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  className="flex-1 border border-gray-200 text-sm font-medium py-3 rounded-2xl hover:bg-gray-50 transition-colors"
                  onClick={back}
                >Back</button>
                <button
                  className="flex-1 bg-black text-white text-sm font-semibold py-3 rounded-2xl hover:bg-gray-900 transition-colors"
                  onClick={next}
                >Continue</button>
              </div>
            </div>
          )}
          {/* Music */}
          {current === 'music' && (
            <div className="flex flex-col gap-4">
              <div className="text-5xl">🎵</div>
              <h2 className="text-2xl font-bold text-gray-900">Music preference?</h2>
              <p className="text-sm text-gray-500">We'll match you with places that play what you love.</p>
              <div className="space-y-2">
                {MUSIC_OPTIONS.map(m => (
                  <button
                    key={m}
                    onClick={() => setMusic(m)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm transition-colors
                      ${music === m
                        ? 'bg-black text-white border-black'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span>{m}</span>
                    {music === m && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  className="flex-1 border border-gray-200 text-sm font-medium py-3 rounded-2xl hover:bg-gray-50 transition-colors"
                  onClick={back}
                >Back</button>
                <button
                  className="flex-1 bg-black text-white text-sm font-semibold py-3 rounded-2xl hover:bg-gray-900 transition-colors"
                  onClick={next}
                >Continue</button>
              </div>
            </div>
          )}
          {/* Done */}
          {current === 'done' && (
            <div className="flex flex-col items-center text-center gap-4">
              <div className="text-6xl">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900">
                You're all set, {name || 'Explorer'}!
              </h2>
              <p className="text-sm text-gray-500">Your personalized NYC guide is ready. Start exploring!</p>
              <div className="w-full bg-gray-50 rounded-2xl p-4 text-left space-y-1.5">
                {vibes.length > 0 && (
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Vibes:</strong>{' '}
                    {vibes.slice(0, 3).join(', ')}{vibes.length > 3 ? '…' : ''}
                  </p>
                )}
                {hoods.length > 0 && (
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Neighborhoods:</strong>{' '}
                    {hoods.slice(0, 2).join(', ')}{hoods.length > 2 ? '…' : ''}
                  </p>
                )}
                <p className="text-sm text-gray-700"><strong className="text-gray-900">Budget:</strong> {budget}</p>
                <p className="text-sm text-gray-700"><strong className="text-gray-900">Music:</strong> {music}</p>
              </div>
              <button
                className="w-full bg-black text-white font-semibold py-3.5 rounded-2xl hover:bg-gray-900 transition-colors mt-2"
                onClick={finish}
              >Start exploring 🗽</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}