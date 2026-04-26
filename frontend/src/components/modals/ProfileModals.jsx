import { useState } from 'react'
import { ALL_VIBE_TAGS, ALL_EDIT_NEIGHBORHOODS, BUDGET_OPTIONS, MUSIC_OPTIONS } from '../../constants'

// ── Shared bottom-sheet wrapper ─────────────────────────────────────────────
function BottomSheet({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />
        <div className="px-6 pt-3 pb-4">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="px-6 pb-8">
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Vibe edit modal ─────────────────────────────────────────────────────────
export function VibeEditModal({ current, onSave, onClose }) {
  const [selected, setSelected] = useState(current)
  const toggle = t => setSelected(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])

  return (
    <BottomSheet title="Edit your vibe profile" subtitle="Pick everything that sounds like you" onClose={onClose}>
      <div className="flex gap-2 flex-wrap mb-5">
        {ALL_VIBE_TAGS.map(t => (
          <button
            key={t}
            onClick={() => toggle(t)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors
              ${selected.includes(t)
                ? 'bg-black text-white border-black'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >{t}</button>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          className="flex-1 border border-gray-200 text-sm font-medium py-3 rounded-2xl hover:bg-gray-50 transition-colors"
          onClick={onClose}
        >Cancel</button>
        <button
          className="flex-1 bg-black text-white text-sm font-semibold py-3 rounded-2xl hover:bg-gray-900 transition-colors"
          onClick={() => { onSave(selected); onClose() }}
        >Save {selected.length > 0 && `(${selected.length})`}</button>
      </div>
    </BottomSheet>
  )
}

// ── Neighborhood modal ──────────────────────────────────────────────────────
export function NeighborhoodModal({ current, onSave, onClose }) {
  const [selected, setSelected] = useState(current)
  const toggle = n => setSelected(p => p.includes(n) ? p.filter(x => x !== n) : [...p, n])

  return (
    <BottomSheet title="Edit preferred neighborhoods" subtitle="Select the areas you love to explore" onClose={onClose}>
      <div className="space-y-2 mb-5">
        {ALL_EDIT_NEIGHBORHOODS.map(n => (
          <button
            key={n}
            onClick={() => toggle(n)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm transition-colors text-left
              ${selected.includes(n)
                ? 'bg-black text-white border-black'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-2">
              <span>📍</span><span>{n}</span>
            </div>
            {selected.includes(n) && <span className="text-xs">✓</span>}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          className="flex-1 border border-gray-200 text-sm font-medium py-3 rounded-2xl hover:bg-gray-50 transition-colors"
          onClick={onClose}
        >Cancel</button>
        <button
          className="flex-1 bg-black text-white text-sm font-semibold py-3 rounded-2xl hover:bg-gray-900 transition-colors"
          onClick={() => { onSave(selected); onClose() }}
        >Save</button>
      </div>
    </BottomSheet>
  )
}

// ── Preferences modal ───────────────────────────────────────────────────────
export function PreferencesModal({ current, onSave, onClose }) {
  const [budget, setBudget] = useState(current.budget)
  const [music,  setMusic]  = useState(current.music)

  return (
    <BottomSheet title="Edit preferences" onClose={onClose}>
      <div className="space-y-5 mb-5">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Budget</p>
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
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Music</p>
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
        </div>
      </div>
      <div className="flex gap-3">
        <button
          className="flex-1 border border-gray-200 text-sm font-medium py-3 rounded-2xl hover:bg-gray-50 transition-colors"
          onClick={onClose}
        >Cancel</button>
        <button
          className="flex-1 bg-black text-white text-sm font-semibold py-3 rounded-2xl hover:bg-gray-900 transition-colors"
          onClick={() => { onSave({ ...current, budget, music }); onClose() }}
        >Save</button>
      </div>
    </BottomSheet>
  )
}

// ── Food & Dining modal ─────────────────────────────────────────────────────
const CUISINES = [
  'Italian', 'Japanese', 'Mexican', 'Chinese', 'Indian',
  'Thai', 'French', 'Mediterranean', 'American', 'Korean',
  'Vietnamese', 'Middle Eastern', 'Caribbean', 'Ethiopian',
  'Spanish', 'Greek', 'Peruvian', 'Brazilian',
]

const DINING_STYLES = [
  { id: 'casual',      label: 'Casual dining',    desc: 'Relaxed, everyday spots' },
  { id: 'sit-down',    label: 'Sit-down',         desc: 'Full service, take your time' },
  { id: 'fine-dining', label: 'Fine dining',      desc: 'Upscale, special occasions' },
  { id: 'quick-bites', label: 'Quick bites',      desc: 'Fast, grab-and-go' },
  { id: 'brunch',      label: 'Brunch spots',     desc: 'Weekend morning vibes' },
  { id: 'late-night',  label: 'Late night eats',  desc: 'Open past midnight' },
]

const DIETARY_NEEDS = [
  'Vegetarian', 'Vegan', 'Halal', 'Kosher',
  'Gluten-free', 'Dairy-free', 'Nut-free', 'No restrictions',
]

export function FoodPrefsModal({ current, onSave, onClose }) {
  const [cuisines,     setCuisines]     = useState(current.cuisines     || [])
  const [diningStyle,  setDiningStyle]  = useState(current.diningStyle  || '')
  const [dietary,      setDietary]      = useState(current.dietary      || [])

  function toggleCuisine(c) {
    setCuisines(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])
  }

  function toggleDietary(d) {
    // 'No restrictions' clears everything else
    if (d === 'No restrictions') {
      setDietary(['No restrictions'])
      return
    }
    setDietary(p => {
      const without = p.filter(x => x !== 'No restrictions')
      return without.includes(d) ? without.filter(x => x !== d) : [...without, d]
    })
  }

  function handleSave() {
    onSave({ cuisines, diningStyle, dietary })
    onClose()
  }

  return (
    <BottomSheet
      title="Food & dining"
      subtitle="Help us find the perfect spots for you"
      onClose={onClose}
    >
      <div className="space-y-6 mb-5">
        {/* Cuisines */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Favourite cuisines
          </p>
          <p className="text-xs text-gray-400 mb-3">Pick as many as you like</p>
          <div className="flex gap-2 flex-wrap">
            {CUISINES.map(c => (
              <button
                key={c}
                onClick={() => toggleCuisine(c)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors
                  ${cuisines.includes(c)
                    ? 'bg-black text-white border-black'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >{c}</button>
            ))}
          </div>
        </div>
        {/* Dining style */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Dining style
          </p>
          <div className="space-y-2">
            {DINING_STYLES.map(s => (
              <button
                key={s.id}
                onClick={() => setDiningStyle(s.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm transition-colors text-left
                  ${diningStyle === s.id
                    ? 'bg-black text-white border-black'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <div>
                  <p className="font-medium">{s.label}</p>
                  <p className={`text-xs mt-0.5 ${diningStyle === s.id ? 'text-gray-300' : 'text-gray-400'}`}>
                    {s.desc}
                  </p>
                </div>
                {diningStyle === s.id && <span className="text-xs shrink-0 ml-2">✓</span>}
              </button>
            ))}
          </div>
        </div>
        {/* Dietary needs */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Dietary needs
          </p>
          <div className="flex gap-2 flex-wrap">
            {DIETARY_NEEDS.map(d => (
              <button
                key={d}
                onClick={() => toggleDietary(d)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors
                  ${dietary.includes(d)
                    ? 'bg-black text-white border-black'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >{d}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          className="flex-1 border border-gray-200 text-sm font-medium py-3 rounded-2xl hover:bg-gray-50 transition-colors"
          onClick={onClose}
        >Cancel</button>
        <button
          className="flex-1 bg-black text-white text-sm font-semibold py-3 rounded-2xl hover:bg-gray-900 transition-colors"
          onClick={handleSave}
        >Save</button>
      </div>
    </BottomSheet>
  )
}