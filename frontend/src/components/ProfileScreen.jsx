import { useState, useRef } from 'react'
import { useLocalTime } from '../hooks'
import { VibeEditModal, NeighborhoodModal, PreferencesModal, FoodPrefsModal } from './modals/ProfileModals'
import { clearAllState } from '../storage'

const DEFAULT_VIBE_COUNT = 6
const DEFAULT_HOOD_COUNT = 3

export default function ProfileScreen({ profile, onUpdateProfile, visitLog, savedList, collections }) {
  const time = useLocalTime()

  const [showVibeEdit,  setShowVibeEdit]  = useState(false)
  const [showNeighEdit, setShowNeighEdit] = useState(false)
  const [showPrefsEdit, setShowPrefsEdit] = useState(false)
  const [showFoodEdit,  setShowFoodEdit]  = useState(false)
  const [savedMsg,      setSavedMsg]      = useState('')
  const [confirmReset,  setConfirmReset]  = useState(false)

  // ── Inline tagline editing ─────────────────────────────────────────────────
  const [editingTagline, setEditingTagline] = useState(false)
  const [taglineDraft,   setTaglineDraft]   = useState(profile.tagline || '')
  const taglineRef = useRef(null)

  const displayTagline = profile.tagline || 'NYC explorer'

  function startEditTagline() {
    setTaglineDraft(profile.tagline || '')
    setEditingTagline(true)
    setTimeout(() => taglineRef.current?.focus(), 50)
  }

  function saveTagline() {
    const trimmed = taglineDraft.trim()
    onUpdateProfile({ ...profile, tagline: trimmed || '' })
    setEditingTagline(false)
    setSavedMsg('Headline updated!')
    setTimeout(() => setSavedMsg(''), 2000)
  }

  function cancelTagline() {
    setTaglineDraft(profile.tagline || '')
    setEditingTagline(false)
  }

  function handleTaglineKey(e) {
    if (e.key === 'Enter')  saveTagline()
    if (e.key === 'Escape') cancelTagline()
  }

  // ── General save ───────────────────────────────────────────────────────────
  function saveWithFeedback(key, value, label) {
    onUpdateProfile({ ...profile, [key]: value })
    setSavedMsg(`${label} updated!`)
    setTimeout(() => setSavedMsg(''), 2500)
  }

  function saveFoodPrefs(foodPrefs) {
    onUpdateProfile({ ...profile, foodPrefs })
    setSavedMsg('Food & dining updated!')
    setTimeout(() => setSavedMsg(''), 2500)
  }

  function handleReset() {
    if (!confirmReset) { setConfirmReset(true); return }
    clearAllState()
    window.location.reload()
  }

  // ── Personalization score ─────────────────────────────────────────────────
  const userVibes   = Math.max(0, (profile.vibes?.length         || 0) - DEFAULT_VIBE_COUNT)
  const userHoods   = Math.max(0, (profile.neighborhoods?.length || 0) - DEFAULT_HOOD_COUNT)
  const userVisits  = visitLog.length
  const userSaved   = savedList.length
  const userLists   = (collections || []).length
  const hasName     = profile.name && profile.name !== 'Explorer' ? 1 : 0
  const hasPrefs    = profile.prefs?.budget && profile.prefs?.music ? 1 : 0
  const hasTagline  = profile.tagline?.trim().length > 0 ? 1 : 0
  const hasCuisines = (profile.foodPrefs?.cuisines?.length || 0) > 0 ? 1 : 0
  const hasDining   = profile.foodPrefs?.diningStyle ? 1 : 0
  const hasDietary  = (profile.foodPrefs?.dietary?.length || 0) > 0 ? 1 : 0

  // Each item has a label, whether it's done, and a tip shown when incomplete
  const scoreItems = [
    {
      done:  hasName    === 1,
      points: hasName    * 5,  max: 5,
      tip:   'Set your name so we can personalize your experience.',
    },
    {
      done:  hasTagline === 1,
      points: hasTagline * 5,  max: 5,
      tip:   'Write a headline on your profile to tell us who you are.',
    },
    {
      done:  hasPrefs   === 1,
      points: hasPrefs   * 5,  max: 5,
      tip:   'Set your budget and music preferences under Preferences.',
    },
    {
      done:  hasCuisines === 1,
      points: hasCuisines * 10, max: 10,
      tip:   'Add your favourite cuisines in the Food & Dining section.',
    },
    {
      done:  hasDining  === 1,
      points: hasDining  * 10, max: 10,
      tip:   'Pick a dining style — casual, fine dining, brunch, and more.',
    },
    {
      done:  hasDietary === 1,
      points: hasDietary * 5,  max: 5,
      tip:   'Let us know your dietary needs so we only show relevant spots.',
    },
    {
      done:  userVibes >= 4,
      points: Math.min(userVibes * 5, 20), max: 20,
      tip:   'Add more vibes to your profile — the more the better.',
    },
    {
      done:  userHoods >= 3,
      points: Math.min(userHoods * 5, 15), max: 15,
      tip:   'Add more neighbourhoods you love to explore.',
    },
    {
      done:  userSaved >= 5,
      points: Math.min(userSaved * 2, 10), max: 10,
      tip:   'Save places you like — it helps us learn your taste.',
    },
    {
      done:  userVisits >= 5,
      points: Math.min(userVisits * 2, 10), max: 10,
      tip:   "Log visits when you go somewhere — tap \"I went here\" on any place.",
    },
    {
      done:  userLists >= 1,
      points: Math.min(userLists * 5, 5),   max: 5,
      tip:   'Create your first list in the Saved tab.',
    },
  ]

  const totalScore  = Math.min(100, scoreItems.reduce((sum, s) => sum + s.points, 0))
  const nextTip     = scoreItems.find(s => !s.done)?.tip || null

  const scoreLabel =
    totalScore === 100 ? 'Fully personalized 🎉' :
    totalScore >= 60   ? 'Looking great' :
    totalScore >= 30   ? 'Good start' :
                         'Just getting started'

  const stats = [
    { label: 'Places saved',  value: String(savedList.length) },
    { label: 'Lists created', value: String((collections || []).length) },
    { label: 'Visits logged', value: String(visitLog.length) },
  ]

  const visitCounts = visitLog.reduce((acc, v) => {
    acc[v.name] = (acc[v.name] || 0) + 1
    return acc
  }, {})
  const visitedPlaces = Object.entries(visitCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const foodPrefs = profile.foodPrefs || {}

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {showVibeEdit && (
        <VibeEditModal
          current={profile.vibes}
          onSave={v => saveWithFeedback('vibes', v, 'Vibe profile')}
          onClose={() => setShowVibeEdit(false)}
        />
      )}
      {showNeighEdit && (
        <NeighborhoodModal
          current={profile.neighborhoods}
          onSave={v => saveWithFeedback('neighborhoods', v, 'Neighborhoods')}
          onClose={() => setShowNeighEdit(false)}
        />
      )}
      {showPrefsEdit && (
        <PreferencesModal
          current={profile.prefs}
          onSave={v => saveWithFeedback('prefs', v, 'Preferences')}
          onClose={() => setShowPrefsEdit(false)}
        />
      )}
      {showFoodEdit && (
        <FoodPrefsModal
          current={foodPrefs}
          onSave={saveFoodPrefs}
          onClose={() => setShowFoodEdit(false)}
        />
      )}
      {/* ── Header ── */}
      <div className="bg-black text-white px-5 pt-4 pb-6 shrink-0">
        <div className="flex justify-between text-xs text-gray-400 mb-4">
          <span>{time}</span><span>Profile</span>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 flex items-center justify-center bg-white/10 rounded-2xl text-3xl shrink-0">
            👤
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{profile.name}</h2>
            {editingTagline ? (
              <div className="mt-1.5 flex flex-col gap-2">
                <input
                  ref={taglineRef}
                  className="bg-white/10 text-white text-sm rounded-xl px-3 py-2 outline-none placeholder-gray-500 w-full"
                  placeholder="e.g. Rooftop chaser & cocktail lover"
                  value={taglineDraft}
                  onChange={e => setTaglineDraft(e.target.value)}
                  onKeyDown={handleTaglineKey}
                  maxLength={60}
                />
                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-white text-black text-xs font-semibold py-1.5 rounded-lg"
                    onClick={saveTagline}
                  >Save</button>
                  <button
                    className="flex-1 bg-white/10 text-white text-xs py-1.5 rounded-lg"
                    onClick={cancelTagline}
                  >Cancel</button>
                </div>
                <p className="text-xs text-gray-500">{taglineDraft.length}/60</p>
              </div>
            ) : (
              <button
                className="mt-0.5 text-left group flex items-center gap-1.5"
                onClick={startEditTagline}
              >
                <p className={`text-sm leading-snug ${profile.tagline ? 'text-gray-300' : 'text-gray-500 italic'}`}>
                  {displayTagline}
                </p>
                <span className="text-gray-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
              </button>
            )}
          </div>
        </div>
        {!profile.tagline && !editingTagline && (
          <button
            className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            onClick={startEditTagline}
          >+ Add your headline</button>
        )}
      </div>
      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
        {savedMsg && (
          <div className="bg-green-50 text-green-700 text-sm rounded-xl px-4 py-2">{savedMsg} ✓</div>
        )}
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
        {/* Vibe profile */}
        <section className="bg-white rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Your vibe profile</h3>
            <button
              className="text-xs font-medium text-gray-500 hover:text-black transition-colors"
              onClick={() => setShowVibeEdit(true)}
            >Edit</button>
          </div>
          {profile.vibes.length === 0 ? (
            <p className="text-xs text-gray-400">No vibes yet. Tap Edit to add some!</p>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {profile.vibes.map(t => (
                <span key={t} className="text-xs bg-black text-white px-3 py-1 rounded-full">{t}</span>
              ))}
            </div>
          )}
        </section>
        {/* Food & Dining */}
        <section className="bg-white rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Food & dining</h3>
              <p className="text-xs text-gray-400 mt-0.5">Shapes your food recommendations</p>
            </div>
            <button
              className="text-xs font-medium text-gray-500 hover:text-black transition-colors shrink-0"
              onClick={() => setShowFoodEdit(true)}
            >{foodPrefs.cuisines?.length ? 'Edit' : '+ Add'}</button>
          </div>
          {!foodPrefs.cuisines?.length && !foodPrefs.diningStyle && !foodPrefs.dietary?.length ? (
            <button
              className="w-full border border-dashed border-gray-200 rounded-2xl py-4 text-center"
              onClick={() => setShowFoodEdit(true)}
            >
              <p className="text-sm font-medium text-gray-500">Add your food preferences</p>
              <p className="text-xs text-gray-400 mt-1">Cuisines, dining style, dietary needs</p>
            </button>
          ) : (
            <div className="space-y-3">
              {foodPrefs.cuisines?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Favourite cuisines</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {foodPrefs.cuisines.map(c => (
                      <span key={c} className="text-xs bg-black text-white px-2.5 py-1 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {foodPrefs.diningStyle && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Dining style</span>
                  <span className="text-gray-800 font-medium capitalize">
                    {foodPrefs.diningStyle.replace('-', ' ')}
                  </span>
                </div>
              )}
              {foodPrefs.dietary?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Dietary needs</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {foodPrefs.dietary.map(d => (
                      <span key={d} className="text-xs border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full">{d}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
        {/* Neighborhoods */}
        <section className="bg-white rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Preferred neighborhoods</h3>
            <button
              className="text-xs font-medium text-gray-500 hover:text-black transition-colors"
              onClick={() => setShowNeighEdit(true)}
            >Update</button>
          </div>
          {profile.neighborhoods.length === 0 ? (
            <p className="text-xs text-gray-400">No neighborhoods yet. Tap Update to add some!</p>
          ) : (
            <div className="space-y-2">
              {profile.neighborhoods.map(n => (
                <div key={n} className="flex justify-between items-center text-sm py-1">
                  <span className="text-gray-800">{n}</span>
                  <span>📍</span>
                </div>
              ))}
            </div>
          )}
        </section>
        {/* Preferences */}
        <section className="bg-white rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Preferences</h3>
            <button
              className="text-xs font-medium text-gray-500 hover:text-black transition-colors"
              onClick={() => setShowPrefsEdit(true)}
            >Manage</button>
          </div>
          <div className="space-y-2">
            {[
              ['Budget',           profile.prefs.budget],
              ['Going out style',  profile.prefs.style],
              ['Music preference', profile.prefs.music],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-400">{k}</span>
                <span className="text-gray-800 font-medium text-right max-w-[60%]">{v}</span>
              </div>
            ))}
          </div>
        </section>
        {/* Visit log */}
        {visitedPlaces.length > 0 && (
          <section className="bg-white rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Visit log</h3>
              <span className="text-xs text-gray-400">{visitLog.length} total</span>
            </div>
            <div className="space-y-2">
              {visitedPlaces.map(([name, count]) => (
                <div key={name} className="flex justify-between items-center">
                  <span className="text-sm text-gray-800">{name}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                    {count}x
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* ── Personalization score — clean, no pts list ── */}
        <div className="bg-black text-white rounded-2xl p-4">
          <div className="flex justify-between items-start mb-1">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Personalization score</p>
              <h3 className="text-3xl font-bold">{totalScore}%</h3>
              <p className="text-xs text-gray-400 mt-0.5">{scoreLabel}</p>
            </div>
            <span className="text-2xl shrink-0">✨</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-white/20 rounded-full mt-3 mb-4">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${totalScore}%` }}
            />
          </div>
          {/* Single actionable tip — or celebration if 100% */}
          {totalScore === 100 ? (
            <p className="text-xs text-gray-300 leading-relaxed">
              Your profile is fully set up. Recommendations are as tailored as they can get!
            </p>
          ) : nextTip ? (
            <div className="flex items-start gap-2">
              <span className="text-sm shrink-0 mt-0.5">💡</span>
              <p className="text-xs text-gray-300 leading-relaxed">{nextTip}</p>
            </div>
          ) : null}
        </div>
        {/* Reset */}
        <div className="pb-2">
          {confirmReset ? (
            <div className="bg-white rounded-2xl p-4 border border-red-100">
              <p className="text-sm text-gray-700 mb-3">
                This will erase all your saved places, collections, and profile data. Are you sure?
              </p>
              <div className="flex gap-2">
                <button
                  className="flex-1 bg-red-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-red-600 transition-colors"
                  onClick={handleReset}
                >Yes, reset everything</button>
                <button
                  className="flex-1 border border-gray-200 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                  onClick={() => setConfirmReset(false)}
                >Cancel</button>
              </div>
            </div>
          ) : (
            <button
              className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors py-2"
              onClick={handleReset}
            >Reset app &amp; start over</button>
          )}
        </div>
      </div>
    </div>
  )
}